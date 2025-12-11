import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MedicationProvider } from "@/contexts/MedicationContext";
import "./global.css";

export default function RootLayout() {
  return (
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
  );
}
