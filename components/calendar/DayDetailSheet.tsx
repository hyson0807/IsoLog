import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { formatDateShort } from '@/utils/dateUtils';

interface DayDetailSheetProps {
  visible: boolean;
  date: string | null;
  hasTaken: boolean;
  canEdit: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function DayDetailSheet({
  visible,
  date,
  hasTaken,
  canEdit,
  onToggle,
  onClose,
}: DayDetailSheetProps) {
  if (!date) return null;

  const handleToggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-end bg-black/50"
        onPress={onClose}
      >
        <Pressable
          className="rounded-t-3xl bg-white px-5 pb-10 pt-6"
          onPress={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">
              {formatDateShort(date)}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          {canEdit ? (
            <>
              {/* 복용 상태 버튼 */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleToggle}
                  className={`flex-1 flex-row items-center justify-center rounded-xl border-2 py-4 ${
                    hasTaken
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  disabled={hasTaken}
                >
                  <Ionicons
                    name="medical"
                    size={20}
                    color={hasTaken ? '#22C55E' : '#9CA3AF'}
                  />
                  <Text
                    className={`ml-2 text-base font-semibold ${
                      hasTaken ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    먹었어요
                  </Text>
                  {hasTaken && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#22C55E"
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleToggle}
                  className={`flex-1 flex-row items-center justify-center rounded-xl border-2 py-4 ${
                    !hasTaken
                      ? 'border-gray-400 bg-gray-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  disabled={!hasTaken}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color={!hasTaken ? '#6B7280' : '#9CA3AF'}
                  />
                  <Text
                    className={`ml-2 text-base font-semibold ${
                      !hasTaken ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    안 먹었어요
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 안내 문구 */}
              <Text className="mt-4 text-center text-sm text-gray-400">
                탭하여 복용 상태를 변경할 수 있어요
              </Text>
            </>
          ) : (
            /* 수정 불가 상태 */
            <View className="items-center py-4">
              <Ionicons name="lock-closed-outline" size={32} color="#9CA3AF" />
              <Text className="mt-2 text-center text-base text-gray-500">
                이 날짜는 수정할 수 없어요
              </Text>
              <Text className="mt-1 text-center text-sm text-gray-400">
                첫 복용일 이전 또는 미래 날짜입니다
              </Text>
            </View>
          )}

          {/* 닫기 버튼 */}
          <TouchableOpacity
            onPress={onClose}
            className="mt-6 items-center rounded-xl bg-gray-100 py-4"
          >
            <Text className="text-base font-semibold text-gray-700">닫기</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
