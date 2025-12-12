import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function TermsScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-100 px-5 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="arrow-back" size={24} color="#666666" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">{t('legal.termsTitle')}</Text>
      </View>

      <ScrollView className="flex-1 px-5 py-6" showsVerticalScrollIndicator={false}>
        {/* Last Updated */}
        <Text className="mb-6 text-sm text-gray-400">{t('legal.lastUpdated')}: 2024-12-12</Text>

        {/* Section 1 */}
        <View className="mb-6">
          <Text className="mb-2 text-lg font-bold text-gray-900">{t('legal.terms.section1Title')}</Text>
          <Text className="leading-6 text-gray-600">{t('legal.terms.section1Content')}</Text>
        </View>

        {/* Section 2 */}
        <View className="mb-6">
          <Text className="mb-2 text-lg font-bold text-gray-900">{t('legal.terms.section2Title')}</Text>
          <Text className="leading-6 text-gray-600">{t('legal.terms.section2Content')}</Text>
        </View>

        {/* Section 3 */}
        <View className="mb-6">
          <Text className="mb-2 text-lg font-bold text-gray-900">{t('legal.terms.section3Title')}</Text>
          <Text className="leading-6 text-gray-600">{t('legal.terms.section3Content')}</Text>
        </View>

        {/* Section 4 */}
        <View className="mb-6">
          <Text className="mb-2 text-lg font-bold text-gray-900">{t('legal.terms.section4Title')}</Text>
          <Text className="leading-6 text-gray-600">{t('legal.terms.section4Content')}</Text>
        </View>

        {/* Section 5 */}
        <View className="mb-6">
          <Text className="mb-2 text-lg font-bold text-gray-900">{t('legal.terms.section5Title')}</Text>
          <Text className="leading-6 text-gray-600">{t('legal.terms.section5Content')}</Text>
        </View>

        {/* Section 6 */}
        <View className="mb-10">
          <Text className="mb-2 text-lg font-bold text-gray-900">{t('legal.terms.section6Title')}</Text>
          <Text className="leading-6 text-gray-600">{t('legal.terms.section6Content')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
