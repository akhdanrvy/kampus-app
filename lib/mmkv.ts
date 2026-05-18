import { Platform } from "react-native";

// ---------------------------------------------------------------------------
// Platform-aware storage
// react-native-mmkv does NOT support web — falls back to localStorage on web.
// The API surface is kept identical so call sites don't need to change.
// ---------------------------------------------------------------------------

// ── Native (iOS / Android) ──────────────────────────────────────────────────
let mmkvInstance: import("react-native-mmkv").MMKV | null = null;

if (Platform.OS !== "web") {
  // Dynamic require so the web bundle never attempts to load the native module
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createMMKV } = require("react-native-mmkv");
  mmkvInstance = createMMKV({ id: "kampus-app-storage" });
}

export { mmkvInstance };

// ── Web (localStorage) ──────────────────────────────────────────────────────
// Guard setiap akses localStorage dengan typeof — module bisa di-evaluate
// di lingkungan non-browser (SSR, Metro HMR server) sebelum runtime device.
const webStorage = {
  set: (key: string, value: string | number | boolean | object): void => {
    if (typeof localStorage === "undefined") return;
    const serialized =
      typeof value === "object" ? JSON.stringify(value) : String(value);
    localStorage.setItem(key, serialized);
  },
  get: <T = string>(key: string): T | null => {
    if (typeof localStorage === "undefined") return null;
    const value = localStorage.getItem(key);
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  },
  delete: (key: string): void => {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(key);
  },
  contains: (key: string): boolean => {
    if (typeof localStorage === "undefined") return false;
    return localStorage.getItem(key) !== null;
  },
  clearAll: (): void => {
    if (typeof localStorage === "undefined") return;
    localStorage.clear();
  },
};

// ── Unified storage export ──────────────────────────────────────────────────
const storageImpl = Platform.OS === "web"
  ? webStorage
  : {
      set: (key: string, value: string | number | boolean | object): void => {
        if (typeof value === "object") {
          mmkvInstance!.set(key, JSON.stringify(value));
        } else {
          mmkvInstance!.set(key, value as string | number | boolean);
        }
      },
      get: <T = string>(key: string): T | null => {
        const value = mmkvInstance!.getString(key);
        if (value === undefined) return null;
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as unknown as T;
        }
      },
      delete: (key: string): void => {
        mmkvInstance!.remove(key);
      },
      contains: (key: string): boolean => {
        return mmkvInstance!.contains(key);
      },
      clearAll: (): void => {
        mmkvInstance!.clearAll();
      },
    };

export const storage = storageImpl;

// ── Debug helper ───────────────────────────────────────────────────────────
// TEMPORARY: dipakai untuk membersihkan cache profil/news yang tersisa dari
// sesi mock sebelumnya. Hapus pemanggilannya setelah masalah profil-tidak-
// muncul resolved (cari "clearAllCache" di codebase).
export const clearAllCache = () => {
  try {
    storageImpl.delete("user_profile");
    storageImpl.delete("last_news_read");
    console.log("[MMKV] All cache cleared");
  } catch (e) {
    console.warn("[MMKV] clearAllCache failed:", e);
  }
};
