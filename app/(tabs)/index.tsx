import { useState, useRef, useEffect, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
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
import { OnboardingBottomSheet } from '@/components/onboarding/OnboardingBottomSheet';
import { useMedicationContext } from '@/contexts/MedicationContext';
import { usePremiumContext } from '@/contexts/PremiumContext';
import { useMedicationReminder } from '@/hooks/useMedicationReminder';
import { useInterstitialAd } from '@/hooks/useInterstitialAd';
import { useIsAfter21 } from '@/hooks/useIsAfter21';
import { useOnboarding } from '@/hooks/useOnboarding';
import { tryRequestReview } from '@/utils/reviewService';
import { FrequencyType } from '@/types/medication';

export default function HomeScreen() {
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
    updateFrequency,
    getDrinkingWarningLevel,
    getSkinRecord,
    saveSkinRecord,
  } = useMedicationContext();

  // 온보딩 상태 관리
  const { shouldShowOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();

  const { isPremium, notificationEnabled, setNotificationEnabled } =
    usePremiumContext();

  // 복용 알림 관리 (프리미엄 기능)
  const { handleMedicationToggle } = useMedicationReminder();

  // Interstitial 광고
  const { showAd } = useInterstitialAd();

  // 21시 이후 여부 (실시간 업데이트)
  const isAfter21 = useIsAfter21();

  const hasTakenToday = todayStatus.hasTakenToday;
  const todayWarningLevel = getDrinkingWarningLevel(today);

  // 복용 체크 시 스낵바 표시 (무료 유저만)
  useEffect(() => {
    // 초기화 시에는 스킵
    if (prevHasTakenRef.current === null) {
      prevHasTakenRef.current = hasTakenToday;
      return;
    }

    // false → true 변경 시 (복용 체크 완료)
    if (!prevHasTakenRef.current && hasTakenToday && !isPremium) {
      setIsSnackbarVisible(true);
    }

    prevHasTakenRef.current = hasTakenToday;
  }, [hasTakenToday, isPremium]);

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
  const handleNotificationPress = () => {
    if (isPremium) {
      // 프리미엄 유저: 알림 토글
      setNotificationEnabled(!notificationEnabled);
    } else {
      // 무료 유저: Paywall 페이지로 이동
      router.push('/paywall');
    }
  };

  // 피부 기록 완료 후 전면 광고 표시
  const handleSkinRecordComplete = useCallback(() => {
    setTimeout(() => showAd(), 300);
  }, [showAd]);

  // 온보딩 완료 핸들러
  const handleOnboardingComplete = useCallback(
    async (frequency: FrequencyType, startDate: string) => {
      updateFrequency(frequency, startDate);
      await completeOnboarding();
    },
    [updateFrequency, completeOnboarding]
  );

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
          isPremium={isPremium}
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
                if (isAfter21) {
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
              } else if (!isAfter21 || isSkinRecordComplete) {
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
              if (!isAfter21 || isSkinRecordComplete) {
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

      {/* 복용 완료 후 알림 유도 스낵바 (무료 유저만) */}
      <NotificationPromptSnackbar
        visible={isSnackbarVisible}
        onPress={() => router.push('/paywall')}
        onDismiss={() => setIsSnackbarVisible(false)}
      />

      {/* 온보딩 바텀시트 (첫 실행 시) */}
      <OnboardingBottomSheet
        visible={shouldShowOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={skipOnboarding}
      />
    </SafeAreaView>
  );
}