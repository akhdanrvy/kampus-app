import "../global.css";

import { useEffect, useState } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";

import { queryClient } from "@lib/queryClient";
import { useAuthStore } from "@stores/authStore";
import { Colors } from "@constants/colors";
import { ToastContainer } from "@components/ui/ToastContainer";
import { OfflineBanner } from "@components/ui/OfflineBanner";
import { ErrorBoundary } from "@components/ui/ErrorBoundary";
import { supabase } from "@lib/supabase";

// Root layout — wraps every screen with global providers.
// Auth redirect logic lives here so it applies to all routes.
export default function RootLayout() {
  const { isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // onAuthStateChange di Supabase v2 selalu fire INITIAL_SESSION saat startup
    // — gunakan ini sebagai satu-satunya source of truth, tidak perlu getSession() terpisah.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setAuth(session.user.id, session.user.user_metadata?.role ?? "student");
      } else {
        clearAuth();
      }

      // Tandai app siap setelah session pertama diketahui (INITIAL_SESSION atau SIGNED_IN)
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "SIGNED_OUT") {
        setIsReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect guard
  useEffect(() => {
    if (!isReady) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/beranda");
    }
  }, [isAuthenticated, segments, isReady]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.white }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <StatusBar style="auto" />
        <OfflineBanner />
        <Slot />
        <ToastContainer />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
