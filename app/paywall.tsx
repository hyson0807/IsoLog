import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Purchases from 'react-native-purchases';
import { useTranslation } from 'react-i18next';
import { usePremiumContext } from '@/contexts/PremiumContext';
import { ENTITLEMENT_ID, PRODUCT_ID, PRODUCT_PRICE } from '@/constants/revenuecat';

export default function PaywallScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isPremium, refreshCustomerInfo, currentOffering } = usePremiumContext();
  const [isLoading, setIsLoading] = useState(false);

  // If already premium, go back
  useEffect(() => {
    if (isPremium) {
      router.back();
    }
  }, [isPremium, router]);

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Get the lifetime package
  const getLifetimePackage = () => {
    if (!currentOffering) return null;
    return currentOffering.availablePackages.find(
      (pkg) => pkg.product.identifier === PRODUCT_ID
    ) ?? currentOffering.lifetime ?? currentOffering.availablePackages[0];
  };

  // Get price string
  const getPrice = (): string => {
    const pkg = getLifetimePackage();
    return pkg?.product.priceString ?? PRODUCT_PRICE;
  };

  // Handle purchase
  const handlePurchase = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(t('alert.notice'), t('alert.webNotSupported'));
      return;
    }

    const pkg = getLifetimePackage();
    if (!pkg) {
      Alert.alert(t('alert.error'), t('alert.productLoadError'));
      return;
    }

    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const hasPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

      if (hasPremium) {
        await refreshCustomerInfo();
        Alert.alert(t('alert.purchaseComplete'), t('alert.purchaseCompleteMessage'), [
          { text: t('common.confirm'), onPress: () => router.back() },
        ]);
      }
    } catch (error: unknown) {
      const purchaseError = error as { userCancelled?: boolean };
      if (purchaseError.userCancelled) {
        return;
      }
      console.error('Purchase error:', error);
      Alert.alert(t('alert.error'), t('alert.purchaseError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle restore
  const handleRestore = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(t('alert.notice'), t('alert.webNotSupported'));
      return;
    }

    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const customerInfo = await Purchases.restorePurchases();
      const hasPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

      if (hasPremium) {
        await refreshCustomerInfo();
        Alert.alert(t('alert.restoreSuccess'), t('alert.restoreSuccessMessage'), [
          { text: t('common.confirm'), onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(t('alert.restoreFail'), t('alert.restoreFailShort'));
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert(t('alert.error'), t('alert.restoreError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-end px-5 pt-2">
        <TouchableOpacity
          onPress={handleClose}
          className="h-10 w-10 items-center justify-center rounded-full"
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={28} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 px-6">
        {/* Hero Section */}
        <View className="mt-4">
          <Text className="text-3xl font-bold leading-tight text-gray-900">
            {t('paywall.title')}
          </Text>
          <Text className="mt-4 text-base leading-relaxed text-gray-500">
            {t('paywall.subtitle')}
          </Text>
        </View>

        {/* Benefits */}
        <View className="mt-10">
          <BenefitItem
            icon="notifications-outline"
            title={t('paywall.benefit1Title')}
            description={t('paywall.benefit1Desc')}
          />
          <BenefitItem
            icon="close-circle-outline"
            title={t('paywall.benefit2Title')}
            description={t('paywall.benefit2Desc')}
          />
          <BenefitItem
            icon="infinite-outline"
            title={t('paywall.benefit3Title')}
            description={t('paywall.benefit3Desc')}
          />
        </View>
      </View>

      {/* Bottom CTA */}
      <View className="border-t border-gray-100 px-6 pb-4 pt-6">
        {/* Price */}
        <View className="mb-4 items-center">
          <Text className="text-3xl font-bold text-gray-900">{getPrice()}</Text>
          <Text className="mt-1 text-sm text-gray-400">{t('paywall.lifetimeLicense')}</Text>
        </View>

        {/* Purchase Button */}
        <TouchableOpacity
          onPress={handlePurchase}
          disabled={isLoading}
          className="items-center rounded-2xl bg-orange-500 py-4"
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-lg font-bold text-white">{t('paywall.purchaseNow')}</Text>
          )}
        </TouchableOpacity>

        {/* Restore */}
        <TouchableOpacity onPress={handleRestore} disabled={isLoading} className="mt-4 py-2">
          <Text className="text-center text-sm text-gray-400">
            {t('paywall.alreadyPurchased')} <Text className="text-orange-500">{t('paywall.restorePurchase')}</Text>
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text className="mt-3 text-center text-xs text-gray-300">
          {t('paywall.billingInfo')}
        </Text>
      </View>

      {/* Loading Overlay */}
      {isLoading && (
        <View className="absolute inset-0 items-center justify-center bg-black/30">
          <View className="rounded-xl bg-white p-6">
            <ActivityIndicator size="large" color="#F97316" />
            <Text className="mt-2 text-gray-600">{t('common.processing')}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function BenefitItem({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View className="mb-6 flex-row items-start">
      <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-orange-50">
        <Ionicons name={icon} size={24} color="#FF6B35" />
      </View>
      <View className="flex-1 pt-1">
        <Text className="text-lg font-semibold text-gray-900">{title}</Text>
        <Text className="mt-1 text-sm text-gray-500">{description}</Text>
      </View>
    </View>
  );
}
