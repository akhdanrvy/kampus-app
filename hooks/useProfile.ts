import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@lib/supabase";
import { storage } from "@lib/mmkv";
import { profileKeys } from "@constants/queryKeys";
import type { Profile } from "../types/index";

const PROFILE_CACHE_KEY = "user_profile";

// ---------------------------------------------------------------------------
// useProfile
//
// Menggunakan getUser() bukan getSession() karena getUser() selalu
// memverifikasi ke server Supabase — session lokal bisa stale atau kedaluwarsa
// tanpa terdeteksi oleh getSession() yang hanya membaca dari storage lokal.
// ---------------------------------------------------------------------------

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: async (): Promise<Profile> => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("User tidak terautentikasi");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      // Simpan ke MMKV sebagai JSON string untuk offline fallback
      storage.set(PROFILE_CACHE_KEY, JSON.stringify(data));
      return data as Profile;
    },
    placeholderData: (): Profile | undefined => {
      try {
        const cached = storage.get<string>(PROFILE_CACHE_KEY);
        if (!cached) return undefined;
        // storage.get sudah melakukan JSON.parse, tapi kita set dengan JSON.stringify
        // sehingga perlu parse lagi jika hasilnya masih string
        return (typeof cached === "string" ? JSON.parse(cached) : cached) as Profile;
      } catch {
        return undefined;
      }
    },
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 menit
  });
}

// ---------------------------------------------------------------------------
// useUpdateProfile
// ---------------------------------------------------------------------------

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Pick<Profile, "full_name" | "phone" | "avatar_url">>): Promise<Profile> => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("User tidak terautentikasi");

      const { data, error } = await (supabase as any)
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      storage.set(PROFILE_CACHE_KEY, JSON.stringify(data));
      return data as Profile;
    },
    onSuccess: (data) => {
      // Langsung update cache TanStack Query agar UI reaktif tanpa refetch
      queryClient.setQueryData(profileKeys.me(), data);
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });
}
