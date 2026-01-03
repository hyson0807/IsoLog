import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { FrequencyType } from '@/types/medication';
import { frequencyOptions } from '@/constants/frequency';
import { OnboardingPage } from './OnboardingPage';

interface FrequencyPageProps {
  selectedFrequency: FrequencyType | null;
  onFrequencyChange: (frequency: FrequencyType) => void;
}

export function FrequencyPage({
  selectedFrequency,
  onFrequencyChange,
}: FrequencyPageProps) {
  const { t } = useTranslation();

  return (
    <OnboardingPage
      title={t('onboarding.page2.title')}
      subtitle={t('onboarding.page2.subtitle')}
    >
      <View className="flex-1">
        {/* Frequency selection */}
        <View>
          <Text className="mb-3 text-sm font-medium text-gray-600">
            {t('onboarding.page2.selectFrequency')}
          </Text>
          <View className="gap-3">
            {frequencyOptions.map((option) => {
              const isSelected = option.type === selectedFrequency;
              return (
                <TouchableOpacity
                  key={option.type}
                  onPress={() => onFrequencyChange(option.type)}
                  className={`flex-row items-center rounded-xl border-2 p-4 ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <View
                    className={`mr-4 h-6 w-6 items-center justify-center rounded-full ${
                      isSelected ? 'bg-orange-500' : 'border-2 border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`font-semibold ${
                        isSelected ? 'text-orange-600' : 'text-gray-800'
                      }`}
                    >
                      {t(`frequency.${option.type}.label`)}
                    </Text>
                    <Text className="mt-1 text-sm text-gray-500">
                      {t(`frequency.${option.type}.description`)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </OnboardingPage>
  );
}
