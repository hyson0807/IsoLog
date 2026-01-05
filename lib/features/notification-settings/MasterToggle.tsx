import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface MasterToggleProps {
  /** 토글 상태 */
  enabled: boolean;
  /** 토글 변경 핸들러 */
  onToggle: () => void;
}

export function MasterToggle({ enabled, onToggle }: MasterToggleProps) {
  const { t } = useTranslation();

  return (
    <View className="px-5 pt-5">
      <View className="rounded-xl bg-white px-4 py-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={onToggle}
            activeOpacity={0.7}
            className="flex-1 flex-row items-center"
          >
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <Ionicons name="notifications" size={20} color="#F97316" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">
                {t('notificationSettings.masterToggle')}
              </Text>
              <Text className="mt-0.5 text-sm text-gray-500">
                {t('notificationSettings.masterToggleDesc')}
              </Text>
            </View>
          </TouchableOpacity>
          <Switch
            value={enabled}
            onValueChange={onToggle}
            trackColor={{ false: '#E5E7EB', true: '#FDBA74' }}
            thumbColor={enabled ? '#F97316' : '#F3F4F6'}
            ios_backgroundColor="#E5E7EB"
          />
        </View>
      </View>
    </View>
  );
}
