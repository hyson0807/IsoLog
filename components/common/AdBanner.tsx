import { View, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { usePremiumContext } from '@/contexts/PremiumContext';

const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : 'ca-app-pub-2320452683835335/2836845429';

export function AdBanner() {
  const { isPremium, isLoading } = usePremiumContext();

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
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}
