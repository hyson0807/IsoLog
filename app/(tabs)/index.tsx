import { useState, useRef, useEffect, useCallback } from 'react';
import { View, ScrollView, Alert, Linking, AppState, type AppStateStatus } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Header,
  WarningConfirmModal,
  DrawerMenu,
  NotificationPromptSnackbar,
} from '@/components/common';
import {
  StatusCard,
  MedicationCheckCard,
  SkinRecordCard,
  DailyTipCard,
} from '@/components/home';
import { useMedicationContext } from '@/contexts/MedicationContext';
import { usePremiumContext } from '@/contexts/PremiumContext';
import { useNotificationSettingsContext } from '@/contexts/NotificationSettingsContext';
import { useMedicationReminder } from '@/hooks/useMedicationReminder';
import { useSkinConditionReminder } from '@/hooks/useSkinConditionReminder';
import { useInterstitialAd } from '@/hooks/useInterstitialAd';
import { useIsAfterHour } from '@/hooks/useIsAfterHour';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useNotificationPermission } from '@/hooks/useNotificationPermission';
import { tryRequestReview } from '@/utils/reviewService';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false);

  // 이전 복용 상태 추적 (스낵바 표시용)
  const prevHasTakenRef = useRef<boolean | null>(null);

  const {
    todayStatus,
    today,
    toggleMedication,
    getDrinkingWarningLevel,
    getSkinRecord,
    saveSkinRecord,
  } = useMedicationContext();

  // 온보딩 상태 관리 - 온보딩 화면으로 리다이렉트
  const { shouldShowOnboarding, isLoading: isOnboardingLoading } = useOnboarding();

  useEffect(() => {
    if (!isOnboardingLoading && shouldShowOnboarding) {
      router.replace('/onboarding');
    }
  }, [isOnboardingLoading, shouldShowOnboarding, router]);

  const { isPremium } = usePremiumContext();
  const {
    notificationEnabled,
    setNotificationEnabled,
    skinConditionReminderEnabled,
    skinConditionReminderTime,
  } = useNotificationSettingsContext();

  // 알림 권한 관리
  const { permissionStatus, requestPermission, recheckPermission } = useNotificationPermission();

  // 앱 상태 추적 (설정에서 돌아왔을 때 권한 재확인용)
  const appState = useRef(AppState.currentState);
  const wasInBackground = useRef(false);

  // 권한 거부 시 설정으로 안내하는 Alert
  const showPermissionDeniedAlert = useCallback(() => {
    Alert.alert(
      t('notification.permissionDeniedTitle'),
      t('notification.permissionDeniedMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('notification.openSettings'),
          onPress: () => Linking.openSettings(),
        },
      ]
    );
  }, [t]);

  // 설정에서 돌아왔을 때 권한 상태 다시 확인
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          wasInBackground.current = true;
          await recheckPermission();
        }
        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [recheckPermission]);

  // 백그라운드에서 돌아온 경우 권한 상태에 따라 알림 토글 자동 조정
  useEffect(() => {
    if (wasInBackground.current) {
      // 권한이 granted로 바뀌면 자동으로 알림 ON
      if (permissionStatus === 'granted' && !notificationEnabled) {
        setNotificationEnabled(true);
      }
      // 권한이 denied로 바뀌면 자동으로 알림 OFF
      if (permissionStatus === 'denied' && notificationEnabled) {
        setNotificationEnabled(false);
      }
      wasInBackground.current = false;
    }
  }, [permissionStatus, notificationEnabled, setNotificationEnabled]);

  // 복용 알림 관리
  const { handleMedicationToggle } = useMedicationReminder();

  // 피부 상태 알림 관리
  useSkinConditionReminder();

  // Interstitial 광고
  const { showAd } = useInterstitialAd();

  // 피부 기록 카드 표시 시간 (알림 OFF면 기본 21시)
  const skinRecordDisplayHour = skinConditionReminderEnabled
    ? skinConditionReminderTime.hour
    : 21;

  // 표시 시간 이후 여부 (실시간 업데이트)
  const isAfterDisplayHour = useIsAfterHour(skinRecordDisplayHour);

  const hasTakenToday = todayStatus.hasTakenToday;
  const todayWarningLevel = getDrinkingWarningLevel(today);

  // 복용 체크 시 스낵바 표시 (알림 미설정 사용자만)
  useEffect(() => {
    // 초기화 시에는 스킵
    if (prevHasTakenRef.current === null) {
      prevHasTakenRef.current = hasTakenToday;
      return;
    }

    // false → true 변경 시 (복용 체크 완료) + 알림 미설정
    if (!prevHasTakenRef.current && hasTakenToday && !notificationEnabled) {
      setIsSnackbarVisible(true);
    }

    prevHasTakenRef.current = hasTakenToday;
  }, [hasTakenToday, notificationEnabled]);

  const handleMedicationPress = async () => {
    // 경고 상태인 경우: 확인 팝업
    if (todayWarningLevel) {
      setIsWarningModalVisible(true);
      return;
    }

    // 일반 상태: 바로 복용 기록
    toggleMedication(today);
    await handleMedicationToggle(today, true); // 복용 체크 → 알림 취소

    // 복용 체크 완료 후 리뷰 요청 (1초 뒤, 조건 충족 시)
    setTimeout(() => tryRequestReview(), 1000);
  };

  // 복용 취소 핸들러 (SkinRecordCard에서 호출)
  const handleCancelMedication = async () => {
    toggleMedication(today);
    await handleMedicationToggle(today, false); // 복용 취소 → 알림 다시 예약
  };

  const handleWarningConfirm = async () => {
    setIsWarningModalVisible(false);
    toggleMedication(today);
    await handleMedicationToggle(today, true); // 복용 체크 → 알림 취소

    // 복용 체크 완료 후 리뷰 요청 (1초 뒤, 조건 충족 시)
    setTimeout(() => tryRequestReview(), 1000);
  };

  // 알림 아이콘 클릭 핸들러
  const handleNotificationPress = async () => {
    // 알림 OFF로 변경하는 경우 → 권한과 관계없이 항상 허용
    if (notificationEnabled) {
      setNotificationEnabled(false);
      return;
    }

    // 알림 ON으로 변경하려는 경우 → 권한 체크 필요
    // 권한이 명시적으로 거부된 상태면 설정으로 안내
    if (permissionStatus === 'denied') {
      showPermissionDeniedAlert();
      return;
    }

    // 아직 요청 안 한 상태면 권한 요청 후 켜기
    const granted = await requestPermission();
    if (granted) {
      setNotificationEnabled(true);
    }
  };

  // 피부 기록 완료 후 전면 광고 표시
  const handleSkinRecordComplete = useCallback(() => {
    setTimeout(() => showAd(), 300);
  }, [showAd]);

  // 스낵바 버튼 클릭 시 알림 활성화
  const handleSnackbarPress = useCallback(async () => {
    // 권한이 명시적으로 거부된 상태면 설정으로 안내
    if (permissionStatus === 'denied') {
      showPermissionDeniedAlert();
      return;
    }

    // 권한 요청
    const granted = await requestPermission();
    if (granted) {
      setNotificationEnabled(true);
    } else {
      // 권한 요청이 거부되면 설정으로 안내
      showPermissionDeniedAlert();
    }
  }, [permissionStatus, requestPermission, setNotificationEnabled, showPermissionDeniedAlert]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Header
          today={today}
          onMenuPress={() => setIsDrawerVisible(true)}
          notificationEnabled={notificationEnabled}
          onNotificationPress={handleNotificationPress}
        />

        <View className="mt-4">
          <StatusCard
            isMedicationDay={todayStatus.isMedicationDay}
            warningLevel={todayWarningLevel}
          />
        </View>

        <View className="flex-1 items-center justify-start mt-4">
          {(() => {
            const skinRecord = getSkinRecord(today);
            const isSkinRecordComplete = skinRecord?.trouble && skinRecord?.dryness;
            const isMedicationDay = todayStatus.isMedicationDay;

            if (isMedicationDay) {
              // 복용일
              if (!hasTakenToday) {
                // 미복용
                if (isAfterDisplayHour) {
                  // 21시 이후: 복용 카드 + (피부기록 카드 or 팁 카드)
                  return (
                    <View className="w-full">
                      <View className="mb-4 px-6">
                        <MedicationCheckCard
                          warningLevel={todayWarningLevel}
                          onPress={handleMedicationPress}
                        />
                      </View>
                      {isSkinRecordComplete ? (
                        <DailyTipCard />
                      ) : (
                        <SkinRecordCard
                          date={today}
                          existingRecord={skinRecord}
                          onSave={saveSkinRecord}
                          onComplete={handleSkinRecordComplete}
                        />
                      )}
                    </View>
                  );
                } else {
                  // 21시 전: 복용 카드 + 팁 카드
                  return (
                    <View className="w-full">
                      <View className="mb-4 px-6">
                        <MedicationCheckCard
                          warningLevel={todayWarningLevel}
                          onPress={handleMedicationPress}
                        />
                      </View>
                      <DailyTipCard />
                    </View>
                  );
                }
              } else if (!isAfterDisplayHour || isSkinRecordComplete) {
                // 복용완료 + (21시 전 OR 피부기록 완료)
                return <DailyTipCard />;
              } else {
                // 복용완료 + 21시 이후 + 피부기록 미완료
                return (
                  <SkinRecordCard
                    date={today}
                    existingRecord={skinRecord}
                    onSave={saveSkinRecord}
                    onComplete={handleSkinRecordComplete}
                    onCancel={handleCancelMedication}
                  />
                );
              }
            } else {
              // 휴약일
              if (!isAfterDisplayHour || isSkinRecordComplete) {
                // 21시 전 OR 피부기록 완료
                return <DailyTipCard />;
              } else {
                // 21시 이후 + 피부기록 미완료
                return (
                  <SkinRecordCard
                    date={today}
                    existingRecord={skinRecord}
                    onSave={saveSkinRecord}
                    onComplete={handleSkinRecordComplete}
                    isRestDay
                  />
                );
              }
            }
          })()}
        </View>
      </ScrollView>

      {/* 경고 확인 팝업 */}
      <WarningConfirmModal
        visible={isWarningModalVisible}
        onConfirm={handleWarningConfirm}
        onCancel={() => setIsWarningModalVisible(false)}
      />

      {/* 사이드 드로어 메뉴 */}
      <DrawerMenu
        visible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
      />

      {/* 복용 완료 후 알림 유도 스낵바 (알림 미설정 사용자) */}
      <NotificationPromptSnackbar
        visible={isSnackbarVisible}
        onPress={handleSnackbarPress}
        onDismiss={() => setIsSnackbarVisible(false)}
      />
    </SafeAreaView>
  );
}