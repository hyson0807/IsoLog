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
    console.log('Notification permission not granted');
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

// 특정 날짜 밤 10시에 알림 예약
export async function scheduleReminder(date: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    // 날짜 파싱 (YYYY-MM-DD)
    const [year, month, day] = date.split('-').map(Number);

    // 해당 날짜 밤 10시로 설정
    const triggerDate = new Date(year, month - 1, day, 22, 0, 0);

    // 이미 지난 시간이면 예약하지 않음
    if (triggerDate <= new Date()) {
      console.log('Skipping notification - time already passed:', date);
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

    console.log('Scheduled notification for:', date, 'id:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
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
    console.log('Cancelled notification for:', date);
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
}

// 모든 예약된 알림 취소
export async function cancelAllReminders(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Cancelled all notifications');
  } catch (error) {
    console.error('Failed to cancel all notifications:', error);
  }
}

// 예약된 알림 목록 조회
export async function getScheduledReminders(): Promise<Notifications.NotificationRequest[]> {
  if (Platform.OS === 'web') {
    return [];
  }

  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Failed to get scheduled notifications:', error);
    return [];
  }
}

// 오늘 알림 예약 여부 체크 및 예약
export async function checkAndScheduleTodayReminder(
  date: string,
  isMedicationDay: boolean,
  hasTaken: boolean,
  isPremium: boolean,
  notificationEnabled: boolean
): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  // 프리미엄 유저가 아니거나 알림이 비활성화면 스킵
  if (!isPremium || !notificationEnabled) {
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
  await scheduleReminder(date);
}