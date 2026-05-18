import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Database } from "../types/database";

// ---------------------------------------------------------------------------
// SSR detection
//
// Expo Router 6 melakukan prerender/SSR di proses Metro (Node.js). Saat itu
// `window` belum ada, sementara `createClient` dengan persistSession=true
// langsung memanggil storage.getItem() pada saat init.
//
// AsyncStorage's web fallback mengakses window.localStorage → crash dengan
// "window is not defined". Untuk SSR kita pakai no-op storage agar init
// supabase tetap berjalan, dan auth state baru di-restore saat client
// runtime mengeksekusi ulang modul ini di device/browser.
// ---------------------------------------------------------------------------
const isSSR = typeof window === "undefined";

const ssrNoopStorage = {
  getItem: async (_key: string): Promise<string | null> => null,
  setItem: async (_key: string, _value: string): Promise<void> => {},
  removeItem: async (_key: string): Promise<void> => {},
};

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: isSSR ? ssrNoopStorage : AsyncStorage,
      autoRefreshToken: !isSSR,
      persistSession: !isSSR,
      detectSessionInUrl: false,
    },
  }
);
