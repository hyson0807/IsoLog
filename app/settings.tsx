import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { NotificationToggle } from '@/components/settings/NotificationToggle';
import { PremiumSection } from '@/components/settings/PremiumSection';
import { usePremiumContext } from '@/contexts/PremiumContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { restorePurchase } = usePremiumContext();

  const handleRestore = async () => {
    try {
      const restored = await restorePurchase();
      if (restored) {
        Alert.alert('복원 완료', '구매 내역이 복원되었습니다!');
      } else {
        Alert.alert(
          '복원 실패',
          '복원할 구매 내역이 없습니다. 이전에 구매하셨다면 앱스토어 계정을 확인해주세요.'
        );
      }
    } catch {
      Alert.alert('오류', '구매 복원 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* 헤더 */}
      <View className="flex-row items-center border-b border-gray-100 bg-white px-5 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="arrow-back" size={24} color="#666666" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">설정</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 프리미엄 섹션 */}
        <View className="px-5 pt-5">
          <PremiumSection
            onPurchase={() => router.push('/paywall')}
            onRestore={handleRestore}
          />
        </View>

        {/* 알림 설정 */}
        <View className="px-5 pt-6">
          <Text className="mb-3 text-sm font-medium text-gray-500">알림</Text>
          <NotificationToggle onPremiumRequired={() => router.push('/paywall')} />
        </View>

        {/* 계정 섹션 (Coming Soon) */}
        <View className="px-5 pt-6">
          <Text className="mb-3 text-sm font-medium text-gray-500">계정</Text>
          <View className="rounded-xl bg-white px-4 py-4">
            <View className="flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <Ionicons name="person-outline" size={20} color="#9CA3AF" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-base font-medium text-gray-400">로그인 / 동기화</Text>
                  <View className="ml-2 rounded-full bg-gray-100 px-2 py-0.5">
                    <Text className="text-xs font-medium text-gray-400">Coming Soon</Text>
                  </View>
                </View>
                <Text className="mt-0.5 text-sm text-gray-300">
                  다른 기기와 데이터를 동기화해요
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 앱 정보 */}
        <View className="px-5 pb-10 pt-6">
          <Text className="mb-3 text-sm font-medium text-gray-500">정보</Text>
          <View className="rounded-xl bg-white">
            <TouchableOpacity className="flex-row items-center justify-between px-4 py-4">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
                </View>
                <Text className="text-base text-gray-700">버전</Text>
              </View>
              <Text className="text-gray-400">1.0.0</Text>
            </TouchableOpacity>

            <View className="mx-4 h-px bg-gray-100" />

            <TouchableOpacity className="flex-row items-center justify-between px-4 py-4">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Ionicons name="document-text-outline" size={20} color="#6B7280" />
                </View>
                <Text className="text-base text-gray-700">이용약관</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            <View className="mx-4 h-px bg-gray-100" />

            <TouchableOpacity className="flex-row items-center justify-between px-4 py-4">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Ionicons name="shield-checkmark-outline" size={20} color="#6B7280" />
                </View>
                <Text className="text-base text-gray-700">개인정보처리방침</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
