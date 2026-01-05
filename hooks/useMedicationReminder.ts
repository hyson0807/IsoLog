import { useEffect, useMemo } from 'react';
import { useMedicationContext } from '@/contexts/MedicationContext';
import { useNotificationSettingsContext } from '@/contexts/NotificationSettingsContext';
import {
  cancelReminder,
  scheduleReminder,
  scheduleUpcomingReminders,
} from '@/services/notificationService';
import { getToday, getUpcomingMedicationDays } from '@/utils/dateUtils';
import { frequencyOptions } from '@/constants/frequency';

// 향후 며칠간의 알림을 미리 예약할지 설정
const DAYS_AHEAD = 7;

/**
 * 복용 알림 관리 훅
 * - 앱 시작 시 향후 7일간의 복용일에 대해 알림 예약
 * - 복용 체크/해제 시 알림 예약/취소
 * - 알림 설정 변경 시 알림 업데이트
 * - 알림 시간 변경 시 알림 재예약
 */
export function useMedicationReminder() {
  const { todayStatus, isMedicationDay, hasTaken, schedule, takenDates } = useMedicationContext();
  const {
    notificationEnabled,
    medicationReminderEnabled,
    medicationReminderTime,
    isLoading: notificationLoading,
  } = useNotificationSettingsContext();

  const today = getToday();

  // 주기 일수 계산
  const frequencyDays = useMemo(() => {
    if (schedule.frequency === 'none') return 0;
    const option = frequencyOptions.find((opt) => opt.type === schedule.frequency);
    return option?.days || 1;
  }, [schedule.frequency]);

  // 향후 복용일 목록 계산
  const upcomingMedicationDays = useMemo(() => {
    return getUpcomingMedicationDays(schedule.referenceDate, frequencyDays, DAYS_AHEAD);
  }, [schedule.referenceDate, frequencyDays]);

  // 앱 시작 시 및 상태 변경 시 향후 복용일들에 대해 알림 예약
  useEffect(() => {
    if (notificationLoading) return;

    scheduleUpcomingReminders(
      upcomingMedicationDays,
      takenDates,
      notificationEnabled,
      medicationReminderTime.hour,
      medicationReminderTime.minute,
      medicationReminderEnabled
    );
  }, [
    upcomingMedicationDays,
    takenDates,
    notificationEnabled,
    medicationReminderTime,
    medicationReminderEnabled,
    notificationLoading,
  ]);

  // 특정 날짜 복용 토글 시 호출할 함수들
  const handleMedicationToggle = async (date: string, willTake: boolean) => {
    if (!notificationEnabled || !medicationReminderEnabled) return;

    // 오늘 날짜가 아니면 알림 관리 불필요
    if (date !== today) return;

    if (willTake) {
      // 복용 체크 → 알림 취소
      await cancelReminder(date);
    } else {
      // 복용 해제 → 알림 다시 예약 (복용일인 경우만)
      if (isMedicationDay(date)) {
        await scheduleReminder(date, medicationReminderTime.hour, medicationReminderTime.minute);
      }
    }
  };

  return {
    handleMedicationToggle,
  };
}