import { useEffect } from 'react';
import { useMedicationContext } from '@/contexts/MedicationContext';
import { usePremiumContext } from '@/contexts/PremiumContext';
import {
  checkAndScheduleTodayReminder,
  cancelReminder,
  scheduleReminder,
} from '@/services/notificationService';
import { getToday } from '@/utils/dateUtils';

/**
 * 복용 알림 관리 훅
 * - 앱 시작 시 오늘의 알림 예약 상태 체크
 * - 복용 체크/해제 시 알림 예약/취소
 * - 알림 설정 변경 시 알림 업데이트
 * - 알림 시간 변경 시 알림 재예약
 */
export function useMedicationReminder() {
  const { todayStatus, isMedicationDay, hasTaken } = useMedicationContext();
  const {
    notificationEnabled,
    notificationTime,
    isLoading: premiumLoading,
  } = usePremiumContext();

  const today = getToday();

  // 앱 시작 시 및 상태 변경 시 오늘 알림 체크
  useEffect(() => {
    if (premiumLoading) return;

    checkAndScheduleTodayReminder(
      today,
      todayStatus.isMedicationDay,
      todayStatus.hasTakenToday,
      notificationEnabled,
      notificationTime.hour,
      notificationTime.minute
    );
  }, [today, todayStatus, notificationEnabled, notificationTime, premiumLoading]);

  // 특정 날짜 복용 토글 시 호출할 함수들
  const handleMedicationToggle = async (date: string, willTake: boolean) => {
    if (!notificationEnabled) return;

    // 오늘 날짜가 아니면 알림 관리 불필요
    if (date !== today) return;

    if (willTake) {
      // 복용 체크 → 알림 취소
      await cancelReminder(date);
    } else {
      // 복용 해제 → 알림 다시 예약 (복용일인 경우만)
      if (isMedicationDay(date)) {
        await scheduleReminder(date, notificationTime.hour, notificationTime.minute);
      }
    }
  };

  return {
    handleMedicationToggle,
  };
}