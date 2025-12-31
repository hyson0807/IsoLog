import { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Platform, Alert, Linking } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
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
      title={t('onboarding.page3.title')}
      subtitle={t('onboarding.page3.subtitle')}
    >
      <View className="flex-1">
        {/* Illustration */}
        <View className="mb-8 items-center">
          <View className="h-32 w-32 items-center justify-center rounded-full bg-blue-50">
            <Ionicons name="notifications" size={64} color="#3B82F6" />
          </View>
        </View>

        {/* Description */}
        <View className="mb-6 rounded-xl bg-gray-50 p-4">
          <Text className="text-center text-gray-600">
            {t('onboarding.page3.description')}
          </Text>
        </View>

        {/* Toggle */}
        <View className="flex-row items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-4">
          <View className="flex-1 flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <Ionicons name="medical" size={20} color="#F97316" />
            </View>
            <Text className="font-semibold text-gray-800">
              {t('onboarding.page3.enableReminder')}
            </Text>
          </View>
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
              {t('onboarding.page3.reminderTime')}
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
      </View>
    </OnboardingPage>
  );
}
