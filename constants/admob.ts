import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

// 배너 광고 Unit ID
export const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : Platform.select({
      ios: 'ca-app-pub-2320452683835335/2836845429',
      android: 'ca-app-pub-2320452683835335/1979167126',
      default: '',
    });

// 전면 광고 Unit ID
export const INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.select({
      ios: 'ca-app-pub-2320452683835335/9737597014',
      android: 'ca-app-pub-2320452683835335/1240159899',
      default: '',
    });
