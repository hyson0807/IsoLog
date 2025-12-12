import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { FrequencyType } from '@/types/medication';

interface FrequencySettingButtonProps {
  currentFrequency: FrequencyType;
  onPress: () => void;
}

export function FrequencySettingButton({
  currentFrequency,
  onPress,
}: FrequencySettingButtonProps) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mx-5 flex-row items-center justify-center rounded-full bg-gray-100 px-5 py-3"
    >
      <Text className="text-base text-gray-700">
        {t('frequency.current')} {t(`frequency.${currentFrequency}.label`)}
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