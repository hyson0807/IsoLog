import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header, WarningConfirmModal, DrawerMenu } from '@/components/common';
import {
  StatusCard,
  MedicationButton,
  FrequencySettingButton,
  FrequencyBottomSheet,
} from '@/components/home';
import { useMedicationContext } from '@/contexts/MedicationContext';
import { useMedicationReminder } from '@/hooks/useMedicationReminder';
import { getToday } from '@/utils/dateUtils';

export default function HomeScreen() {
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const today = getToday();

  const {
    schedule,
    todayStatus,
    toggleMedication,
    updateFrequency,
    getDrinkingWarningLevel,
  } = useMedicationContext();

  // 복용 알림 관리 (프리미엄 기능)
  const { handleMedicationToggle } = useMedicationReminder();

  const hasTakenToday = todayStatus.hasTakenToday;
  const todayWarningLevel = getDrinkingWarningLevel(today);

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

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Header onMenuPress={() => setIsDrawerVisible(true)} />

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
    </SafeAreaView>
  );
}