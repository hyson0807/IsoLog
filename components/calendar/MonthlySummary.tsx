import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

interface MonthlySummaryProps {
  takenCount: number;
}

export function MonthlySummary({ takenCount }: MonthlySummaryProps) {
  const { t } = useTranslation();

  return (
    <View className="mx-5 mt-4 rounded-2xl bg-orange-50 p-4">
      <Text className="text-center text-base font-semibold text-orange-600">
        {t('calendar.summary', { count: takenCount })}
      </Text>
    </View>
  );
}
