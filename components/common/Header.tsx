import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '@/utils/dateUtils';

interface HeaderProps {
  today?: string; // YYYY-MM-DD 형식
  showMenu?: boolean;
  onMenuPress?: () => void;
  isPremium?: boolean;
  notificationEnabled?: boolean;
  onNotificationPress?: () => void;
}

export function Header({
  today,
  showMenu = true,
  onMenuPress,
  notificationEnabled = false,
  onNotificationPress,
}: HeaderProps) {
  const todayDate = today ? new Date(today + 'T00:00:00') : new Date();
  const formattedDate = formatDate(todayDate);

  return (
    <View className="flex-row items-center justify-between px-5 py-4">
      {/* 왼쪽: 날짜 + 알림 토글 */}
      <View className="flex-row items-center gap-2">
        <Text className="text-2xl font-bold text-gray-900">{formattedDate}</Text>

        {/* 커스텀 알림 토글 스위치 */}
        <TouchableOpacity
          onPress={onNotificationPress}
          activeOpacity={0.8}
          className="flex-row items-center ml-2"
        >
          {/* 트랙 (배경) */}
          <View
            className={`h-7 w-12 flex-row items-center rounded-full px-1 ${
              notificationEnabled ? 'bg-orange-400' : 'bg-gray-300'
            }`}
          >
            {/* 썸 (원형 버튼) */}
            <View
              className={`h-5 w-5 items-center justify-center rounded-full bg-white shadow ${
                notificationEnabled ? 'ml-auto' : ''
              }`}
            >
              {/* OFF 상태: 회색 알림 아이콘 */}
              {!notificationEnabled && (
                <Ionicons name="notifications-off" size={12} color="#9CA3AF" />
              )}
              {/* ON 상태: 주황색 알림 아이콘 */}
              {notificationEnabled && (
                <Ionicons name="notifications" size={12} color="#F97316" />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* 오른쪽: 메뉴 버튼 */}
      {showMenu && (
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
          onPress={onMenuPress}
        >
          <Ionicons name="menu-outline" size={24} color="#666666" />
        </TouchableOpacity>
      )}
    </View>
  );
}