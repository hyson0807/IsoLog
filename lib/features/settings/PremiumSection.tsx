import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { usePremiumContext } from '@/contexts/PremiumContext';

interface PremiumSectionProps {
  onPurchase: () => void;
  onRestore: () => void;
  onManageSubscription?: () => void;
}

export function PremiumSection({ onPurchase, onRestore, onManageSubscription }: PremiumSectionProps) {
  const { t, i18n } = useTranslation();
  const { isPremium, purchaseDate } = usePremiumContext();

  if (isPremium) {
    return (
      <View className="overflow-hidden rounded-xl bg-white">
        {/* Premium Status Banner */}
        <View className="bg-gradient-to-r from-orange-500 to-orange-400 px-5 py-4">
          <View className="flex-row items-center justify-between">
            <View>
              <View className="flex-row items-center">
                <View className="mr-2 rounded-full bg-black/10 px-2 py-0.5">
                  <Text className="text-xs font-bold">{t('premium.pro')}</Text>
                </View>
                <Text className="text-lg font-bold">{t('premium.title')}</Text>
              </View>
              <Text className="mt-1 text-sm text-black/80">
                {t('premium.usingPremium')}
              </Text>
            </View>
          </View>
        </View>

        {/* Active Features */}
        <View className="px-5 pb-4">
          <View className="flex-row items-center py-1.5">
            <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
            <Text className="ml-2 text-sm text-gray-700">{t('premium.benefits.adFree')}</Text>
          </View>
          {purchaseDate && (
            <Text className="mt-2 text-xs text-gray-400">
              {new Date(purchaseDate).toLocaleDateString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}
            </Text>
          )}
        </View>

        {/* Manage Subscription Button */}
        {onManageSubscription && (
          <TouchableOpacity
            onPress={onManageSubscription}
            className="flex-row items-center justify-between border-t border-gray-100 px-5 py-3"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Ionicons name="settings-outline" size={18} color="#6B7280" />
              <Text className="ml-2 text-sm text-gray-600">{t('premium.benefits.manage')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View className="overflow-hidden rounded-xl bg-white">
      {/* Benefits List */}
        <TouchableOpacity
            onPress={onPurchase}
            activeOpacity={0.8}
        >
      <View className="px-5 py-4">
              <Ionicons className="absolute right-0 p-5" name="chevron-forward" size={20} color="black" />

        <View className="flex-row items-center py-2">
          <View className="mr-3 h-1.5 w-1.5 rounded-full bg-orange-500" />
          <Text className="text-sm text-gray-700">{t('paywall.benefit2Title')}</Text>
        </View>
        <View className="flex-row items-center py-2">
          <View className="mr-3 h-1.5 w-1.5 rounded-full bg-orange-500" />
          <Text className="text-sm text-gray-700">{t('paywall.benefit3Title')}</Text>
        </View>
      </View>
        </TouchableOpacity>

      {/* Restore Purchase Button */}
      <TouchableOpacity
        onPress={onRestore}
        className="border-t border-gray-100 py-3"
      >
        <Text className="text-center text-sm text-gray-500">
          {t('paywall.restoreQuestion')} <Text className="font-medium text-orange-500">{t('paywall.restoreLink')}</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}