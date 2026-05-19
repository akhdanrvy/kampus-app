import { Stack } from "expo-router";

export default function ProfilLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "ios_from_right",
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        animationDuration: 220,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="about" />
    </Stack>
  );
}
