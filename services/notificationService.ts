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

const MEDICATION_REMINDER_PREFIX = 'medication_reminder_';
const SKIN_CONDITION_REMINDER_ID = 'skin_condition_reminder';

// 복용 알림 ID 생성 (날짜 기반)
function getMedicationReminderId(date: string): string {
  return `${MEDICATION_REMINDER_PREFIX}${date}`;
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
    await Notifications.setNotificationChannelAsync('skin-condition-reminders', {
      name: '피부 상태 기록 알림',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
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

// 상세 권한 상태 반환 (granted/denied/undetermined)
export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export async function getDetailedPermissionStatus(): Promise<PermissionStatus> {
  if (Platform.OS === 'web') {
    return 'denied';
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
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
      identifier: getMedicationReminderId(date),
    });

    return notificationId;
  } catch {
    return null;
  }
}

// 특정 날짜의 예약된 복용 알림 취소
export async function cancelReminder(date: string): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(getMedicationReminderId(date));
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
  minute: number = 0,
  medicationReminderEnabled: boolean = true
): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  // 전체 알림 또는 복용 리마인더가 비활성화면 스킵
  if (!notificationEnabled || !medicationReminderEnabled) {
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

// 향후 복용일들에 대해 알림 예약 (앱을 안 열어도 알림이 울리도록)
export async function scheduleUpcomingReminders(
  upcomingDates: string[],
  takenDates: Set<string>,
  notificationEnabled: boolean,
  hour: number = 22,
  minute: number = 0,
  medicationReminderEnabled: boolean = true
): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  // 전체 알림 또는 복용 리마인더가 비활성화면 복용 알림만 취소
  // (피부 상태 알림은 별도로 관리되므로 cancelAllReminders 사용하면 안 됨)
  if (!notificationEnabled || !medicationReminderEnabled) {
    for (const date of upcomingDates) {
      await cancelReminder(date);
    }
    return;
  }

  // 각 복용일에 대해 알림 예약
  for (const date of upcomingDates) {
    // 이미 복용한 날짜는 스킵
    if (takenDates.has(date)) {
      await cancelReminder(date);
      continue;
    }

    // 알림 예약
    await scheduleReminder(date, hour, minute);
  }
}

// ============================================
// 피부 상태 기록 알림
// ============================================

// 피부 상태 알림 예약 (매일 반복)
export async function scheduleSkinConditionReminder(
  hour: number = 21,
  minute: number = 0
): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    // 기존 알림 취소
    await cancelSkinConditionReminder();

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '피부 상태 기록',
        body: '오늘의 피부 상태는 어떠신가요? 기록을 남겨주세요!',
        data: { type: 'skin_condition' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: Platform.OS === 'android' ? 'skin-condition-reminders' : undefined,
      },
      identifier: SKIN_CONDITION_REMINDER_ID,
    });

    return notificationId;
  } catch {
    return null;
  }
}

// 피부 상태 알림 취소
export async function cancelSkinConditionReminder(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(SKIN_CONDITION_REMINDER_ID);
  } catch {
    // Failed to cancel notification
  }
}

// 피부 상태 알림 설정 업데이트
export async function updateSkinConditionReminder(
  notificationEnabled: boolean,
  skinConditionReminderEnabled: boolean,
  hour: number = 21,
  minute: number = 0
): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  // 전체 알림 또는 피부 상태 알림이 비활성화면 취소
  if (!notificationEnabled || !skinConditionReminderEnabled) {
    await cancelSkinConditionReminder();
    return;
  }

  // 알림 예약
  await scheduleSkinConditionReminder(hour, minute);
}