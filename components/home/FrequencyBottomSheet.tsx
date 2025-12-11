import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FrequencyType } from '@/types/medication';
import { frequencyOptions } from '@/constants/frequency';

interface FrequencyBottomSheetProps {
  visible: boolean;
  currentFrequency: FrequencyType;
  onSelect: (frequency: FrequencyType) => void;
  onClose: () => void;
}

export function FrequencyBottomSheet({
  visible,
  currentFrequency,
  onSelect,
  onClose,
}: FrequencyBottomSheetProps) {
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
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">
              복용 주기를 선택해주세요
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <View className="gap-3">
            {frequencyOptions.map((option) => {
              const isSelected = option.type === currentFrequency;
              return (
                <TouchableOpacity
                  key={option.type}
                  onPress={() => onSelect(option.type)}
                  className={`flex-row items-center justify-between rounded-xl border-2 p-4 ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <View>
                    <Text
                      className={`text-base font-semibold ${
                        isSelected ? 'text-orange-600' : 'text-gray-800'
                      }`}
                    >
                      {option.label}
                    </Text>
                    <Text className="mt-1 text-sm text-gray-500">
                      {option.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={onClose}
            className="mt-6 items-center rounded-xl bg-orange-500 py-4"
          >
            <Text className="text-base font-semibold text-white">설정 완료</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}