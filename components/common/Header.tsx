import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '@/utils/dateUtils';

interface HeaderProps {
  showSettings?: boolean;
  onSettingsPress?: () => void;
}

export function Header({ showSettings = true, onSettingsPress }: HeaderProps) {
  const today = new Date();
  const formattedDate = formatDate(today);

  return (
    <View className="flex-row items-center justify-between px-5 py-4">
      <Text className="text-2xl font-bold text-gray-900">{formattedDate}</Text>
      {showSettings && (
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
          onPress={onSettingsPress}
        >
          <Ionicons name="settings-outline" size={22} color="#666666" />
        </TouchableOpacity>
      )}
    </View>
  );
}