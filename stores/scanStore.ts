import { create } from "zustand";
import type { AttendanceRecord, AttendanceSession } from "../types/index";

// Scan store — state specific to the QR scanner screen
// Kept separate from uiStore because it has scanner-specific lifecycle.
// Kamera lifecycle (active/paused) juga dikelola di sini sehingga
// useFocusEffect di scan.tsx cukup memanggil setActive(true/false).

export type ScanStatus = "idle" | "scanning" | "processing" | "success" | "error";

/** The parsed payload embedded in a QR code shown on the projector */
export interface QRPayload {
  session_id: string;
  token: string;
  expires_at: string;
}

/** Combined record returned after a successful attendance submission */
export interface AttendanceResult {
  record: AttendanceRecord;
  session: AttendanceSession;
}

interface ScanState {
  // Camera
  hasPermission: boolean | null;
  isActive: boolean;
  isTorchOn: boolean;

  // Scan flow
  scanStatus: ScanStatus;
  lastResult: AttendanceResult | null;
  errorMessage: string | null;
}

interface ScanActions {
  setPermission: (granted: boolean) => void;
  setActive: (active: boolean) => void;
  toggleTorch: () => void;
  setScanStatus: (status: ScanStatus) => void;
  setResult: (result: AttendanceResult | null) => void;
  setError: (message: string | null) => void;
  reset: () => void;
}

export const useScanStore = create<ScanState & ScanActions>((set) => ({
  hasPermission: null,
  isActive: false,
  isTorchOn: false,

  scanStatus: "idle",
  lastResult: null,
  errorMessage: null,

  setPermission: (granted) => set({ hasPermission: granted }),
  setActive: (active) => set({ isActive: active }),
  toggleTorch: () => set((s) => ({ isTorchOn: !s.isTorchOn })),
  setScanStatus: (scanStatus) => set({ scanStatus }),
  setResult: (lastResult) => set({ lastResult }),
  setError: (errorMessage) => set({ errorMessage }),
  reset: () =>
    set({
      scanStatus: "idle",
      lastResult: null,
      errorMessage: null,
      isTorchOn: false,
    }),
}));
