import { useState, useRef, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Header,
  WarningConfirmModal,
  DrawerMenu,
  PaywallModal,
  NotificationPromptSnackbar,
} from '@/components/common';
import {
  StatusCard,
  MedicationButton,
  FrequencySettingButton,
  FrequencyBottomSheet,
} from '@/components/home';
import { useMedicationContext } from '@/contexts/MedicationContext';
import { usePremiumContext } from '@/contexts/PremiumContext';
import { useMedicationReminder } from '@/hooks/useMedicationReminder';
import { getToday } from '@/utils/dateUtils';

export default function HomeScreen() {
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isPaywallVisible, setIsPaywallVisible] = useState(false);
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false);
  const today = getToday();

  // 이전 복용 상태 추적 (스낵바 표시용)
  const prevHasTakenRef = useRef<boolean | null>(null);

  const {
    schedule,
    todayStatus,
    toggleMedication,
    updateFrequency,
    getDrinkingWarningLevel,
  } = useMedicationContext();

  const { isPremium, notificationEnabled, setNotificationEnabled } =
    usePremiumContext();

  // 복용 알림 관리 (프리미엄 기능)
  const { handleMedicationToggle } = useMedicationReminder();

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
    // 이미 복용한 경우: 바로 토글 (취소)
    if (hasTakenToday) {
      toggleMedication(today);
      await handleMedicationToggle(today, false); // 복용 취소 → 알림 다시 예약
      return;
    }

    // 경고 상태인 경우: 확인 팝업
    if (todayWarningLevel) {
      setIsWarningModalVisible(true);
      return;
    }

    // 일반 상태: 바로 복용 기록
    toggleMedication(today);
    await handleMedicationToggle(today, true); // 복용 체크 → 알림 취소
  };

  const handleWarningConfirm = async () => {
    setIsWarningModalVisible(false);
    toggleMedication(today);
    await handleMedicationToggle(today, true); // 복용 체크 → 알림 취소
  };

  // 알림 아이콘 클릭 핸들러
  const handleNotificationPress = () => {
    if (isPremium) {
      // 프리미엄 유저: 알림 토글
      setNotificationEnabled(!notificationEnabled);
    } else {
      // 무료 유저: Paywall 표시
      setIsPaywallVisible(true);
    }
  };

  // Paywall 구매 버튼 핸들러
  const handlePurchase = () => {
    setIsPaywallVisible(false);
    // TODO: RevenueCat 결제 로직
    Alert.alert('준비 중', '인앱 결제 기능을 준비 중입니다.');
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Header
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

        <View className="flex-1 items-center justify-center">
          <MedicationButton
            hasTaken={hasTakenToday}
            isMedicationDay={todayStatus.isMedicationDay}
            warningLevel={todayWarningLevel}
            onPress={handleMedicationPress}
          />
        </View>

        <View className="mb-8">
          <FrequencySettingButton
            currentFrequency={schedule.frequency}
            onPress={() => setIsBottomSheetVisible(true)}
          />
        </View>
      </ScrollView>

      <FrequencyBottomSheet
        visible={isBottomSheetVisible}
        currentFrequency={schedule.frequency}
        onSelect={(frequency) => {
          updateFrequency(frequency);
        }}
        onClose={() => setIsBottomSheetVisible(false)}
      />

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

      {/* 프리미엄 결제 팝업 */}
      <PaywallModal
        visible={isPaywallVisible}
        onClose={() => setIsPaywallVisible(false)}
        onPurchase={handlePurchase}
      />

      {/* 복용 완료 후 알림 유도 스낵바 (무료 유저만) */}
      <NotificationPromptSnackbar
        visible={isSnackbarVisible}
        onPress={() => setIsPaywallVisible(true)}
        onDismiss={() => setIsSnackbarVisible(false)}
      />
    </SafeAreaView>
  );
}