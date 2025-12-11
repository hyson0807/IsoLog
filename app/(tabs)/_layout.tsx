import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="people-outline" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}