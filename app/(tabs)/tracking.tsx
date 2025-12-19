import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function TrackingScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Text className="mt-2 text-gray-500">{t('common.comingSoon')}</Text>
      </View>
    </SafeAreaView>
  );
}