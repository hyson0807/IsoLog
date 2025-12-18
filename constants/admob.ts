import { Platform } from 'react-native';

// 웹에서는 네이티브 광고 모듈 import 방지
const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

// 배너 광고 Unit ID
export const BANNER_AD_UNIT_ID = !isNative
  ? ''
  : __DEV__
    ? 'ca-app-pub-3940256099942544/9214589741' // Google 테스트 배너 ID
    : Platform.select({
        ios: 'ca-app-pub-2320452683835335/2836845429',
        android: 'ca-app-pub-2320452683835335/1979167126',
        default: '',
      });

// 전면 광고 Unit ID
export const INTERSTITIAL_AD_UNIT_ID = !isNative
  ? ''
  : __DEV__
    ? 'ca-app-pub-3940256099942544/1033173712' // Google 테스트 전면 ID
    : Platform.select({
        ios: 'ca-app-pub-2320452683835335/9737597014',
        android: 'ca-app-pub-2320452683835335/1240159899',
        default: '',
      });
