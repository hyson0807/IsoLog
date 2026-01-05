import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Pressable, View, GestureResponderEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';

interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}

function TabIcon({ name, focused }: TabIconProps) {
  const scale = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(scale.value, [0, 1], [1, 1.2]) }],
  }));

  return (
    <View
      className="items-center justify-center"
      style={{ width: 56, height: 40 }}
    >
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={name}
          size={24}
          color={focused ? '#F97316' : '#9E9E9E'}
        />
      </Animated.View>
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
  const insets = useSafeAreaInsets();

  const TAB_BAR_CONTENT_HEIGHT = 55;

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 12,
        },
      }}
    >

        <Tabs.Screen
            name="calendar"
            options={{
                tabBarIcon: ({ focused }) => (
                    <TabIcon name="calendar" focused={focused} />
                ),
                tabBarButton: (props) => <TabBarButton {...props} />,
            }}
        />

      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} />
          ),
          tabBarButton: (props) => <TabBarButton {...props} />,
        }}
      />

      <Tabs.Screen
        name="info"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="newspaper" focused={focused} />
          ),
          tabBarButton: (props) => <TabBarButton {...props} />,
        }}
      />
    </Tabs>
  );
}