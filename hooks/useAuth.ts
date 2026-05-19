import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@lib/supabase";
import { storage } from "@lib/mmkv";
import { useAuthStore } from "@stores/authStore";
import { useUIStore } from "@stores/uiStore";
import { queryClient } from "@lib/queryClient";
import { ENABLE_GOOGLE_OAUTH, ENABLE_PASSWORD_RESET } from "@constants/config";

function showErrorToast(title: string, message: string) {
  useUIStore.getState().showToast({
    type: "error",
    message: `${title}: ${message}`,
    duration: 4000,
  });
}

interface SignUpPayload {
  email: string;
  password: string;
  full_name: string;
  nim: string;
}

function handleAuthSuccess(
  userId: string,
  role: string,
  setAuth: (id: string, role: string) => void
) {
  setAuth(userId, role);
}

function handleAuthClear(clearAuth: () => void) {
  clearAuth();
  storage.clearAll();
  queryClient.clear();
}

export function useAuth() {
  const router = useRouter();
  const { setAuth, clearAuth } = useAuthStore();

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
      const role = (data.user?.user_metadata?.role as string) ?? "student";
      handleAuthSuccess(data.user.id, role, setAuth);
    },
    onError: (error: Error) => {
      showErrorToast("Login Gagal", error.message);
    },
  });

  const signUpWithEmail = useMutation({
    mutationFn: async ({ email, password, full_name, nim }: SignUpPayload) => {
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

      if (data.user) {
        const { error: profileError } = await (supabase.from("profiles") as any).upsert({
          id: data.user.id,
          full_name,
          nim,
          email,
          role: "student",
          student_status: "active",
        });

        if (profileError) {
          console.warn("Profile upsert warning:", profileError.message);
        }
      }

      return data;
    },
    onError: (error: Error) => {
      showErrorToast("Registrasi Gagal", error.message);
    },
  });

  const signInWithGoogle = useMutation({
    mutationFn: async () => {
      if (!ENABLE_GOOGLE_OAUTH) {
        throw new Error("Login Google belum diaktifkan di build ini.");
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "kampus-go://auth/callback",
        },
      });
      if (error) throw error;

      return data;
    },
    onError: (error: Error) => {
      showErrorToast("Google Login Gagal", error.message);
    },
  });

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
      handleAuthClear(clearAuth);
      router.replace("/(auth)/login");
      console.error("SignOut error:", error.message);
    },
  });

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
      showErrorToast("Gagal Mengirim Email", error.message);
    },
  });

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
      clearAuth();
      qc.clear();
      storage.delete("user_profile");
      router.replace("/(auth)/login");
    },
  });
}
