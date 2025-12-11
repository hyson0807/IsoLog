import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CommunityScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-semibold text-gray-800">커뮤니티</Text>
        <Text className="mt-2 text-gray-500">Comming Soon</Text>
      </View>
    </SafeAreaView>
  );
}