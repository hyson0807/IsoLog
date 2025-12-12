import { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { usePremiumContext } from '@/contexts/PremiumContext';
import { useNotificationPermission } from '@/hooks/useNotificationPermission';
import { NotificationTimeBottomSheet } from './NotificationTimeBottomSheet';

interface NotificationToggleProps {
  onPremiumRequired: () => void;
}

// 시간 포맷 함수
function formatTime(hour: number, minute: number, isKorean: boolean): string {
  if (isKorean) {
    const period = hour < 12 ? '오전' : '오후';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${period} ${displayHour}:${displayMinute}`;
  } else {
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  }
}

export function NotificationToggle({ onPremiumRequired }: NotificationToggleProps) {
  const { t, i18n } = useTranslation();
  const {
    isPremium,
    notificationEnabled,
    setNotificationEnabled,
    notificationTime,
    setNotificationTime,
  } = usePremiumContext();
  const { hasPermission, requestPermission } = useNotificationPermission();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const isKorean = i18n.language === 'ko';

  const handleToggle = async () => {
    if (!isPremium) {
      onPremiumRequired();
      return;
    }

    // 알림 권한이 없으면 먼저 요청
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        return;
      }
    }

    setNotificationEnabled(!notificationEnabled);
  };

  const handleTimePress = () => {
    if (!isPremium) {
      onPremiumRequired();
      return;
    }
    setShowTimePicker(true);
  };

  const handleTimeSave = (hour: number, minute: number) => {
    setNotificationTime(hour, minute);
    setShowTimePicker(false);
    Alert.alert(
      t('common.done'),
      `${t('notification.time')}: ${formatTime(hour, minute, isKorean)}`
    );
  };

  const isEnabled = isPremium && notificationEnabled;
  const isLocked = !isPremium;

  return (
    <>
      <View className="rounded-xl bg-white px-4 py-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handleToggle}
            activeOpacity={0.7}
            className="flex-1 flex-row items-center"
          >
            <View
              className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${
                isLocked ? 'bg-gray-100' : 'bg-orange-100'
              }`}
            >
              <Ionicons
                name={isLocked ? 'lock-closed' : 'notifications'}
                size={20}
                color={isLocked ? '#9CA3AF' : '#F97316'}
              />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text
                  className={`text-base font-medium ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}
                >
                  {t('notification.title')}
                </Text>
                {isLocked && (
                  <View className="ml-2 rounded-full bg-orange-100 px-2 py-0.5">
                    <Text className="text-xs font-medium text-orange-600">{t('premium.pro')}</Text>
                  </View>
                )}
              </View>
              <Text className={`mt-0.5 text-sm ${isLocked ? 'text-gray-300' : 'text-gray-500'}`}>
                {t('notification.description')}
              </Text>
            </View>
          </TouchableOpacity>
          <Switch
            value={isEnabled}
            onValueChange={handleToggle}
            disabled={isLocked}
            trackColor={{ false: '#E5E7EB', true: '#FDBA74' }}
            thumbColor={isEnabled ? '#F97316' : '#F3F4F6'}
            ios_backgroundColor="#E5E7EB"
          />
        </View>

        {/* 시간 설정 행 */}
        <TouchableOpacity
          onPress={handleTimePress}
          activeOpacity={0.7}
          className="mt-3 flex-row items-center justify-between border-t border-gray-100 pt-3"
        >
          <Text className={`text-sm ${isLocked ? 'text-gray-300' : 'text-gray-500'}`}>
            {t('notification.time')}
          </Text>
          <View className="flex-row items-center">
            <Text
              className={`mr-1 text-base font-medium ${isLocked ? 'text-gray-300' : 'text-orange-500'}`}
            >
              {formatTime(notificationTime.hour, notificationTime.minute, isKorean)}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={isLocked ? '#D1D5DB' : '#F97316'}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* 시간 선택 바텀시트 */}
      <NotificationTimeBottomSheet
        visible={showTimePicker}
        currentHour={notificationTime.hour}
        currentMinute={notificationTime.minute}
        onSave={handleTimeSave}
        onClose={() => setShowTimePicker(false)}
      />
    </>
  );
}