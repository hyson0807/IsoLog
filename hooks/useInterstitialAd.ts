import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { usePremiumContext } from '@/contexts/PremiumContext';
import { INTERSTITIAL_AD_UNIT_ID } from '@/constants/admob';

export function useInterstitialAd() {
  const { isPremium, isLoading } = usePremiumContext();
  const [adLoaded, setAdLoaded] = useState(false);
  const interstitialRef = useRef<InterstitialAd | null>(null);

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
      }
    );

    interstitialRef.current = interstitial;
    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, [isPremium]);

  useEffect(() => {
    if (isLoading) return;
    const cleanup = loadAd();
    return cleanup;
  }, [loadAd, isLoading]);

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
