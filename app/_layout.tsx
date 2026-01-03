import 'react-native-get-random-values'; // crypto 폴리필 (AWS SDK용, 다른 import보다 먼저!)
import React from 'react';
import '@/locales';
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MedicationProvider } from "@/contexts/MedicationContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { NotificationSettingsProvider } from "@/contexts/NotificationSettingsContext";
import { LikedContentsProvider } from "@/contexts/LikedContentsContext";
import { UpdateLoadingScreen } from "@/components/common/UpdateLoadingScreen";
import { useAppUpdates } from "@/hooks/useAppUpdates";
import "./global.css";

function AppContent() {
  const { isUpdating } = useAppUpdates();

  if (isUpdating) {
    return <UpdateLoadingScreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="onboarding"
        options={{
          presentation: 'fullScreenModal',
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="settings/notification-settings/index"
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="(premium)/paywall"
        options={{
          presentation: 'modal',
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="(premium)/subscription"
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PremiumProvider>
      <NotificationSettingsProvider>
        <MedicationProvider>
          <LikedContentsProvider>
            <SafeAreaProvider>
              <AppContent />
            </SafeAreaProvider>
          </LikedContentsProvider>
        </MedicationProvider>
      </NotificationSettingsProvider>
    </PremiumProvider>
  );
}
