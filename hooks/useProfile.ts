import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storage } from "@lib/mmkv";
import { profileKeys } from "@constants/queryKeys";
import { mockProfile } from "@lib/mockData";
import type { Profile } from "../types/index";

// TODO: Replace with Supabase query when backend is connected
// import { supabase } from "@lib/supabase";
// import { useAuthStore } from "@stores/authStore";

const PROFILE_CACHE_KEY = "user_profile";

// ---------------------------------------------------------------------------
// useProfile — fetch the currently logged-in student's profile
// ---------------------------------------------------------------------------

/**
 * useProfile fetches the profile row and caches it in MMKV.
 * Currently returns mock data — TODO: Replace with Supabase query.
 */
export function useProfile() {
  return useQuery({
    queryKey: profileKeys.me(),
    // Return MMKV-cached profile instantly while network fetch is in flight
    placeholderData: () => storage.get<Profile>(PROFILE_CACHE_KEY) ?? undefined,
    queryFn: async (): Promise<Profile> => {
      // TODO: Replace with Supabase query when connected:
      // const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
      // if (error) throw new Error(error.message);
      // storage.set(PROFILE_CACHE_KEY, data as Profile);
      // return data as Profile;

      // Simulate a short network delay for realistic UX testing
      await new Promise((r) => setTimeout(r, 300));
      storage.set(PROFILE_CACHE_KEY, mockProfile);
      return mockProfile;
    },
  });
}

// ---------------------------------------------------------------------------
// useUpdateProfile — update profile fields
// ---------------------------------------------------------------------------

/**
 * useUpdateProfile wraps the UPDATE profiles mutation.
 * Currently updates mock data in MMKV only — TODO: Replace with Supabase mutation.
 */
export function useUpdateProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>): Promise<Profile> => {
      // TODO: Replace with Supabase mutation when connected:
      // const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single();
      // if (error) throw new Error(error.message);
      // return data as Profile;

      await new Promise((r) => setTimeout(r, 500));
      const cached = storage.get<Profile>(PROFILE_CACHE_KEY) ?? mockProfile;
      const updated: Profile = { ...cached, ...updates, updated_at: new Date().toISOString() };
      return updated;
    },
    onSuccess: (updated) => {
      // Update MMKV immediately so offline reads are fresh
      storage.set(PROFILE_CACHE_KEY, updated);
      // Invalidate so any subscriber re-fetches
      qc.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });
}
