import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  AppState,
  type AppStateStatus,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { usePremiumContext } from '@/contexts/PremiumContext';
import { useNotificationPermission } from '@/hooks/useNotificationPermission';
import { NotificationTimeBottomSheet } from './NotificationTimeBottomSheet';
import { formatTime } from '@/utils/timeFormat';

export function NotificationToggle() {
  const { t, i18n } = useTranslation();
  const {
    notificationEnabled,
    setNotificationEnabled,
    notificationTime,
    setNotificationTime,
  } = usePremiumContext();
  const { hasPermission, permissionStatus, requestPermission, recheckPermission } =
    useNotificationPermission();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const isKorean = i18n.language === 'ko';
  const appState = useRef(AppState.currentState);
  const wasInBackground = useRef(false);

  // 설정에서 돌아왔을 때 권한 상태 다시 확인
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          wasInBackground.current = true;
          await recheckPermission();
        }
        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [recheckPermission]);

  // 백그라운드에서 돌아온 경우 권한 상태에 따라 알림 토글 자동 조정
  useEffect(() => {
    if (wasInBackground.current) {
      // 권한이 granted로 바뀌면 자동으로 알림 ON
      if (permissionStatus === 'granted' && !notificationEnabled) {
        setNotificationEnabled(true);
      }
      // 권한이 denied로 바뀌면 자동으로 알림 OFF
      if (permissionStatus === 'denied' && notificationEnabled) {
        setNotificationEnabled(false);
      }
      wasInBackground.current = false;
    }
  }, [permissionStatus, notificationEnabled, setNotificationEnabled]);

  const handleToggle = async () => {
    // 알림 OFF로 변경하는 경우 → 권한과 관계없이 항상 허용
    if (notificationEnabled) {
      setNotificationEnabled(false);
      return;
    }

    // 알림 ON으로 변경하려는 경우 → 권한 체크 필요
    // 권한이 명시적으로 거부된 상태면 설정으로 안내
    if (permissionStatus === 'denied') {
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

    // 아직 요청 안 한 상태면 권한 요청
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        return;
      }
    }

    setNotificationEnabled(true);
  };

  const handleTimePress = () => {
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

  return (
    <>
      <View className="rounded-xl bg-white px-4 py-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handleToggle}
            activeOpacity={0.7}
            className="flex-1 flex-row items-center"
          >
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <Ionicons name="notifications" size={20} color="#F97316" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">
                {t('notification.title')}
              </Text>
              <Text className="mt-0.5 text-sm text-gray-500">
                {t('notification.description')}
              </Text>
            </View>
          </TouchableOpacity>
          <Switch
            value={notificationEnabled}
            onValueChange={handleToggle}
            trackColor={{ false: '#E5E7EB', true: '#FDBA74' }}
            thumbColor={notificationEnabled ? '#F97316' : '#F3F4F6'}
            ios_backgroundColor="#E5E7EB"
          />
        </View>

        {/* 시간 설정 행 */}
        <TouchableOpacity
          onPress={handleTimePress}
          activeOpacity={0.7}
          className="mt-3 flex-row items-center justify-between border-t border-gray-100 pt-3"
        >
          <Text className="text-sm text-gray-500">{t('notification.time')}</Text>
          <View className="flex-row items-center">
            <Text className="mr-1 text-base font-medium text-orange-500">
              {formatTime(notificationTime.hour, notificationTime.minute, isKorean)}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#F97316" />
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