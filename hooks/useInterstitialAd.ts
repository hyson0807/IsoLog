import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { usePremiumContext } from '@/contexts/PremiumContext';
import { INTERSTITIAL_AD_UNIT_ID } from '@/constants/admob';

const ERROR_RETRY_DELAY_MS = 3000;

export function useInterstitialAd() {
  const { isPremium, isLoading } = usePremiumContext();
  const [adLoaded, setAdLoaded] = useState(false);
  const interstitialRef = useRef<InterstitialAd | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const loadAd = useCallback(() => {
    if (Platform.OS === 'web' || isPremium) {
      return;
    }

    const interstitial = InterstitialAd.createForAdRequest(
      INTERSTITIAL_AD_UNIT_ID,
      {
        requestNonPersonalizedAdsOnly: true,
      }
    );

    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => setAdLoaded(true)
    );

    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setAdLoaded(false);
        interstitial.load();
      }
    );

    const unsubscribeError = interstitial.addAdEventListener(
      AdEventType.ERROR,
      () => {
        setAdLoaded(false);
        // 에러 발생 시 일정 시간 후 재시도
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        retryTimeoutRef.current = setTimeout(() => {
          interstitialRef.current?.load();
        }, ERROR_RETRY_DELAY_MS);
      }
    );

    interstitialRef.current = interstitial;
    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [isPremium]);

  useEffect(() => {
    if (isLoading) return;
    const cleanup = loadAd();
    return cleanup;
  }, [loadAd, isLoading]);

  // 앱이 포그라운드로 돌아올 때 광고 재로드
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // 백그라운드/inactive → active 전환 시
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // 광고가 로드되지 않았고, 프리미엄이 아니고, 로딩 중이 아닐 때 재로드
        if (!adLoaded && !isPremium && !isLoading) {
          interstitialRef.current?.load();
        }
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, [adLoaded, isPremium, isLoading]);

  const showAd = useCallback((): boolean => {
    if (Platform.OS === 'web' || isPremium || isLoading) {
      return false;
    }

    if (adLoaded && interstitialRef.current) {
      interstitialRef.current.show();
      return true;
    }
    return false;
  }, [adLoaded, isPremium, isLoading]);

  return {
    isAdReady: adLoaded && !isPremium && Platform.OS !== 'web',
    showAd,
  };
}
