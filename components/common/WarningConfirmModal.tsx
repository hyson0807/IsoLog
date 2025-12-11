import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface WarningConfirmModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function WarningConfirmModal({
  visible,
  onConfirm,
  onCancel,
}: WarningConfirmModalProps) {
  const handleConfirm = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onConfirm();
  };

  const handleCancel = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/50"
        onPress={onCancel}
      >
        <Pressable
          className="mx-8 rounded-2xl bg-white p-6"
          onPress={(e) => e.stopPropagation()}
        >
          {/* 아이콘 */}
          <View className="mb-4 items-center">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <Ionicons name="warning" size={36} color="#DC2626" />
            </View>
          </View>

          {/* 제목 */}
          <Text className="mb-2 text-center text-xl font-bold text-gray-900">
            정말 복용하시겠습니까?
          </Text>

          {/* 설명 */}
          <Text className="mb-6 text-center text-base text-gray-600">
            음주 전후 4일간은 간 건강을 위해{'\n'}
            휴약을 권장합니다.
          </Text>

          {/* 버튼 */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 items-center rounded-xl bg-gray-100 py-4"
            >
              <Text className="text-base font-semibold text-gray-700">취소</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              className="flex-1 items-center rounded-xl bg-red-500 py-4"
            >
              <Text className="text-base font-semibold text-white">
                그래도 먹었어요
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
