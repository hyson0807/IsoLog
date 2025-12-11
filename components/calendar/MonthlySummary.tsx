import { View, Text } from 'react-native';

interface MonthlySummaryProps {
  takenCount: number;
}

export function MonthlySummary({ takenCount }: MonthlySummaryProps) {
  return (
    <View className="mx-5 mt-4 rounded-2xl bg-orange-50 p-4">
      <Text className="text-center text-base font-semibold text-orange-600">
        이번 달은 <Text className="text-lg">{takenCount}번</Text> 복용했어요.
      </Text>
    </View>
  );
}
