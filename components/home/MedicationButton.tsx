import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface MedicationButtonProps {
  hasTaken: boolean;
  isMedicationDay: boolean;
  onPress: () => void;
}

export function MedicationButton({
  hasTaken,
  isMedicationDay,
  onPress,
}: MedicationButtonProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  if (!isMedicationDay) {
    return (
      <View className="items-center justify-center py-10">
        <View className="h-40 w-40 items-center justify-center rounded-full bg-gray-100">
          <Ionicons name="bed-outline" size={64} color="#9E9E9E" />
        </View>
        <Text className="mt-4 text-lg text-gray-500">휴약일</Text>
      </View>
    );
  }

  return (
    <View className="items-center justify-center py-10">
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        className={`h-40 w-40 items-center justify-center rounded-full shadow-lg ${
          hasTaken ? 'bg-green-500' : 'bg-orange-500'
        }`}
        style={{
          shadowColor: hasTaken ? '#4CAF50' : '#FF6B35',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        {hasTaken ? (
          <Ionicons name="checkmark-circle" size={64} color="#FFFFFF" />
        ) : (
          <Ionicons name="medical" size={64} color="#FFFFFF" />
        )}
      </TouchableOpacity>
      <Text
        className={`mt-4 text-lg font-semibold ${
          hasTaken ? 'text-green-600' : 'text-orange-600'
        }`}
      >
        {hasTaken ? '복용 완료!' : '복용 체크하기'}
      </Text>
      {hasTaken && (
        <Text className="mt-1 text-sm text-gray-400">다시 누르면 취소됩니다</Text>
      )}
    </View>
  );
}