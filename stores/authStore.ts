import { create } from "zustand";
import { storage } from "@lib/mmkv";

// Auth store holds only lightweight UI state (ids, role).
// Actual user profile data is managed by TanStack Query (useProfile hook).
// This separation keeps the store lean and avoids stale server data in Zustand.

const USER_ID_KEY = "auth:userId";
const USER_ROLE_KEY = "auth:userRole";

type UserRole = "student" | "admin" | "lecturer";

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  userRole: UserRole | null;
}

interface AuthActions {
  setAuth: (userId: string, role: string) => void;
  clearAuth: () => void;
  /** Rehydrate from MMKV on app start */
  rehydrate: () => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  // Initial state — will be rehydrated from MMKV in root layout
  isAuthenticated: false,
  userId: null,
  userRole: null,

  setAuth: (userId, role) => {
    // Persist to MMKV so state survives app restarts
    storage.set(USER_ID_KEY, userId);
    storage.set(USER_ROLE_KEY, role);
    set({
      isAuthenticated: true,
      userId,
      userRole: role as UserRole,
    });
  },

  clearAuth: () => {
    storage.delete(USER_ID_KEY);
    storage.delete(USER_ROLE_KEY);
    set({ isAuthenticated: false, userId: null, userRole: null });
  },

  rehydrate: () => {
    const userId = storage.get<string>(USER_ID_KEY);
    const userRole = storage.get<string>(USER_ROLE_KEY);
    if (userId && userRole) {
      set({
        isAuthenticated: true,
        userId,
        userRole: userRole as UserRole,
      });
    }
  },
}));
