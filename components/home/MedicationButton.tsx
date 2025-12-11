import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { DrinkingWarningLevel } from '@/types/medication';

interface MedicationButtonProps {
  hasTaken: boolean;
  isMedicationDay: boolean;
  warningLevel?: DrinkingWarningLevel | null;
  onPress: () => void;
}

export function MedicationButton({
  hasTaken,
  isMedicationDay,
  warningLevel,
  onPress,
}: MedicationButtonProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  // 휴약일 (복용일이 아닌 날)
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

  // 경고 상태 + 아직 복용 안 함
  const isWarning = warningLevel && !hasTaken;

  // 버튼 색상 결정
  const getButtonStyle = () => {
    if (hasTaken) {
      return {
        bgClass: 'bg-green-500',
        shadowColor: '#4CAF50',
      };
    }
    if (isWarning) {
      return {
        bgClass: 'bg-red-500',
        shadowColor: '#DC2626',
      };
    }
    return {
      bgClass: 'bg-orange-500',
      shadowColor: '#FF6B35',
    };
  };

  const { bgClass, shadowColor } = getButtonStyle();

  // 텍스트 색상 결정
  const getTextColor = () => {
    if (hasTaken) return 'text-green-600';
    if (isWarning) return 'text-red-600';
    return 'text-orange-600';
  };

  // 버튼 텍스트 결정
  const getButtonText = () => {
    if (hasTaken) return '복용 완료!';
    if (isWarning) return '복용 주의!';
    return '복용 체크하기';
  };

  return (
    <View className="items-center justify-center py-10">
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        className={`h-40 w-40 items-center justify-center rounded-full shadow-lg ${bgClass}`}
        style={{
          shadowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        {hasTaken ? (
          <Ionicons name="checkmark-circle" size={64} color="#FFFFFF" />
        ) : isWarning ? (
          <View className="items-center">
            <Ionicons name="warning" size={48} color="#FFFFFF" />
            <Ionicons
              name="medical"
              size={24}
              color="#FFFFFF"
              style={{ marginTop: 4 }}
            />
          </View>
        ) : (
          <Ionicons name="medical" size={64} color="#FFFFFF" />
        )}
      </TouchableOpacity>
      <Text className={`mt-4 text-lg font-semibold ${getTextColor()}`}>
        {getButtonText()}
      </Text>
      {hasTaken && (
        <Text className="mt-1 text-sm text-gray-400">다시 누르면 취소됩니다</Text>
      )}
      {isWarning && (
        <Text className="mt-1 text-sm text-red-400">음주 전후 기간입니다</Text>
      )}
    </View>
  );
}