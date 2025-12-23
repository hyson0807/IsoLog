import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { formatTime } from '@/utils/timeFormat';

interface TimeSettingRowProps {
  /** 시간 */
  hour: number;
  /** 분 */
  minute: number;
  /** 클릭 핸들러 */
  onPress: () => void;
  /** 활성화 여부 */
  enabled?: boolean;
  /** 활성화 색상 */
  activeColor?: string;
}

export function TimeSettingRow({
  hour,
  minute,
  onPress,
  enabled = true,
  activeColor = '#3B82F6',
}: TimeSettingRowProps) {
  const { t, i18n } = useTranslation();
  const isKorean = i18n.language === 'ko';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={enabled ? 0.7 : 1}
      className={`mt-3 flex-row items-center justify-between border-t border-gray-100 pt-3 ${
        !enabled ? 'opacity-50' : ''
      }`}
    >
      <Text className="text-sm text-gray-500">{t('notification.time')}</Text>
      <View className="flex-row items-center">
        <Text
          className="mr-1 text-base font-medium"
          style={{ color: enabled ? activeColor : '#9CA3AF' }}
        >
          {formatTime(hour, minute, isKorean)}
        </Text>
        {enabled && <Ionicons name="chevron-forward" size={16} color={activeColor} />}
      </View>
    </TouchableOpacity>
  );
}
