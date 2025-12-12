import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePremiumContext } from '@/contexts/PremiumContext';

interface PremiumSectionProps {
  onPurchase: () => void;
  onRestore: () => void;
}

export function PremiumSection({ onPurchase, onRestore }: PremiumSectionProps) {
  const { isPremium, purchaseDate } = usePremiumContext();

  if (isPremium) {
    return (
      <View className="rounded-xl bg-orange-50 p-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-bold text-orange-600">Premium</Text>
            <Text className="mt-1 text-sm text-orange-500">
              광고 제거 + 알림 기능 이용 중
            </Text>
          </View>
          <View className="h-8 w-8 items-center justify-center rounded-full bg-orange-500">
            <Ionicons name="checkmark" size={18} color="white" />
          </View>
        </View>
        {purchaseDate && (
          <Text className="mt-3 text-xs text-orange-400">
            구매일: {new Date(purchaseDate).toLocaleDateString('ko-KR')}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View className="overflow-hidden rounded-xl bg-white">
      {/* 프리미엄 배너 */}
      <TouchableOpacity
        onPress={onPurchase}
        activeOpacity={0.8}
        className="bg-orange-500 px-5 py-3"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="mt-1 text-xl font-bold text-white">
              IsoLog Premium
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
        </View>
      </TouchableOpacity>

      {/* 혜택 목록 */}
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
          <Text className="text-sm text-gray-700">한 번 결제로 영구 사용</Text>
        </View>
      </View>

      {/* 구매 복원 버튼 */}
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
