import { Stack } from "expo-router";

export default function InfoLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="content" />
      <Stack.Screen name="liked" />
    </Stack>
  );
}
