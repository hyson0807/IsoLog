import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function Index() {
  const { shouldShowOnboarding, isLoading } = useOnboarding();

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return <Redirect href={shouldShowOnboarding ? '/onboarding' : '/home'} />;
}
