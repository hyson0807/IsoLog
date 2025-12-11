import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrinkingWarningLevel } from '@/types/medication';

interface StatusCardProps {
  isMedicationDay: boolean;
  warningLevel?: DrinkingWarningLevel | null;
}

// 경고 레벨별 메시지
const warningMessages: Record<DrinkingWarningLevel, string> = {
  dday: '오늘 술 약속이 있어요. 복용에 주의하세요!',
  day1: '술 약속 전후 1일입니다. 주의가 필요해요!',
  day2: '술 약속 전후 2일입니다. 주의가 필요해요!',
  day3: '술 약속 전후 3일입니다. 주의하세요.',
  day4: '술 약속 전후 4일입니다.',
};

export function StatusCard({ isMedicationDay, warningLevel }: StatusCardProps) {
  // 경고 상태가 있으면 경고 스타일 우선
  if (warningLevel) {
    return (
      <View className="mx-5 rounded-2xl bg-red-50 p-5">
        <View className="flex-row items-center justify-center">
          <Ionicons name="warning" size={20} color="#DC2626" />
          <Text className="ml-2 text-center text-lg font-semibold text-red-600">
            {warningMessages[warningLevel]}
          </Text>
        </View>
        {isMedicationDay && (
          <Text className="mt-2 text-center text-sm text-red-500">
            간 건강을 위해 휴약을 권장합니다
          </Text>
        )}
      </View>
    );
  }

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