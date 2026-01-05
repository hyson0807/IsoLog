import { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Platform, Alert, Linking } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { requestNotificationPermission, getDetailedPermissionStatus } from '@/services/notificationService';
import { OnboardingPage } from './OnboardingPage';
import { formatTime } from '@/utils/timeFormat';

interface MedicationReminderPageProps {
  enabled: boolean;
  time: { hour: number; minute: number };
  onEnabledChange: (enabled: boolean) => void;
  onTimeChange: (hour: number, minute: number) => void;
}

export function MedicationReminderPage({
  enabled,
  time,
  onEnabledChange,
  onTimeChange,
}: MedicationReminderPageProps) {
  const { t, i18n } = useTranslation();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const isKorean = i18n.language === 'ko';

  const handleToggle = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        const status = await getDetailedPermissionStatus();
        if (status === 'denied') {
          Alert.alert(
            t('notification.permissionDeniedTitle'),
            t('notification.permissionDeniedMessage'),
            [
              { text: t('common.cancel'), style: 'cancel' },
              {
                text: t('notification.openSettings'),
                onPress: () => Linking.openSettings(),
              },
            ]
          );
          return;
        }
      }
    }
    onEnabledChange(value);
  };

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
        {/* Description */}
        <View className="mb-6">
          <Text className="mb-2 text-base text-gray-600">
            {t('onboarding.page4.description1')}
          </Text>
          <Text className="text-base text-gray-600">
            {t('onboarding.page4.description2')}
          </Text>
        </View>

        {/* Toggle */}
        <View className="flex-row items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-4">
          <Text className="flex-1 font-semibold text-gray-800">
            {t('onboarding.page4.enableReminder')}
          </Text>
          <Switch
            value={enabled}
            onValueChange={handleToggle}
            trackColor={{ false: '#D1D5DB', true: '#FDBA74' }}
            thumbColor={enabled ? '#F97316' : '#F3F4F6'}
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
      </View>
    </OnboardingPage>
  );
}
