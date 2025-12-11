import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePremiumContext } from '@/contexts/PremiumContext';
import { useNotificationPermission } from '@/hooks/useNotificationPermission';

interface NotificationToggleProps {
  onPremiumRequired: () => void;
}

export function NotificationToggle({ onPremiumRequired }: NotificationToggleProps) {
  const { isPremium, notificationEnabled, setNotificationEnabled } = usePremiumContext();
  const { hasPermission, requestPermission } = useNotificationPermission();

  const handleToggle = async () => {
    if (!isPremium) {
      onPremiumRequired();
      return;
    }

    // 알림 권한이 없으면 먼저 요청
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        return;
      }
    }

    setNotificationEnabled(!notificationEnabled);
  };

  const isEnabled = isPremium && notificationEnabled;
  const isLocked = !isPremium;

  return (
    <TouchableOpacity
      onPress={handleToggle}
      activeOpacity={0.7}
      className="flex-row items-center justify-between rounded-xl bg-white px-4 py-4"
    >
      <View className="flex-1 flex-row items-center">
        <View
          className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${
            isLocked ? 'bg-gray-100' : 'bg-orange-100'
          }`}
        >
          <Ionicons
            name={isLocked ? 'lock-closed' : 'notifications'}
            size={20}
            color={isLocked ? '#9CA3AF' : '#F97316'}
          />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text
              className={`text-base font-medium ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}
            >
              복용 알림
            </Text>
            {isLocked && (
              <View className="ml-2 rounded-full bg-orange-100 px-2 py-0.5">
                <Text className="text-xs font-medium text-orange-600">PRO</Text>
              </View>
            )}
          </View>
          <Text className={`mt-0.5 text-sm ${isLocked ? 'text-gray-300' : 'text-gray-500'}`}>
            복용일 밤 10시에 알림을 받아요
          </Text>
        </View>
      </View>
      <Switch
        value={isEnabled}
        onValueChange={handleToggle}
        disabled={isLocked}
        trackColor={{ false: '#E5E7EB', true: '#FDBA74' }}
        thumbColor={isEnabled ? '#F97316' : '#F3F4F6'}
        ios_backgroundColor="#E5E7EB"
      />
    </TouchableOpacity>
  );
}