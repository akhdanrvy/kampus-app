import { Redirect } from "expo-router";
import { useAuthStore } from "@stores/authStore";

// Entry point app. Saat _layout sudah selesai bootstrap session,
// komponen ini me-redirect berdasarkan auth state real (bukan MOCK).
// Karena Zustand userId sudah di-set sebelum <Slot /> dirender, redirect ini
// selalu konsisten dan tidak menimbulkan flash blank screen.
export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/beranda" />;
  }
  return <Redirect href="/(auth)/login" />;
}
