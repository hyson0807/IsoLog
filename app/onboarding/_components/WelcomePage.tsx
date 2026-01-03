import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { OnboardingPage } from './OnboardingPage';

export function WelcomePage() {
  const { t } = useTranslation();

  return (
    <OnboardingPage
      title={t('onboarding.page1.title')}
      subtitle={t('onboarding.page1.subtitle')}
    >
      <View className="mt-8 gap-8">
        <View>
          <Text className="text-base font-semibold text-gray-900">
            {t('onboarding.page1.feature1Title')}
          </Text>
          <Text className="mt-2 text-sm leading-6 text-gray-500">
            {t('onboarding.page1.feature1Desc')}
          </Text>
        </View>

        <View>
          <Text className="text-base font-semibold text-gray-900">
            {t('onboarding.page1.feature2Title')}
          </Text>
          <Text className="mt-2 text-sm leading-6 text-gray-500">
            {t('onboarding.page1.feature2Desc')}
          </Text>
        </View>
      </View>
    </OnboardingPage>
  );
}
