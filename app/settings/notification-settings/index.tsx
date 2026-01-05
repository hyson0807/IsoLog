import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { useMedicationContext } from '@/contexts/MedicationContext';
import { formatTime } from '@/utils/timeFormat';
import { getUpcomingMedicationDays } from '@/utils/dateUtils';
import { scheduleUpcomingReminders } from '@/services/notificationService';
import { frequencyOptions } from '@/constants/frequency';
import {
  MasterToggle,
  NotificationItem,
  TimeSettingRow,
  NotificationTimeBottomSheet,
} from '@lib/features/notification-settings';

type TimePickerType = 'medication' | 'skinCondition' | null;

export default function NotificationSettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isKorean = i18n.language === 'ko';

  const {
    notificationEnabled,
    notificationTime,
    medicationReminderEnabled,
    skinConditionReminderEnabled,
    skinConditionReminderTime,
    handleMasterToggle,
    setNotificationTime,
    setMedicationReminderEnabled,
    setSkinConditionReminderEnabled,
    setSkinConditionReminderTime,
  } = useNotificationSettings();

  const { schedule, takenDates } = useMedicationContext();

  const [activeTimePicker, setActiveTimePicker] = useState<TimePickerType>(null);

  // 복용 리마인더 시간 선택
  const handleMedicationTimePress = () => {
    if (!notificationEnabled || !medicationReminderEnabled) return;
    setActiveTimePicker('medication');
  };

  // 피부 상태 리마인더 시간 선택
  const handleSkinConditionTimePress = () => {
    if (!notificationEnabled || !skinConditionReminderEnabled) return;
    setActiveTimePicker('skinCondition');
  };

  const handleTimeSave = async (hour: number, minute: number) => {
    if (activeTimePicker === 'medication') {
      setNotificationTime(hour, minute);
      // 복용 알림 즉시 리스케줄링
      if (notificationEnabled && medicationReminderEnabled && schedule.frequency !== 'none') {
        const frequencyDays = frequencyOptions.find(
          (opt) => opt.type === schedule.frequency
        )?.days || 1;
        const upcomingDays = getUpcomingMedicationDays(
          schedule.referenceDate,
          frequencyDays,
          7
        );
        await scheduleUpcomingReminders(
          upcomingDays,
          takenDates,
          true,
          hour,
          minute,
          true
        );
      }
    } else if (activeTimePicker === 'skinCondition') {
      setSkinConditionReminderTime(hour, minute);
    }
    setActiveTimePicker(null);
    Alert.alert(
      t('common.done'),
      `${t('notification.time')}: ${formatTime(hour, minute, isKorean)}`
    );
  };

  const getCurrentTimePickerValues = () => {
    if (activeTimePicker === 'medication') {
      return { hour: notificationTime.hour, minute: notificationTime.minute };
    }
    return { hour: skinConditionReminderTime.hour, minute: skinConditionReminderTime.minute };
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* 헤더 */}
      <View className="flex-row items-center border-b border-gray-100 bg-white px-5 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="arrow-back" size={24} color="#666666" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">
          {t('notificationSettings.title')}
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 전체 알림 토글 */}
        <MasterToggle enabled={notificationEnabled} onToggle={handleMasterToggle} />

        {/* 서브 알림 섹션 */}
        <View className="px-5 pt-6">
          <Text className="mb-3 text-sm font-medium text-gray-500">
            {t('notificationSettings.subNotifications')}
          </Text>
          <View className="rounded-xl bg-white">
            {/* 복용 리마인더 */}
            <NotificationItem
              icon="medical"
              iconColor="#3B82F6"
              iconBgClass="bg-blue-100"
              title={t('notification.title')}
              description={t('notification.description')}
              enabled={medicationReminderEnabled}
              onToggle={setMedicationReminderEnabled}
              disabled={!notificationEnabled}
              activeColor="#3B82F6"
              trackActiveColor="#93C5FD"
            >
              <TimeSettingRow
                hour={notificationTime.hour}
                minute={notificationTime.minute}
                onPress={handleMedicationTimePress}
                enabled={notificationEnabled && medicationReminderEnabled}
                activeColor="#3B82F6"
              />
            </NotificationItem>

            {/* 구분선 */}
            <View className="mx-4 h-px bg-gray-100" />

            {/* 피부 상태 기록 리마인더 */}
            <NotificationItem
              icon="sparkles"
              iconColor="#10B981"
              iconBgClass="bg-emerald-100"
              title={t('notification.skinCondition')}
              description={t('notification.skinConditionDesc')}
              enabled={skinConditionReminderEnabled}
              onToggle={setSkinConditionReminderEnabled}
              disabled={!notificationEnabled}
              activeColor="#10B981"
              trackActiveColor="#6EE7B7"
            >
              <TimeSettingRow
                hour={skinConditionReminderTime.hour}
                minute={skinConditionReminderTime.minute}
                onPress={handleSkinConditionTimePress}
                enabled={notificationEnabled && skinConditionReminderEnabled}
                activeColor="#10B981"
              />
            </NotificationItem>
          </View>
        </View>

        {/* 안내 문구 */}
        <View className="px-5 pt-4">
          <Text className="text-xs text-gray-400">
            {t('notificationSettings.hint')}
          </Text>
        </View>
      </ScrollView>

      {/* 시간 선택 바텀시트 */}
      <NotificationTimeBottomSheet
        visible={activeTimePicker !== null}
        currentHour={getCurrentTimePickerValues().hour}
        currentMinute={getCurrentTimePickerValues().minute}
        onSave={handleTimeSave}
        onClose={() => setActiveTimePicker(null)}
      />
    </SafeAreaView>
  );
}
