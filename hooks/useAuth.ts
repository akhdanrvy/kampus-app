import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

import { supabase } from "@lib/supabase";
import { storage } from "@lib/mmkv";
import { useAuthStore } from "@stores/authStore";
import { queryClient } from "@lib/queryClient";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SignUpPayload {
  email: string;
  password: string;
  full_name: string;
  nim: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Persist auth state to Zustand + MMKV after a successful sign-in. */
function handleAuthSuccess(
  userId: string,
  role: string,
  setAuth: (id: string, role: string) => void
) {
  setAuth(userId, role);
}

/** Clear all local state on logout — Zustand, MMKV, and TanStack Query cache. */
function handleAuthClear(clearAuth: () => void) {
  clearAuth();
  storage.clearAll();
  queryClient.clear();
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useAuth — centralises all authentication operations.
 *
 * Pendekatan: Menggunakan TanStack Query mutations (bukan useEffect biasa)
 * agar kita mendapatkan isPending, error, dan isSuccess secara gratis,
 * sehingga UI bisa merespons state loading/error tanpa boilerplate tambahan.
 */
export function useAuth() {
  const router = useRouter();
  const { setAuth, clearAuth } = useAuthStore();

  // -------------------------------------------------------------------------
  // Sign in with email & password
  // -------------------------------------------------------------------------
  const signInWithEmail = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const role =
        (data.user?.user_metadata?.role as string) ?? "student";
      handleAuthSuccess(data.user.id, role, setAuth);
      // Cache user id for MMKV rehydration
      storage.set("user_profile", { id: data.user.id, role });
      router.replace("/(tabs)/beranda");
    },
    onError: (error: Error) => {
      Alert.alert("Login Gagal", error.message);
    },
  });

  // -------------------------------------------------------------------------
  // Register new student account
  // -------------------------------------------------------------------------
  const signUpWithEmail = useMutation({
    mutationFn: async ({ email, password, full_name, nim }: SignUpPayload) => {
      // 1. Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            nim,
            role: "student",
          },
        },
      });
      if (error) throw error;

      // 2. Insert profile row (triggered automatically by DB trigger, but
      //    we upsert here as a safety net in case the trigger is not set up)
      if (data.user) {
        const { error: profileError } = await (supabase.from("profiles") as any).upsert({
          id: data.user.id,
          full_name,
          nim,
          email,
          role: "student",
          student_status: "active",
        });
        // Non-fatal — log but don't throw; DB trigger may have already inserted it
        if (profileError) console.warn("Profile upsert warning:", profileError.message);
      }

      return data;
    },
    onError: (error: Error) => {
      Alert.alert("Registrasi Gagal", error.message);
    },
    // onSuccess is handled by the screen to show the success modal
  });

  // -------------------------------------------------------------------------
  // Google OAuth
  // -------------------------------------------------------------------------
  const signInWithGoogle = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Deep link scheme defined in app.json
          redirectTo: "kampus-app://auth/callback",
        },
      });
      if (error) throw error;
      return data;
    },
    onError: (error: Error) => {
      Alert.alert("Google Login Gagal", error.message);
    },
  });

  // -------------------------------------------------------------------------
  // Sign out
  // -------------------------------------------------------------------------
  const signOut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      handleAuthClear(clearAuth);
      router.replace("/(auth)/login");
    },
    onError: (error: Error) => {
      // Even if Supabase signOut fails, clear local state
      handleAuthClear(clearAuth);
      router.replace("/(auth)/login");
      console.error("SignOut error:", error.message);
    },
  });

  // -------------------------------------------------------------------------
  // Reset password via email link
  // -------------------------------------------------------------------------
  const resetPassword = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "kampus-app://auth/reset-password",
      });
      if (error) throw error;
    },
    onError: (error: Error) => {
      Alert.alert("Gagal Mengirim Email", error.message);
    },
  });

  // -------------------------------------------------------------------------
  // Get current user from active session
  // -------------------------------------------------------------------------
  const getCurrentUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
  };

  return {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    resetPassword,
    getCurrentUser,
  };
}
