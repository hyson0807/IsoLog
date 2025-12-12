import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface NotificationTimeBottomSheetProps {
  visible: boolean;
  currentHour: number;
  currentMinute: number;
  onSave: (hour: number, minute: number) => void;
  onClose: () => void;
}

export function NotificationTimeBottomSheet({
  visible,
  currentHour,
  currentMinute,
  onSave,
  onClose,
}: NotificationTimeBottomSheetProps) {
  const [selectedTime, setSelectedTime] = useState(() => {
    const date = new Date();
    date.setHours(currentHour, currentMinute, 0, 0);
    return date;
  });

  const handleTimeChange = (_: unknown, date?: Date) => {
    if (date) {
      setSelectedTime(date);
    }
  };

  const handleSave = () => {
    onSave(selectedTime.getHours(), selectedTime.getMinutes());
  };

  // Android에서는 inline 모드가 없으므로 spinner 사용
  const pickerMode = Platform.OS === 'ios' ? 'spinner' : 'spinner';

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
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">
              알림 시간 설정
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          {/* 타임 피커 */}
          <View className="items-center py-4">
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display={pickerMode}
              onChange={handleTimeChange}
              locale="ko-KR"
              style={{ width: '100%', height: 180 }}
            />
          </View>

          {/* 안내 문구 */}
          <View className="mb-6 flex-row items-center justify-center">
            <Ionicons name="information-circle-outline" size={16} color="#888888" />
            <Text className="ml-1 text-sm text-gray-500">
              알림은 복용 주기에 맞춰 복용일에만 울립니다.
            </Text>
          </View>

          {/* 저장 버튼 */}
          <TouchableOpacity
            onPress={handleSave}
            className="items-center rounded-xl bg-orange-500 py-4"
          >
            <Text className="text-base font-semibold text-white">설정 완료</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
