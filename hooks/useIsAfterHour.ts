import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * 현재 시간이 지정된 시간 이후인지 체크하는 커스텀 훅
 * - 지정된 시간이 되면 자동으로 true로 업데이트
 * - 앱이 백그라운드에서 포그라운드로 돌아올 때 다시 체크
 * @param targetHour 기준 시간 (0-23)
 */
export function useIsAfterHour(targetHour: number): boolean {
  const [isAfterHour, setIsAfterHour] = useState<boolean>(() => {
    return new Date().getHours() >= targetHour;
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const targetHourRef = useRef(targetHour);

  // targetHour가 변경되면 ref 업데이트
  useEffect(() => {
    targetHourRef.current = targetHour;
  }, [targetHour]);

  useEffect(() => {
    // 현재 지정된 시간 이후인지 체크
    const checkAndUpdate = () => {
      const now = new Date();
      const currentIsAfterHour = now.getHours() >= targetHourRef.current;
      setIsAfterHour(currentIsAfterHour);
      return currentIsAfterHour;
    };

    // 지정된 시간까지 남은 밀리초 계산
    const getMsUntilTarget = (): number | null => {
      const now = new Date();

      // 이미 지정된 시간 이후라면 null 반환
      if (now.getHours() >= targetHourRef.current) {
        return null;
      }

      // 오늘 지정된 시간 계산
      const targetTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        targetHourRef.current,
        0,
        0,
        0
      );

      return targetTime.getTime() - now.getTime();
    };

    // 타이머 설정
    const scheduleTimer = () => {
      // 기존 타이머 정리
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      const msUntilTarget = getMsUntilTarget();

      // 지정된 시간 이후라면 타이머 불필요
      if (msUntilTarget === null) {
        return;
      }

      timerRef.current = setTimeout(() => {
        checkAndUpdate();
      }, msUntilTarget + 100); // 100ms 버퍼 추가
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
  }, [targetHour]); // targetHour 변경 시 재실행

  return isAfterHour;
}
