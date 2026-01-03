import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '@/utils/dateUtils';

interface HeaderProps {
  today?: string; // YYYY-MM-DD 형식
  showMenu?: boolean;
  onMenuPress?: () => void;
}

export function Header({
  today,
  showMenu = true,
  onMenuPress,
}: HeaderProps) {
  const todayDate = today ? new Date(today + 'T00:00:00') : new Date();
  const formattedDate = formatDate(todayDate);

  return (
    <View className="flex-row items-center justify-between px-5 py-4">
      {/* 왼쪽: 날짜 */}
      <Text className="text-2xl font-bold text-gray-900">{formattedDate}</Text>

      {/* 오른쪽: 메뉴 버튼 */}
      {showMenu && (
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center rounded-full"
          onPress={onMenuPress}
        >
            <Ionicons name="menu" size={24} color="#374151" />
        </TouchableOpacity>
      )}
    </View>
  );
}