import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CalendarScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-semibold text-gray-800">캘린더</Text>
        <Text className="mt-2 text-gray-500">복용 기록을 조회할 수 있습니다</Text>
      </View>
    </SafeAreaView>
  );
}