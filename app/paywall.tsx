import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Purchases from 'react-native-purchases';
import { usePremiumContext } from '@/contexts/PremiumContext';
import { ENTITLEMENT_ID, PRODUCT_ID, PRODUCT_PRICE } from '@/constants/revenuecat';

export default function PaywallScreen() {
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
      Alert.alert('알림', '웹에서는 결제가 지원되지 않습니다.');
      return;
    }

    const pkg = getLifetimePackage();
    if (!pkg) {
      Alert.alert('오류', '상품 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const hasPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

      if (hasPremium) {
        await refreshCustomerInfo();
        Alert.alert('구매 완료', 'IsoLog Pro를 구매해주셔서 감사합니다!', [
          { text: '확인', onPress: () => router.back() },
        ]);
      }
    } catch (error: unknown) {
      const purchaseError = error as { userCancelled?: boolean };
      if (purchaseError.userCancelled) {
        return;
      }
      console.error('Purchase error:', error);
      Alert.alert('오류', '결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle restore
  const handleRestore = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('알림', '웹에서는 지원되지 않습니다.');
      return;
    }

    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const customerInfo = await Purchases.restorePurchases();
      const hasPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

      if (hasPremium) {
        await refreshCustomerInfo();
        Alert.alert('복원 완료', '구매 내역이 복원되었습니다!', [
          { text: '확인', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('복원 실패', '복원할 구매 내역이 없습니다.');
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('오류', '구매 복원 중 오류가 발생했습니다.');
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
            IsoLog Pro로{'\n'}완벽한 관리를 시작하세요
          </Text>
          <Text className="mt-4 text-base leading-relaxed text-gray-500">
            한 번 결제로 평생 사용하세요.
          </Text>
        </View>

        {/* Benefits */}
        <View className="mt-10">
          <BenefitItem
            icon="notifications-outline"
            title="매일 복용 알림"
            description="원하는 시간에 잊지 않게 알려드려요"
          />
          <BenefitItem
            icon="close-circle-outline"
            title="광고 없는 화면"
            description="방해 요소 없이 기록에만 집중하세요"
          />
          <BenefitItem
            icon="infinite-outline"
            title="평생 소장"
            description="추가 비용 없이 영원히 사용하세요"
          />
        </View>
      </View>

      {/* Bottom CTA */}
      <View className="border-t border-gray-100 px-6 pb-4 pt-6">
        {/* Price */}
        <View className="mb-4 items-center">
          <Text className="text-3xl font-bold text-gray-900">{getPrice()}</Text>
          <Text className="mt-1 text-sm text-gray-400">평생 이용권</Text>
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
            <Text className="text-lg font-bold text-white">지금 구매하기</Text>
          )}
        </TouchableOpacity>

        {/* Restore */}
        <TouchableOpacity onPress={handleRestore} disabled={isLoading} className="mt-4 py-2">
          <Text className="text-center text-sm text-gray-400">
            이미 구매하셨나요? <Text className="text-orange-500">구매 복원</Text>
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text className="mt-3 text-center text-xs text-gray-300">
          결제는 Apple/Google 계정으로 청구됩니다
        </Text>
      </View>

      {/* Loading Overlay */}
      {isLoading && (
        <View className="absolute inset-0 items-center justify-center bg-black/30">
          <View className="rounded-xl bg-white p-6">
            <ActivityIndicator size="large" color="#F97316" />
            <Text className="mt-2 text-gray-600">처리 중...</Text>
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
