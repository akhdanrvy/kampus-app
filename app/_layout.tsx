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

// TODO: Re-enable Supabase auth check when backend is connected
// import { supabase } from "@lib/supabase";

// ---------------------------------------------------------------------------
// Mock session — inject a pre-authenticated state so all screens are accessible
// without a real Supabase connection.
// TODO: Remove this block and uncomment the Supabase session check below
// ---------------------------------------------------------------------------
const MOCK_SESSION = {
  isAuthenticated: true,
  userId: "mock-user-id-123",
  userRole: "student",
} as const;

// Root layout — wraps every screen with global providers.
// Auth redirect logic lives here so it applies to all routes.
export default function RootLayout() {
  const { isAuthenticated, setAuth } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // TODO: Replace this mock session with the Supabase auth check below
    //       when the backend is connected:
    //
    // rehydrate();
    // supabase.auth.getSession().then(({ data: { session } }) => {
    //   if (session?.user) {
    //     setAuth(session.user.id, session.user.user_metadata?.role ?? "student");
    //   } else {
    //     clearAuth();
    //   }
    //   setIsReady(true);
    // });
    // const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
    //   if (session?.user) setAuth(session.user.id, session.user.user_metadata?.role ?? "student");
    //   else clearAuth();
    // });
    // return () => subscription.unsubscribe();

    // Inject mock session — bypasses login screen for UI development
    setAuth(MOCK_SESSION.userId, MOCK_SESSION.userRole);
    setIsReady(true);
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
