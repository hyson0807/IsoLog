import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@isoLog/onboarding_completed';
const MEDICATION_DATA_KEY = '@isoLog/medication_data';

interface UseOnboardingReturn {
  shouldShowOnboarding: boolean;
  isLoading: boolean;
  completeOnboarding: () => Promise<void>;
  skipOnboarding: () => Promise<void>;
}

export function useOnboarding(): UseOnboardingReturn {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        // 1. 온보딩 완료 플래그 확인
        const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (completed === 'true') {
          setShouldShowOnboarding(false);
          setIsLoading(false);
          return;
        }

        // 2. 기존 사용자인지 확인 (medication 데이터 존재 여부)
        const existingData = await AsyncStorage.getItem(MEDICATION_DATA_KEY);
        if (existingData) {
          // 기존 사용자 -> 온보딩 표시 안 함 + 플래그 설정
          await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
          setShouldShowOnboarding(false);
        } else {
          // 새 사용자 -> 온보딩 표시
          setShouldShowOnboarding(true);
        }
      } catch {
        // 에러 시 온보딩 표시 안 함
        setShouldShowOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkOnboarding();
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setShouldShowOnboarding(false);
    } catch {
      // Silently fail
    }
  }, []);

  const skipOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setShouldShowOnboarding(false);
    } catch {
      // Silently fail
    }
  }, []);

  return {
    shouldShowOnboarding,
    isLoading,
    completeOnboarding,
    skipOnboarding,
  };
}
