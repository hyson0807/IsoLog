import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { formatDateShort } from '@/utils/dateUtils';
import { DrinkingWarningLevel } from '@/types/medication';

interface DayDetailSheetProps {
  visible: boolean;
  date: string | null;
  hasTaken: boolean;
  canEdit: boolean;
  isDrinkingDate: boolean;
  warningLevel: DrinkingWarningLevel | null;
  onToggle: () => void;
  onToggleDrinking: () => void;
  onClose: () => void;
}

export function DayDetailSheet({
  visible,
  date,
  hasTaken,
  canEdit,
  isDrinkingDate,
  warningLevel,
  onToggle,
  onToggleDrinking,
  onClose,
}: DayDetailSheetProps) {
  if (!date) return null;

  const handleToggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle();
  };

  const handleToggleDrinking = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggleDrinking();
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

          {/* 복용 체크 + 술 약속 카드 (1줄에 2개) */}
          <View className="flex-row gap-3">
            {/* 복용 체크 카드 */}
            {canEdit ? (
              <TouchableOpacity
                onPress={handleToggle}
                className={`flex-1 items-center rounded-xl border-2 py-5 ${
                  hasTaken
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <Ionicons
                  name={hasTaken ? 'checkmark-circle' : 'medical'}
                  size={32}
                  color={hasTaken ? '#22C55E' : '#9CA3AF'}
                />
                <Text
                  className={`mt-2 text-sm font-semibold ${
                    hasTaken ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {hasTaken ? '복용 완료' : '복용 체크'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-1 items-center rounded-xl border-2 border-gray-100 bg-gray-50 py-5">
                <Ionicons name="lock-closed-outline" size={32} color="#D1D5DB" />
                <Text className="mt-2 text-sm font-semibold text-gray-300">
                  수정 불가
                </Text>
              </View>
            )}

            {/* 술 약속 카드 */}
            <TouchableOpacity
              onPress={handleToggleDrinking}
              className={`flex-1 items-center rounded-xl border-2 py-5 ${
                isDrinkingDate
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <Ionicons
                name="wine"
                size={32}
                color={isDrinkingDate ? '#DC2626' : '#9CA3AF'}
              />
              <Text
                className={`mt-2 text-sm font-semibold ${
                  isDrinkingDate ? 'text-red-600' : 'text-gray-400'
                }`}
              >
                {isDrinkingDate ? '술 약속 있음' : '술 약속 추가'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 경고 안내 (경고 기간일 때) */}
          {warningLevel && (
            <View className="mt-4 rounded-lg bg-red-50 p-3">
              <Text className="text-center text-sm text-red-600">
                음주 전후 4일은 간 건강을 위해 휴약을 권장합니다
              </Text>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
