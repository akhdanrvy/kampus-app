import { create } from "zustand";

// UI store — ephemeral UI state only (modals, toasts, loading overlays)
// Reset on unmount where appropriate; never persisted to storage.

export interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  /** Auto-dismiss duration in ms. Default 3000. */
  duration?: number;
}

interface UIState {
  /** Global full-screen loading overlay */
  isLoading: boolean;
  /** Active toasts — rendered by ToastContainer in root layout */
  toasts: Toast[];
}

interface UIActions {
  setLoading: (value: boolean) => void;
  showToast: (toast: Omit<Toast, "id">) => void;
  hideToast: (id: string) => void;
}

export const useUIStore = create<UIState & UIActions>((set) => ({
  isLoading: false,
  toasts: [],

  setLoading: (value) => set({ isLoading: value }),

  showToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id: Math.random().toString(36).slice(2) },
      ],
    })),

  hideToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
