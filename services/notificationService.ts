import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 알림 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const NOTIFICATION_ID_PREFIX = 'medication_reminder_';

// 알림 ID 생성 (날짜 기반)
function getNotificationId(date: string): string {
  return `${NOTIFICATION_ID_PREFIX}${date}`;
}

// 알림 권한 요청
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  // Android 채널 설정
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medication-reminders', {
      name: '복용 알림',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF9500',
    });
  }

  return true;
}

// 알림 권한 상태 확인
export async function getNotificationPermissionStatus(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

// 특정 날짜 지정 시간에 알림 예약
export async function scheduleReminder(
  date: string,
  hour: number = 22,
  minute: number = 0
): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    // 날짜 파싱 (YYYY-MM-DD)
    const [year, month, day] = date.split('-').map(Number);

    // 해당 날짜 지정 시간으로 설정
    const triggerDate = new Date(year, month - 1, day, hour, minute, 0);

    // 이미 지난 시간이면 예약하지 않음
    if (triggerDate <= new Date()) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '복용 알림',
        body: '오늘 약 복용을 잊지 않으셨나요? 기록을 남겨주세요!',
        data: { date },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: Platform.OS === 'android' ? 'medication-reminders' : undefined,
      },
      identifier: getNotificationId(date),
    });

    return notificationId;
  } catch {
    return null;
  }
}

// 특정 날짜의 예약된 알림 취소
export async function cancelReminder(date: string): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(getNotificationId(date));
  } catch {
    // Failed to cancel notification
  }
}

// 모든 예약된 알림 취소
export async function cancelAllReminders(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Failed to cancel all notifications
  }
}

// 예약된 알림 목록 조회
export async function getScheduledReminders(): Promise<Notifications.NotificationRequest[]> {
  if (Platform.OS === 'web') {
    return [];
  }

  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch {
    return [];
  }
}

// 오늘 알림 예약 여부 체크 및 예약
export async function checkAndScheduleTodayReminder(
  date: string,
  isMedicationDay: boolean,
  hasTaken: boolean,
  notificationEnabled: boolean,
  hour: number = 22,
  minute: number = 0
): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  // 알림이 비활성화면 스킵
  if (!notificationEnabled) {
    await cancelReminder(date);
    return;
  }

  // 복용일이 아니면 스킵
  if (!isMedicationDay) {
    await cancelReminder(date);
    return;
  }

  // 이미 복용했으면 알림 취소
  if (hasTaken) {
    await cancelReminder(date);
    return;
  }

  // 알림 예약
  await scheduleReminder(date, hour, minute);
}