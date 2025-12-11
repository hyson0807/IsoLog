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
        <View className="flex-row items-center">
          <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-orange-500">
            <Ionicons name="star" size={24} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-orange-600">Premium</Text>
            <Text className="text-sm text-orange-500">
              광고 제거 + 알림 기능 이용 중
            </Text>
          </View>
          <Ionicons name="checkmark-circle" size={28} color="#F97316" />
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
        className="bg-orange-500 p-5"
      >
        <View className="flex-row items-center">
          <View
            className="mr-4 h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <Ionicons name="diamond" size={28} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-white">IsoCare Premium</Text>
            <Text className="mt-1 text-sm text-orange-100">
              광고 제거 + 복용 알림 영구 사용
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="white" />
        </View>
      </TouchableOpacity>

      {/* 혜택 목록 */}
      <View className="px-4 py-3">
        <View className="flex-row items-center py-2">
          <Ionicons name="close-circle" size={20} color="#F97316" />
          <Text className="ml-3 flex-1 text-sm text-gray-700">광고 완전 제거</Text>
        </View>
        <View className="flex-row items-center py-2">
          <Ionicons name="notifications" size={20} color="#F97316" />
          <Text className="ml-3 flex-1 text-sm text-gray-700">복용 알림 기능</Text>
        </View>
        <View className="flex-row items-center py-2">
          <Ionicons name="infinite" size={20} color="#F97316" />
          <Text className="ml-3 flex-1 text-sm text-gray-700">한 번 결제로 영구 사용</Text>
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
