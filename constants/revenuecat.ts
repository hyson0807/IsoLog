import { Platform } from 'react-native';

// RevenueCat API Keys from environment variables
// Development: test_xxx (Sandbox - simulated purchases)
// Production iOS: appl_xxx (Real App Store purchases)
// Production Android: goog_xxx (Real Google Play purchases)
const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

// Get platform-specific API key
export const getRevenueCatApiKey = (): string => {
  const key = Platform.OS === 'ios' ? IOS_API_KEY : ANDROID_API_KEY;

  if (!key) {
    console.warn(
      `[RevenueCat] API key not found for ${Platform.OS}. ` +
        'Make sure EXPO_PUBLIC_REVENUECAT_IOS_API_KEY or EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY is set.'
    );
  }

  return key ?? '';
};

// Entitlement identifier - matches RevenueCat dashboard
export const ENTITLEMENT_ID = 'IsoLog Pro';

// Product identifier - matches App Store Connect / Google Play Console
export const PRODUCT_ID = 'isolog1';

// Price display (for fallback when offerings not loaded)
export const PRODUCT_PRICE = '$9.99';
