import { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
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
      title={t('onboarding.page4.title')}
      subtitle={t('onboarding.page4.subtitle')}
    >
      <View className="flex-1">
        {/* Illustration */}
        <View className="mb-8 items-center">
          <View className="h-32 w-32 items-center justify-center rounded-full bg-green-50">
            <Ionicons name="sparkles" size={64} color="#22C55E" />
          </View>
        </View>

        {/* Description */}
        <View className="mb-6 rounded-xl bg-gray-50 p-4">
          <Text className="text-center text-gray-600">
            {t('onboarding.page4.description')}
          </Text>
        </View>

        {/* Toggle */}
        <View className="flex-row items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-4">
          <View className="flex-1 flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Ionicons name="sparkles" size={20} color="#22C55E" />
            </View>
            <Text className="font-semibold text-gray-800">
              {t('onboarding.page4.enableReminder')}
            </Text>
          </View>
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
              {t('onboarding.page4.reminderTime')}
            </Text>
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              className="flex-row items-center justify-between rounded-xl border-2 border-gray-200 bg-gray-50 p-4"
            >
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={20} color="#666666" />
                <Text className="ml-2 text-base text-gray-800">
                  {formatTime(time.hour, time.minute, isKorean)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
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
        <View className="mt-6 flex-row items-center justify-center">
          <Ionicons name="information-circle-outline" size={16} color="#888888" />
          <Text className="ml-1 text-sm text-gray-500">
            {t('onboarding.page4.hint')}
          </Text>
        </View>
      </View>
    </OnboardingPage>
  );
}
