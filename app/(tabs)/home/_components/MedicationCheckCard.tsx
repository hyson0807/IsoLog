import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { DrinkingWarningLevel } from '@/types/medication';

interface MedicationCheckCardProps {
  warningLevel?: DrinkingWarningLevel | null;
  onPress: () => void;
}

export function MedicationCheckCard({
  warningLevel,
  onPress,
}: MedicationCheckCardProps) {
  const { t } = useTranslation();
  const isWarning = !!warningLevel;

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      className={`flex-row items-center rounded-2xl p-4 ${
        isWarning
          ? 'border-2 border-red-300 bg-red-50'
          : 'border border-gray-100 bg-gray-50'
      }`}
    >
      <View className="flex-1">
        <Text
          className={`text-base font-semibold ${
            isWarning ? 'text-red-700' : 'text-gray-800'
          }`}
        >
          {t('home.checkCardTitle')}
        </Text>
        <Text
          className={`mt-0.5 text-sm ${
            isWarning ? 'text-red-500' : 'text-gray-500'
          }`}
        >
          {isWarning ? t('home.drinkingPeriod') : t('home.checkCardDesc')}
        </Text>
      </View>
      <Ionicons
        name="square-outline"
        size={24}
        color={isWarning ? '#DC2626' : '#9CA3AF'}
      />
    </TouchableOpacity>
  );
}
