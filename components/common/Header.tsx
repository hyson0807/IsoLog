import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '@/utils/dateUtils';

interface HeaderProps {
  showMenu?: boolean;
  onMenuPress?: () => void;
}

export function Header({ showMenu = true, onMenuPress }: HeaderProps) {
  const today = new Date();
  const formattedDate = formatDate(today);

  return (
    <View className="flex-row items-center justify-between px-5 py-4">
      <Text className="text-2xl font-bold text-gray-900">{formattedDate}</Text>
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