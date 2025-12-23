import React from 'react';
import '@/locales';
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MedicationProvider } from "@/contexts/MedicationContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { NotificationSettingsProvider } from "@/contexts/NotificationSettingsContext";
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
        name="settings"
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="paywall"
        options={{
          presentation: 'modal',
          animation: 'fade',
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
          <SafeAreaProvider>
            <AppContent />
          </SafeAreaProvider>
        </MedicationProvider>
      </NotificationSettingsProvider>
    </PremiumProvider>
  );
}
