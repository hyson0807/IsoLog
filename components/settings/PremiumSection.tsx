import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePremiumContext } from '@/contexts/PremiumContext';

interface PremiumSectionProps {
  onPurchase: () => void;
  onRestore: () => void;
  onManageSubscription?: () => void;
}

export function PremiumSection({ onPurchase, onRestore, onManageSubscription }: PremiumSectionProps) {
  const { isPremium, purchaseDate } = usePremiumContext();

  if (isPremium) {
    return (
      <View className="overflow-hidden rounded-xl bg-white">
        {/* Premium Status Banner */}
        <View className="bg-gradient-to-r from-orange-500 to-orange-400 px-5 py-4">
          <View className="flex-row items-center justify-between">
            <View>
              <View className="flex-row items-center">
                <View className="mr-2 rounded-full bg-white/20 px-2 py-0.5">
                  <Text className="text-xs font-bold text-white">PRO</Text>
                </View>
                <Text className="text-lg font-bold text-white">IsoLog Pro</Text>
              </View>
              <Text className="mt-1 text-sm text-white/80">
                프리미엄 기능 이용 중
              </Text>
            </View>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Ionicons name="star" size={20} color="white" />
            </View>
          </View>
        </View>

        {/* Active Features */}
        <View className="px-5 py-4">
          <View className="flex-row items-center py-1.5">
            <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
            <Text className="ml-2 text-sm text-gray-700">광고 제거 활성화</Text>
          </View>
          <View className="flex-row items-center py-1.5">
            <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
            <Text className="ml-2 text-sm text-gray-700">복용 알림 기능 사용 가능</Text>
          </View>
          {purchaseDate && (
            <Text className="mt-2 text-xs text-gray-400">
              구매일: {new Date(purchaseDate).toLocaleDateString('ko-KR')}
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
              <Text className="ml-2 text-sm text-gray-600">구독 관리</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View className="overflow-hidden rounded-xl bg-white">
      {/* Premium Banner */}
      <TouchableOpacity
        onPress={onPurchase}
        activeOpacity={0.8}
        className="bg-orange-500 px-5 py-3"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="mt-1 text-xl font-bold text-white">
              IsoLog Pro
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
        </View>
      </TouchableOpacity>

      {/* Benefits List */}
      <View className="px-5 py-4">
        <View className="flex-row items-center py-2">
          <View className="mr-3 h-1.5 w-1.5 rounded-full bg-orange-500" />
          <Text className="text-sm text-gray-700">광고 완전 제거</Text>
        </View>
        <View className="flex-row items-center py-2">
          <View className="mr-3 h-1.5 w-1.5 rounded-full bg-orange-500" />
          <Text className="text-sm text-gray-700">복용 알림 기능</Text>
        </View>
        <View className="flex-row items-center py-2">
          <View className="mr-3 h-1.5 w-1.5 rounded-full bg-orange-500" />
          <Text className="text-sm text-gray-700">한 번 결제로 평생 사용</Text>
        </View>
      </View>

      {/* Restore Purchase Button */}
      <TouchableOpacity
        onPress={onRestore}
        className="border-t border-gray-100 py-3"
      >
        <Text className="text-center text-sm text-gray-500">
          이미 구매하셨나요? <Text className="font-medium text-orange-500">구매 복원</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}