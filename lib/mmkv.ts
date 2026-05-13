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
const webStorage = {
  set: (key: string, value: string | number | boolean | object): void => {
    const serialized =
      typeof value === "object" ? JSON.stringify(value) : String(value);
    localStorage.setItem(key, serialized);
  },
  get: <T = string>(key: string): T | null => {
    const value = localStorage.getItem(key);
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  },
  delete: (key: string): void => {
    localStorage.removeItem(key);
  },
  contains: (key: string): boolean => {
    return localStorage.getItem(key) !== null;
  },
  clearAll: (): void => {
    localStorage.clear();
  },
};

// ── Unified storage export ──────────────────────────────────────────────────
export const storage = Platform.OS === "web"
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

