import { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { getToday } from '@/utils/dateUtils';
import { OnboardingPage } from './OnboardingPage';

interface DateSelectPageProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
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

export function DateSelectPage({
  selectedDate,
  onDateChange,
}: DateSelectPageProps) {
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
      title={t('onboarding.page3.title')}
      subtitle={t('onboarding.page3.subtitle')}
    >
      <View className="flex-1">
        {/* Last dose date */}
        <View className="mb-4">
          <Text className="mb-3 text-sm font-medium text-gray-600">
            {t('onboarding.page3.lastDoseDate')}
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

        {/* Hint text */}
        <View className="mb-6 flex-row items-start rounded-xl bg-orange-50 p-4">
          <Ionicons name="information-circle" size={20} color="#F97316" />
          <Text className="ml-2 flex-1 text-sm text-orange-700">
            {t('onboarding.page3.cycleStartHint')}
          </Text>
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
      </View>
    </OnboardingPage>
  );
}
