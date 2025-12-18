import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

const TARGET_HOUR = 21; // 21시 (오후 9시)

/**
 * 현재 시간이 21시 이후인지 체크하는 커스텀 훅
 * - 21시가 되면 자동으로 true로 업데이트
 * - 앱이 백그라운드에서 포그라운드로 돌아올 때 다시 체크
 */
export function useIsAfter21(): boolean {
  const [isAfter21, setIsAfter21] = useState<boolean>(() => {
    return new Date().getHours() >= TARGET_HOUR;
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 현재 21시 이후인지 체크
    const checkAndUpdate = () => {
      const now = new Date();
      const currentIsAfter21 = now.getHours() >= TARGET_HOUR;
      setIsAfter21(currentIsAfter21);
      return currentIsAfter21;
    };

    // 21시까지 남은 밀리초 계산
    const getMsUntil21 = (): number | null => {
      const now = new Date();

      // 이미 21시 이후라면 null 반환
      if (now.getHours() >= TARGET_HOUR) {
        return null;
      }

      // 오늘 21시 시간 계산
      const target21 = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        TARGET_HOUR,
        0,
        0,
        0
      );

      return target21.getTime() - now.getTime();
    };

    // 21시 타이머 설정
    const scheduleTimer = () => {
      // 기존 타이머 정리
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      const msUntil21 = getMsUntil21();

      // 21시 이후라면 타이머 불필요
      if (msUntil21 === null) {
        return;
      }

      timerRef.current = setTimeout(() => {
        checkAndUpdate();
      }, msUntil21 + 100); // 100ms 버퍼 추가
    };

    // AppState 변경 핸들러
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkAndUpdate();
        scheduleTimer();
      }
    };

    // 초기 체크 및 타이머 설정
    checkAndUpdate();
    scheduleTimer();

    // AppState 리스너 등록
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      subscription.remove();
    };
  }, []); // 의존성 배열 비움 - 마운트 시 한 번만 실행

  return isAfter21;
}
