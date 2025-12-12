import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const BENEFITS = [
  {
    icon: 'notifications-outline' as const,
    title: '매일 복용 알림',
    description: '원하는 시간에 잊지 않게 알려드려요',
  },
  {
    icon: 'close-circle-outline' as const,
    title: '광고 없는 화면',
    description: '방해 요소 없이 기록에만 집중하세요',
  },
  {
    icon: 'infinite-outline' as const,
    title: '평생 소장',
    description: '추가 비용 없는 단 한 번의 결제입니다',
  },
];

export default function PaywallScreen() {
  const router = useRouter();

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handlePurchase = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: RevenueCat 결제 연동
    Alert.alert('준비 중', '인앱 결제 기능을 준비 중입니다.');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 상단 닫기 버튼 */}
      <View className="flex-row justify-end px-5 pt-2">
        <TouchableOpacity
          onPress={handleClose}
          className="h-10 w-10 items-center justify-center rounded-full"
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={28} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* 메인 컨텐츠 */}
      <View className="flex-1 px-6">
        {/* 히어로 섹션 */}
        <View className="mt-8">
          <Text className="text-3xl font-bold leading-tight text-gray-900">
            더 깨끗한 피부를 위한,{'\n'}완벽한 습관을 완성하세요.
          </Text>
          <Text className="mt-4 text-base leading-relaxed text-gray-500">
            평생 한 번 결제로 광고 없이,{'\n'}매일 알림으로 꾸준하게 관리하세요.
          </Text>
        </View>

        {/* 혜택 리스트 */}
        <View className="mt-12">
          {BENEFITS.map((benefit, index) => (
            <View key={index} className="mb-6 flex-row items-start">
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-orange-50">
                <Ionicons name={benefit.icon} size={24} color="#FF6B35" />
              </View>
              <View className="flex-1 pt-1">
                <Text className="text-lg font-semibold text-gray-900">
                  {benefit.title}
                </Text>
                <Text className="mt-1 text-sm text-gray-500">
                  {benefit.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 하단 CTA 섹션 */}
      <View className="border-t border-gray-100 px-6 pb-4 pt-6">
        {/* 가격 */}
        <View className="mb-4 items-center">
          <View className="flex-row items-baseline">
            <Text className="text-3xl font-bold text-gray-900">USD 9.99</Text>
          </View>
          <Text className="mt-1 text-sm text-gray-400">평생 소장</Text>
        </View>

        {/* 구매 버튼 */}
        <TouchableOpacity
          onPress={handlePurchase}
          className="items-center rounded-2xl bg-orange-500 py-4"
          activeOpacity={0.8}
        >
          <Text className="text-lg font-bold text-white">
            지금 프리미엄 시작하기
          </Text>
        </TouchableOpacity>

        {/* 보조 텍스트 */}
        <Text className="mt-4 text-center text-xs text-gray-400">
          결제는 Apple/Google 계정으로 청구됩니다
        </Text>
      </View>
    </SafeAreaView>
  );
}
