import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FrequencyType } from '@/types/medication';
import { frequencyOptions } from '@/constants/frequency';

interface FrequencySettingButtonProps {
  currentFrequency: FrequencyType;
  onPress: () => void;
}

export function FrequencySettingButton({
  currentFrequency,
  onPress,
}: FrequencySettingButtonProps) {
  const currentOption = frequencyOptions.find(
    (option) => option.type === currentFrequency
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mx-5 flex-row items-center justify-center rounded-full bg-gray-100 px-5 py-3"
    >
      <Text className="text-base text-gray-700">
        현재: {currentOption?.label || '매일 복용'}
      </Text>
      <Ionicons
        name="pencil"
        size={16}
        color="#666666"
        style={{ marginLeft: 8 }}
      />
    </TouchableOpacity>
  );
}