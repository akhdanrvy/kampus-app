import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@lib/supabase";
import { storage } from "@lib/mmkv";
import { profileKeys } from "@constants/queryKeys";
import { useAuthStore } from "@stores/authStore";
import type { Profile } from "../types/index";

const PROFILE_CACHE_KEY = "user_profile";

// ---------------------------------------------------------------------------
// useProfile
//
// userId datang dari Zustand (sumber kebenarannya onAuthStateChange di _layout).
// Tidak perlu memanggil supabase.auth.getUser() lagi di sini — itu round-trip
// network tambahan yang sering gagal tepat setelah login (token belum
// ter-persist). RLS Supabase tetap berjalan karena access token sudah ada di
// header Authorization yang dikelola supabase-js otomatis.
// ---------------------------------------------------------------------------

export function useProfile() {
  const userId = useAuthStore((s) => s.userId);

  return useQuery({
    queryKey: [...profileKeys.me(), userId],
    enabled: !!userId,
    queryFn: async (): Promise<Profile> => {
      console.log("[useProfile] queryFn running, userId:", userId);
      if (!userId) throw new Error("userId belum siap");

      // Verifikasi tambahan: pastikan supabase-js juga mengenali user yang sama.
      // Kalau di sini error/null, berarti access-token tidak ter-attach dan
      // RLS akan menolak fetch profile berikutnya — pesan errornya jadi jelas.
      const { data: authData, error: authError } = await supabase.auth.getUser();
      console.log("[useProfile] getUser result:", authData?.user?.id, authError?.message);
      if (authError || !authData?.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      console.log("[useProfile] profile result:", data, error?.message);
      if (error) throw error;

      storage.set(PROFILE_CACHE_KEY, JSON.stringify(data));
      return data as Profile;
    },
    placeholderData: (): Profile | undefined => {
      try {
        const cached = storage.get<string>(PROFILE_CACHE_KEY);
        if (!cached) return undefined;
        const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
        // Pakai cache hanya jika userId-nya cocok dengan user yang sedang login
        // — kalau tidak, kembalikan undefined supaya skeleton tetap muncul
        // alih-alih menampilkan data akun sebelumnya.
        if (parsed?.id && userId && parsed.id !== userId) return undefined;
        if (!parsed?.full_name && !parsed?.nim) return undefined;
        return parsed as Profile;
      } catch {
        return undefined;
      }
    },
    retry: 2,
    staleTime: 1000 * 60 * 5,
  });
}

// ---------------------------------------------------------------------------
// useUpdateProfile
// ---------------------------------------------------------------------------

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.userId);

  return useMutation({
    mutationFn: async (updates: Partial<Pick<Profile, "full_name" | "phone" | "avatar_url">>): Promise<Profile> => {
      if (!userId) throw new Error("User tidak terautentikasi");

      const { data, error } = await (supabase as any)
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;

      storage.set(PROFILE_CACHE_KEY, JSON.stringify(data));
      return data as Profile;
    },
    onSuccess: (data) => {
      // Set semua varian queryKey profile.me (dengan dan tanpa userId suffix)
      queryClient.setQueryData([...profileKeys.me(), userId], data);
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}
