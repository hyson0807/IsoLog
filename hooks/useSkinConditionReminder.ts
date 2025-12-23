import { useEffect } from 'react';
import { usePremiumContext } from '@/contexts/PremiumContext';
import { updateSkinConditionReminder } from '@/services/notificationService';

/**
 * 피부 상태 기록 알림 관리 훅
 * - 앱 시작 시 알림 설정에 따라 매일 반복 알림 예약
 * - 알림 설정 변경 시 알림 업데이트
 */
export function useSkinConditionReminder() {
  const {
    notificationEnabled,
    skinConditionReminderEnabled,
    skinConditionReminderTime,
    isLoading: premiumLoading,
  } = usePremiumContext();

  // 설정 변경 시 알림 업데이트
  useEffect(() => {
    if (premiumLoading) return;

    updateSkinConditionReminder(
      notificationEnabled,
      skinConditionReminderEnabled,
      skinConditionReminderTime.hour,
      skinConditionReminderTime.minute
    );
  }, [
    notificationEnabled,
    skinConditionReminderEnabled,
    skinConditionReminderTime,
    premiumLoading,
  ]);
}
