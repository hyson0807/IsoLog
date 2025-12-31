import { View, Text, Dimensions, ScrollView } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingPageProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function OnboardingPage({ children, title, subtitle }: OnboardingPageProps) {
  return (
    <View style={{ width: SCREEN_WIDTH }} className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-8">
          <View className="mb-8">
            <Text className="text-2xl font-bold text-gray-900">{title}</Text>
            {subtitle && (
              <Text className="mt-2 text-base text-gray-500">{subtitle}</Text>
            )}
          </View>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

export { SCREEN_WIDTH };
