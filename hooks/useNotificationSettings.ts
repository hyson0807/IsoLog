import { useEffect, useRef, useCallback } from 'react';
import { Alert, Linking, AppState, type AppStateStatus } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNotificationSettingsContext } from '@/contexts/NotificationSettingsContext';
import { useNotificationPermission } from '@/hooks/useNotificationPermission';

/**
 * 알림 설정 페이지에서 사용하는 로직을 담은 hook
 * - 마스터 토글 핸들러
 * - AppState 변경 감지 및 권한 자동 동기화
 */
export function useNotificationSettings() {
  const { t } = useTranslation();
  const {
    notificationEnabled,
    setNotificationEnabled,
    medicationReminderEnabled,
    setMedicationReminderEnabled,
    medicationReminderTime,
    setMedicationReminderTime,
    skinConditionReminderEnabled,
    setSkinConditionReminderEnabled,
    skinConditionReminderTime,
    setSkinConditionReminderTime,
  } = useNotificationSettingsContext();

  const { hasPermission, permissionStatus, requestPermission, recheckPermission } =
    useNotificationPermission();

  const appState = useRef(AppState.currentState);

  // 설정에서 돌아왔을 때 권한 상태 다시 확인하고 알림 토글 자동 조정
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          const newStatus = await recheckPermission();
          // 권한이 granted로 바뀌면 자동으로 알림 ON
          if (newStatus === 'granted' && !notificationEnabled) {
            setNotificationEnabled(true);
          }
          // 권한이 denied로 바뀌면 자동으로 알림 OFF
          if (newStatus === 'denied' && notificationEnabled) {
            setNotificationEnabled(false);
          }
        }
        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [recheckPermission, notificationEnabled, setNotificationEnabled]);

  // 마스터 토글 핸들러
  const handleMasterToggle = useCallback(async () => {
    // 알림 OFF로 변경하는 경우
    if (notificationEnabled) {
      setNotificationEnabled(false);
      return;
    }

    // 알림 ON으로 변경하려는 경우
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

    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        return;
      }
    }

    setNotificationEnabled(true);
  }, [
    notificationEnabled,
    setNotificationEnabled,
    permissionStatus,
    hasPermission,
    requestPermission,
    t,
  ]);

  return {
    // 상태
    notificationEnabled,
    medicationReminderEnabled,
    medicationReminderTime,
    skinConditionReminderEnabled,
    skinConditionReminderTime,

    // 핸들러
    handleMasterToggle,
    setMedicationReminderEnabled,
    setMedicationReminderTime,
    setSkinConditionReminderEnabled,
    setSkinConditionReminderTime,
  };
}
