import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchase: () => void;
}

export function PaywallModal({ visible, onClose, onPurchase }: PaywallModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full max-w-sm overflow-hidden rounded-2xl bg-white">
          {/* 헤더 */}
          <View className="items-center bg-gradient-to-b from-orange-500 to-orange-400 px-6 pb-8 pt-6">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-white/20">
              <Ionicons name="diamond" size={40} color="white" />
            </View>
            <Text className="text-2xl font-bold text-white">Premium 기능</Text>
            <Text className="mt-2 text-center text-orange-100">
              이 기능은 프리미엄 회원 전용입니다
            </Text>
          </View>

          {/* 혜택 */}
          <View className="px-6 py-5">
            <Text className="mb-4 text-center text-sm font-medium text-gray-500">
              프리미엄 혜택
            </Text>

            <View className="space-y-3">
              <View className="flex-row items-center">
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                  <Ionicons name="close-circle" size={18} color="#F97316" />
                </View>
                <Text className="flex-1 text-gray-700">광고 완전 제거</Text>
              </View>

              <View className="flex-row items-center">
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                  <Ionicons name="notifications" size={18} color="#F97316" />
                </View>
                <Text className="flex-1 text-gray-700">복용 알림 기능</Text>
              </View>

              <View className="flex-row items-center">
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                  <Ionicons name="infinite" size={18} color="#F97316" />
                </View>
                <Text className="flex-1 text-gray-700">한 번 결제로 영구 사용</Text>
              </View>
            </View>
          </View>

          {/* 버튼 */}
          <View className="px-6 pb-6">
            <TouchableOpacity
              onPress={onPurchase}
              className="mb-3 items-center rounded-xl bg-orange-500 py-4"
              activeOpacity={0.8}
            >
              <Text className="text-lg font-bold text-white">프리미엄 구매하기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              className="items-center py-2"
              activeOpacity={0.7}
            >
              <Text className="text-gray-500">나중에</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}