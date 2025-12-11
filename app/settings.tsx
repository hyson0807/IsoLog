import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 */}
      <View className="flex-row items-center border-b border-gray-100 px-5 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="arrow-back" size={24} color="#666666" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">설정</Text>
      </View>

      {/* 컨텐츠 */}
      <View className="flex-1 items-center justify-center">
        <Ionicons name="construct-outline" size={64} color="#D1D5DB" />
        <Text className="mt-4 text-xl font-semibold text-gray-400">
          Coming Soon
        </Text>
        <Text className="mt-2 text-base text-gray-300">
          설정 기능을 준비 중입니다
        </Text>
      </View>
    </SafeAreaView>
  );
}
