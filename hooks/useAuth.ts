import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Platform } from "react-native";

import { supabase } from "@lib/supabase";
import { storage } from "@lib/mmkv";
import { useAuthStore } from "@stores/authStore";
import { queryClient } from "@lib/queryClient";
import { ENABLE_GOOGLE_OAUTH, ENABLE_PASSWORD_RESET } from "@constants/config";

/** Cross-platform alert — uses Alert.alert on native, window.alert on web */
function showAlert(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

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
      // Jangan cache data partial di sini — useProfile.queryFn menangani cache
      // dengan data lengkap dari tabel profiles setelah query berhasil.
    },
    onError: (error: Error) => {
      showAlert("Login Gagal", error.message);
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
      showAlert("Registrasi Gagal", error.message);
    },
    // onSuccess is handled by the screen to show the success modal
  });

  // -------------------------------------------------------------------------
  // Google OAuth
  // -------------------------------------------------------------------------
  const signInWithGoogle = useMutation({
    mutationFn: async () => {
      if (!ENABLE_GOOGLE_OAUTH) {
        throw new Error("Login Google belum diaktifkan di build ini.");
      }
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Deep link scheme defined in app.json
          redirectTo: "kampus-go://auth/callback",
        },
      });
      if (error) throw error;
      return data;
    },
    onError: (error: Error) => {
      showAlert("Google Login Gagal", error.message);
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
      if (!ENABLE_PASSWORD_RESET) {
        throw new Error("Reset password belum diaktifkan di build ini.");
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "kampus-go://auth/reset-password",
      });
      if (error) throw error;
    },
    onError: (error: Error) => {
      showAlert("Gagal Mengirim Email", error.message);
    },
  });

  // -------------------------------------------------------------------------
  // Get current user from active session
  // -------------------------------------------------------------------------
  const getCurrentUser = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data.session?.user ?? null;
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

// ---------------------------------------------------------------------------
// useSignOut — standalone hook agar bisa dipakai tanpa useAuth() penuh.
//
// Memastikan urutan cleanup: Supabase → Zustand → TanStack Query → MMKV → redirect.
// Bahkan jika Supabase signOut error, state lokal tetap dibersihkan agar
// user tidak terjebak di dalam app.
// ---------------------------------------------------------------------------

export function useSignOut() {
  const qc = useQueryClient();
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      clearAuth();
      qc.clear();
      storage.delete("user_profile");
      router.replace("/(auth)/login");
    },
    onError: () => {
      // Force logout meski Supabase error — jangan biarkan user terjebak
      clearAuth();
      qc.clear();
      storage.delete("user_profile");
      router.replace("/(auth)/login");
    },
  });
}
