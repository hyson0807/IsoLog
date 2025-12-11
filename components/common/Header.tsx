import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '@/utils/dateUtils';

interface HeaderProps {
  showMenu?: boolean;
  onMenuPress?: () => void;
  isPremium?: boolean;
  notificationEnabled?: boolean;
  onNotificationPress?: () => void;
}

export function Header({
  showMenu = true,
  onMenuPress,
  isPremium = false,
  notificationEnabled = false,
  onNotificationPress,
}: HeaderProps) {
  const today = new Date();
  const formattedDate = formatDate(today);

  return (
    <View className="flex-row items-center justify-between px-5 py-4">
      <Text className="text-2xl font-bold text-gray-900">{formattedDate}</Text>
      <View className="flex-row items-center gap-2">
        {/* 알림 아이콘 */}
        <TouchableOpacity
          className="relative h-10 w-10 items-center justify-center rounded-full bg-gray-100"
          onPress={onNotificationPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name={notificationEnabled ? 'notifications' : 'notifications-outline'}
            size={22}
            color={isPremium && notificationEnabled ? '#F97316' : '#666666'}
          />
          {/* 무료 유저: 자물쇠 뱃지 */}
          {!isPremium && (
            <View className="absolute -bottom-0.5 -right-0.5 h-4 w-4 items-center justify-center rounded-full bg-gray-600">
              <Ionicons name="lock-closed" size={10} color="white" />
            </View>
          )}
        </TouchableOpacity>

        {/* 메뉴 버튼 */}
        {showMenu && (
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            onPress={onMenuPress}
          >
            <Ionicons name="menu-outline" size={24} color="#666666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}