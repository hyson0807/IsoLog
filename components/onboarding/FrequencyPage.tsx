import { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { FrequencyType } from '@/types/medication';
import { frequencyOptions } from '@/constants/frequency';
import { getToday } from '@/utils/dateUtils';
import { OnboardingPage } from './OnboardingPage';

interface FrequencyPageProps {
  selectedDate: string;
  selectedFrequency: FrequencyType | null;
  onDateChange: (date: string) => void;
  onFrequencyChange: (frequency: FrequencyType) => void;
}

function getRelativeDateText(
  dateString: string,
  today: string,
  t: (key: string) => string
): string | null {
  const targetDate = new Date(dateString + 'T00:00:00');
  const todayDate = new Date(today + 'T00:00:00');
  const diffDays = Math.round(
    (targetDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return t('frequency.today');
  if (diffDays === 1) return t('frequency.tomorrow');
  if (diffDays === -1) return t('frequency.yesterday');
  return null;
}

function formatDisplayDate(dateString: string): string {
  const locale = getLocales()[0]?.languageTag ?? 'en-US';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function FrequencyPage({
  selectedDate,
  selectedFrequency,
  onDateChange,
  onFrequencyChange,
}: FrequencyPageProps) {
  const { t } = useTranslation();
  const today = getToday();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (_event: unknown, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      onDateChange(`${year}-${month}-${day}`);
    }
  };

  const relativeText = getRelativeDateText(selectedDate, today, t);

  return (
    <OnboardingPage
      title={t('onboarding.page2.title')}
      subtitle={t('onboarding.page2.subtitle')}
    >
      <View className="flex-1">
        {/* Last dose date */}
        <View className="mb-6">
          <Text className="mb-3 text-sm font-medium text-gray-600">
            {t('onboarding.page2.lastDoseDate')}
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center rounded-xl border-2 border-gray-200 bg-gray-50 p-4"
          >
            <Ionicons name="calendar-outline" size={20} color="#666666" />
            <Text className="ml-2 flex-1 text-base text-gray-800" numberOfLines={1}>
              {formatDisplayDate(selectedDate)}
            </Text>
            {relativeText && (
              <Text className="text-sm text-orange-500">({relativeText})</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* iOS DatePicker */}
        {Platform.OS === 'ios' && showDatePicker && (
          <View className="mb-4">
            <DateTimePicker
              value={new Date(selectedDate + 'T00:00:00')}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              locale={getLocales()[0]?.languageTag ?? 'en-US'}
              themeVariant="light"
            />
          </View>
        )}

        {/* Android DatePicker */}
        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker
            value={new Date(selectedDate + 'T00:00:00')}
            mode="date"
            display="default"
            onChange={handleDateChange}
            themeVariant="light"
          />
        )}

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
