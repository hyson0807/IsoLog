import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MedicationProvider } from "@/contexts/MedicationContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import "./global.css";

export default function RootLayout() {
  return (
    <PremiumProvider>
      <MedicationProvider>
        <SafeAreaProvider>
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
        </Stack>
        </SafeAreaProvider>
      </MedicationProvider>
    </PremiumProvider>
  );
}
