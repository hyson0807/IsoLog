import { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { OnboardingPage } from './OnboardingPage';
import { formatTime } from '@/utils/timeFormat';

interface SkinReminderPageProps {
  enabled: boolean;
  time: { hour: number; minute: number };
  onEnabledChange: (enabled: boolean) => void;
  onTimeChange: (hour: number, minute: number) => void;
}

export function SkinReminderPage({
  enabled,
  time,
  onEnabledChange,
  onTimeChange,
}: SkinReminderPageProps) {
  const { t, i18n } = useTranslation();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const isKorean = i18n.language === 'ko';

  const handleTimeChange = (_event: unknown, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (date) {
      onTimeChange(date.getHours(), date.getMinutes());
    }
  };

  return (
    <OnboardingPage
      title={t('onboarding.page5.title')}
      subtitle={t('onboarding.page5.subtitle')}
    >
      <View className="flex-1">
        {/* Description */}
        <View className="mb-6">
          <Text className="mb-2 text-base text-gray-600">
            {t('onboarding.page5.description1')}
          </Text>
          <Text className="text-base text-gray-600">
            {t('onboarding.page5.description2')}
          </Text>
        </View>

        {/* Toggle */}
        <View className="flex-row items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-4">
          <Text className="flex-1 font-semibold text-gray-800">
            {t('onboarding.page5.enableReminder')}
          </Text>
          <Switch
            value={enabled}
            onValueChange={onEnabledChange}
            trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
            thumbColor={enabled ? '#22C55E' : '#F3F4F6'}
          />
        </View>

        {/* Time selector */}
        {enabled && (
          <View className="mt-4">
            <Text className="mb-2 text-sm font-medium text-gray-600">
              {t('onboarding.page5.reminderTime')}
            </Text>
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              className="flex-row items-center justify-between rounded-xl border-2 border-gray-200 bg-gray-50 p-4"
            >
              <Text className="text-base text-gray-800">
                {formatTime(time.hour, time.minute, isKorean)}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* iOS TimePicker */}
        {Platform.OS === 'ios' && showTimePicker && (
          <View className="mt-4">
            <DateTimePicker
              value={new Date(2024, 0, 1, time.hour, time.minute)}
              mode="time"
              display="spinner"
              onChange={handleTimeChange}
              themeVariant="light"
            />
          </View>
        )}

        {/* Android TimePicker */}
        {Platform.OS === 'android' && showTimePicker && (
          <DateTimePicker
            value={new Date(2024, 0, 1, time.hour, time.minute)}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}

        {/* Hint */}
        <View className="mt-6">
          <Text className="text-center text-sm text-gray-500">
            {t('onboarding.page5.hint')}
          </Text>
        </View>
      </View>
    </OnboardingPage>
  );
}
