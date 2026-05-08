import { createMMKV } from "react-native-mmkv";
import type { MMKV } from "react-native-mmkv";

// Single MMKV instance for the app — fast synchronous key-value storage
// Used for caching non-sensitive data like E-Card, preferences, etc.
// react-native-mmkv v4 uses createMMKV() factory instead of new MMKV()
export const mmkvInstance: MMKV = createMMKV({ id: "kampus-app-storage" });

// Typed helper wrapper around MMKV for consistent API
export const storage = {
  /**
   * Persist a value (string, number, boolean, or object serialized as JSON).
   */
  set: (key: string, value: string | number | boolean | object): void => {
    if (typeof value === "object") {
      mmkvInstance.set(key, JSON.stringify(value));
    } else {
      mmkvInstance.set(key, value as string | number | boolean);
    }
  },

  /**
   * Retrieve a stored value. Returns null when the key does not exist.
   * Automatically deserializes JSON objects.
   */
  get: <T = string>(key: string): T | null => {
    const value = mmkvInstance.getString(key);
    if (value === undefined) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  },

  /**
   * Remove a key from storage.
   */
  delete: (key: string): void => {
    mmkvInstance.remove(key);
  },

  /**
   * Check whether a key exists.
   */
  contains: (key: string): boolean => {
    return mmkvInstance.contains(key);
  },

  /**
   * Clear all keys — use only during logout / reset.
   */
  clearAll: (): void => {
    mmkvInstance.clearAll();
  },
};
