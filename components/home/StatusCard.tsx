import { View, Text } from 'react-native';

interface StatusCardProps {
  isMedicationDay: boolean;
}

export function StatusCard({ isMedicationDay }: StatusCardProps) {
  return (
    <View
      className={`mx-5 rounded-2xl p-5 ${
        isMedicationDay ? 'bg-orange-50' : 'bg-gray-50'
      }`}
    >
      <Text
        className={`text-center text-lg font-semibold ${
          isMedicationDay ? 'text-orange-600' : 'text-gray-600'
        }`}
      >
        {isMedicationDay
          ? '오늘은 약 먹는 날이에요! 💊'
          : '오늘은 쉬는 날입니다. 피부도 쉬어가요 🌿'}
      </Text>
    </View>
  );
}