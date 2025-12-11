import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/common';
import {
  StatusCard,
  MedicationButton,
  FrequencySettingButton,
  FrequencyBottomSheet,
} from '@/components/home';
import { useMedicationSchedule } from '@/hooks';

export default function HomeScreen() {
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const {
    schedule,
    todayStatus,
    hasTakenToday,
    toggleTodayMedication,
    updateFrequency,
  } = useMedicationSchedule();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Header />

        <View className="mt-4">
          <StatusCard isMedicationDay={todayStatus.isMedicationDay} />
        </View>

        <View className="flex-1 items-center justify-center">
          <MedicationButton
            hasTaken={hasTakenToday}
            isMedicationDay={todayStatus.isMedicationDay}
            onPress={toggleTodayMedication}
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
    </SafeAreaView>
  );
}