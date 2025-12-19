import { Tabs } from 'expo-router';
import { Pressable, View, GestureResponderEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}

function TabIcon({ name, focused }: TabIconProps) {
  return (
    <View
      className={`items-center justify-center rounded-2xl ${
        focused ? 'bg-orange-500' : 'bg-transparent'
      }`}
      style={{ width: 56, height: 40 }}
    >
      <Ionicons
        name={name}
        size={24}
        color={focused ? '#FFFFFF' : '#9E9E9E'}
      />
    </View>
  );
}

interface TabBarButtonProps {
  children: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  accessibilityState?: { selected?: boolean };
}

function TabBarButton({ children, onPress, ...rest }: TabBarButtonProps) {
  const handlePress = (e: GestureResponderEvent) => {
    // 햅틱 피드백 실행
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.(e);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      {...rest}
    >
      {children}
    </Pressable>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          height: 85,
          paddingBottom: 30,
          paddingTop: 12,
        },
      }}
    >
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="calendar-outline" focused={focused} />
          ),
          tabBarButton: (props) => <TabBarButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} />
          ),
          tabBarButton: (props) => <TabBarButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="tracking"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="stats-chart-outline" focused={focused} />
          ),
          tabBarButton: (props) => <TabBarButton {...props} />,
        }}
      />
    </Tabs>
  );
}