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
import { clearAllCache } from "@lib/mmkv";
import { profileKeys } from "@constants/queryKeys";

// Root layout — pasang semua provider global + bootstrap auth.
// Redirect logic dipindah ke app/index.tsx supaya entry-point eksplisit dan
// tidak balapan dengan useSegments() saat cold start.
export default function RootLayout() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // TEMPORARY DEBUG — clear stale mock profile cache. Hapus setelah resolved.
    // Guard typeof: aman dipanggil di native (mmkv) maupun web (localStorage).
    if (typeof localStorage === "undefined") {
      // Native path — MMKV tersedia, localStorage tidak ada
      clearAllCache();
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // 1) Bootstrap: tarik session yang sudah tersimpan di SecureStore sekali
    //    di awal. Ini menghindari kondisi di mana onAuthStateChange belum fire
    //    INITIAL_SESSION saat komponen mount.
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log("[_layout] getSession:", session?.user?.email, error);
      if (!mounted) return;
      if (session?.user) {
        setAuth(session.user.id, session.user.user_metadata?.role ?? "student");
      } else {
        clearAuth();
      }
      setIsReady(true);
    });

    // 2) Listener untuk semua perubahan auth state berikutnya
    //    (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[_layout] onAuthStateChange:", event, session?.user?.email);
      if (session?.user) {
        setAuth(session.user.id, session.user.user_metadata?.role ?? "student");
      } else {
        clearAuth();
      }

      // Saat user baru login, pastikan query profile re-fetch — bukan pakai
      // cache disabled dari sesi sebelumnya.
      if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "TOKEN_REFRESHED") {
        queryClient.invalidateQueries({ queryKey: profileKeys.all });
      }

      // Saat logout, buang seluruh cache server-state agar tidak bocor ke
      // akun berikutnya.
      if (event === "SIGNED_OUT") {
        queryClient.clear();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Redirect guard — berjalan setelah bootstrap selesai. Memastikan user
  // selalu berada di route grup yang sesuai dengan status auth-nya, dari
  // mana pun perubahan auth state berasal (login, logout, token expired).
  const userId = useAuthStore((s) => s.userId);
  useEffect(() => {
    if (!isReady) return;
    console.log("[_layout] isAuthenticated:", isAuthenticated, "userId:", userId);
    const inAuthGroup = segments[0] === "(auth)";
    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/beranda");
    }
  }, [isAuthenticated, segments, isReady, userId]);

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
