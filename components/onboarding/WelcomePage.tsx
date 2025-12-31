import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { OnboardingPage } from './OnboardingPage';

export function WelcomePage() {
  const { t } = useTranslation();

  return (
    <OnboardingPage
      title={t('onboarding.page1.title')}
      subtitle={t('onboarding.page1.subtitle')}
    >
      <View className="flex-1 items-center justify-center">
        {/* Illustration */}
        <View className="mb-8 h-48 w-48 items-center justify-center rounded-full bg-orange-50">
          <Ionicons name="medical" size={80} color="#F97316" />
        </View>

        {/* Features */}
        <View className="w-full gap-4">
          <View className="flex-row items-center rounded-xl bg-gray-50 p-4">
            <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <Ionicons name="checkmark-circle" size={24} color="#F97316" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-gray-900">
                {t('onboarding.page1.feature1Title')}
              </Text>
              <Text className="mt-1 text-sm text-gray-500">
                {t('onboarding.page1.feature1Desc')}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center rounded-xl bg-gray-50 p-4">
            <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Ionicons name="calendar" size={24} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-gray-900">
                {t('onboarding.page1.feature2Title')}
              </Text>
              <Text className="mt-1 text-sm text-gray-500">
                {t('onboarding.page1.feature2Desc')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </OnboardingPage>
  );
}
