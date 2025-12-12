import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePremiumContext } from '@/contexts/PremiumContext';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { isPremium, purchaseDate } = usePremiumContext();

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-100 bg-white px-5 py-4">
        <TouchableOpacity
          onPress={handleBack}
          className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="arrow-back" size={24} color="#666666" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">구독 관리</Text>
      </View>

      <View className="flex-1 px-5 pt-5">
        {/* Subscription Status Card */}
        <View className="rounded-2xl bg-white p-5 shadow-sm">
          <View className="mb-4 flex-row items-center">
            <View
              className={`h-12 w-12 items-center justify-center rounded-full ${
                isPremium ? 'bg-orange-100' : 'bg-gray-100'
              }`}
            >
              <Ionicons
                name={isPremium ? 'star' : 'star-outline'}
                size={24}
                color={isPremium ? '#F97316' : '#9CA3AF'}
              />
            </View>
            <View className="ml-4">
              <Text className="text-lg font-bold text-gray-900">
                {isPremium ? 'IsoLog Pro' : '무료 버전'}
              </Text>
              <Text className="text-sm text-gray-500">
                {isPremium ? '평생 이용권 활성화' : '기본 기능 사용 중'}
              </Text>
            </View>
          </View>

          {isPremium && (
            <>
              <View className="h-px bg-gray-100" />

              <View className="mt-4">
                <View className="flex-row justify-between py-2">
                  <Text className="text-sm text-gray-500">구독 유형</Text>
                  <Text className="text-sm font-medium text-gray-900">평생 이용권</Text>
                </View>

                <View className="flex-row justify-between py-2">
                  <Text className="text-sm text-gray-500">구매일</Text>
                  <Text className="text-sm font-medium text-gray-900">{formatDate(purchaseDate)}</Text>
                </View>

                <View className="flex-row justify-between py-2">
                  <Text className="text-sm text-gray-500">만료일</Text>
                  <Text className="text-sm font-medium text-green-600">평생 (만료 없음)</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Action Button */}
        {!isPremium && (
          <TouchableOpacity
            onPress={() => router.push('/paywall')}
            className="mt-6 items-center rounded-xl bg-orange-500 py-4"
            activeOpacity={0.8}
          >
            <Text className="text-base font-bold text-white">프리미엄 시작하기</Text>
          </TouchableOpacity>
        )}

        {/* Info */}
        <View className="mt-6 rounded-xl bg-gray-100 p-4">
          <Text className="text-sm leading-relaxed text-gray-600">
            {isPremium
              ? 'IsoLog Pro 평생 이용권을 구매해주셔서 감사합니다. 추가 결제 없이 모든 기능을 영구적으로 사용하실 수 있습니다.'
              : 'IsoLog Pro로 업그레이드하면 광고 없이 앱을 사용하고, 매일 복용 알림을 받을 수 있습니다.'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}