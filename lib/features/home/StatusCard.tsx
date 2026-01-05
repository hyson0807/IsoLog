import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { DrinkingWarningLevel } from '@/types/medication';

interface StatusCardProps {
  isMedicationDay: boolean;
  warningLevel?: DrinkingWarningLevel | null;
}

export function StatusCard({ isMedicationDay, warningLevel }: StatusCardProps) {
  const { t } = useTranslation();

  // 경고 상태가 있으면 경고 스타일 우선
  if (warningLevel) {
    return (
      <View className="mx-5 rounded-2xl bg-red-50 p-5">
        <View className="flex-row items-center justify-center">
          <Ionicons name="warning" size={20} color="#DC2626" />
          <Text className="ml-2 text-center text-lg font-semibold text-red-600">
            {t(`home.warning.${warningLevel}`)}
          </Text>
        </View>
        {isMedicationDay && (
          <Text className="mt-2 text-center text-sm text-red-500">
            {t('home.restRecommend')}
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
        {isMedicationDay ? t('home.medicationDay') : t('home.restDay')}
      </Text>
    </View>
  );
}
