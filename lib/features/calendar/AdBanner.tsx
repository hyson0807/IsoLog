import { useState, useEffect, useRef } from 'react';
import { View, Platform, AppState, AppStateStatus } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { usePremiumContext } from '@/contexts/PremiumContext';
import { BANNER_AD_UNIT_ID } from '@/constants/admob';

export function AdBanner() {
  const { isPremium, isLoading } = usePremiumContext();
  const [refreshKey, setRefreshKey] = useState(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // 앱이 포그라운드로 돌아올 때 배너 광고 리프레시
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // 백그라운드/inactive → active 전환 시
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        setRefreshKey((prev) => prev + 1);
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  // 웹에서는 광고 미지원
  if (Platform.OS === 'web') {
    return null;
  }

  // 프리미엄 유저는 광고 미표시
  if (isPremium || isLoading) {
    return null;
  }

  return (
    <View className="items-center bg-gray-50 py-1">
      <BannerAd
        key={refreshKey}
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}
