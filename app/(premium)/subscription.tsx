import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { usePremiumContext } from '@/contexts/PremiumContext';

export default function SubscriptionScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { isPremium, purchaseDate } = usePremiumContext();

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const locale = i18n.language === 'ko' ? 'ko-KR' : 'en-US';
    return date.toLocaleDateString(locale, {
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
        <Text className="text-xl font-bold text-gray-900">{t('subscription.title')}</Text>
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
                {isPremium ? 'IsoLog Pro' : t('subscription.freeVersion')}
              </Text>
              <Text className="text-sm text-gray-500">
                {isPremium ? t('subscription.lifetimeActive') : t('subscription.basicFeatures')}
              </Text>
            </View>
          </View>

          {isPremium && (
            <>
              <View className="h-px bg-gray-100" />

              <View className="mt-4">
                <View className="flex-row justify-between py-2">
                  <Text className="text-sm text-gray-500">{t('subscription.subscriptionType')}</Text>
                  <Text className="text-sm font-medium text-gray-900">{t('subscription.lifetimeLicense')}</Text>
                </View>

                <View className="flex-row justify-between py-2">
                  <Text className="text-sm text-gray-500">{t('subscription.purchaseDate')}</Text>
                  <Text className="text-sm font-medium text-gray-900">{formatDate(purchaseDate)}</Text>
                </View>

                <View className="flex-row justify-between py-2">
                  <Text className="text-sm text-gray-500">{t('subscription.expirationDate')}</Text>
                  <Text className="text-sm font-medium text-green-600">{t('subscription.neverExpires')}</Text>
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
            <Text className="text-base font-bold text-white">{t('subscription.startPremium')}</Text>
          </TouchableOpacity>
        )}

        {/* Info */}
        <View className="mt-6 rounded-xl bg-gray-100 p-4">
          <Text className="text-sm leading-relaxed text-gray-600">
            {isPremium ? t('subscription.premiumInfo') : t('subscription.freeInfo')}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}