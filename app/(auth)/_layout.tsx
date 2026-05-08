import { Stack } from "expo-router";

// Auth group layout — Stack without a visible header.
// Screens: login, register, forgot-password
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
