import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getToday } from '@/utils/dateUtils';

/**
 * 오늘 날짜를 관리하는 커스텀 훅
 * - 자정에 날짜가 바뀌면 자동으로 업데이트
 * - 앱이 백그라운드에서 포그라운드로 돌아올 때 날짜 확인
 */
export function useTodayDate(): string {
  const [today, setToday] = useState<string>(getToday());
  const midnightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 자정까지 남은 밀리초 계산
  const getMsUntilMidnight = useCallback((): number => {
    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0, 0
    );
    return midnight.getTime() - now.getTime();
  }, []);

  // 날짜 변경 확인 및 업데이트
  const checkAndUpdateToday = useCallback(() => {
    const currentToday = getToday();
    setToday((prev) => {
      if (prev !== currentToday) {
        return currentToday;
      }
      return prev;
    });
  }, []);

  // 자정 타이머 설정
  const scheduleMidnightUpdate = useCallback(() => {
    // 기존 타이머 정리
    if (midnightTimerRef.current) {
      clearTimeout(midnightTimerRef.current);
    }

    const msUntilMidnight = getMsUntilMidnight();

    midnightTimerRef.current = setTimeout(() => {
      checkAndUpdateToday();
      // 다음 자정 타이머 재설정
      scheduleMidnightUpdate();
    }, msUntilMidnight + 100); // 100ms 버퍼 추가 (setTimeout 정확도 보정)
  }, [getMsUntilMidnight, checkAndUpdateToday]);

  useEffect(() => {
    // AppState 변경 핸들러
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkAndUpdateToday();
        // 포그라운드 복귀 시 타이머 재설정
        scheduleMidnightUpdate();
      }
    };

    // 초기 타이머 설정
    scheduleMidnightUpdate();

    // AppState 리스너 등록
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      // cleanup: 타이머 정리
      if (midnightTimerRef.current) {
        clearTimeout(midnightTimerRef.current);
      }
      // cleanup: 리스너 제거
      subscription.remove();
    };
  }, [checkAndUpdateToday, scheduleMidnightUpdate]);

  return today;
}
