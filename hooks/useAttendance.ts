import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceKeys } from "@constants/queryKeys";
import {
  mockAttendanceSessions,
  mockAttendanceHistory,
} from "@lib/mockData";
import type { AttendanceRecord, AttendanceSession } from "../types/index";
import type { AttendanceResult } from "../stores/scanStore";

// TODO: Replace with Supabase queries when backend is connected
// import { supabase } from "@lib/supabase";

// ---------------------------------------------------------------------------
// useSubmitAttendance
//
// Validasi token QR harus dilakukan di server (Supabase), bukan hanya di client,
// karena:
// 1. Client bisa dimanipulasi — jika validasi hanya di app, attacker bisa
//    inject token palsu dan JS payload yang "selalu valid"
// 2. Race condition — jika dua device scan bersamaan, server (PostgreSQL)
//    yang handle atomicity, bukan app
// 3. Token expiry check harus pakai server time (NOW()), bukan device time
//    karena device time bisa dimanipulasi oleh user (maju/mundur jam)
// ---------------------------------------------------------------------------

export function useSubmitAttendance() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (qrToken: string): Promise<AttendanceResult> => {
      // TODO: Replace with full Supabase server-side validation when connected
      // Server-side validation is required because:
      // 1. Client can be manipulated to inject fake tokens
      // 2. Token expiry must use server time (NOW()), not device time
      // 3. Race conditions need atomic DB handling

      await new Promise((r) => setTimeout(r, 800)); // Simulate network

      // Find matching active session from mock data
      const session = mockAttendanceSessions.find(
        (s) => s.qr_token === qrToken && s.is_active
      );

      if (!session) {
        throw new Error("QR tidak valid atau sudah kedaluwarsa. Minta dosen untuk refresh QR.");
      }

      // Check if already recorded in today's mock history
      const alreadyScanned = mockAttendanceHistory.some(
        (h) => h.session.id === session.id
      );
      if (alreadyScanned) {
        throw new Error("Anda sudah tercatat hadir di sesi ini.");
      }

      const now = new Date();
      const sessionStart = new Date(session.created_at);
      const diffMinutes = (now.getTime() - sessionStart.getTime()) / 60_000;
      const status: AttendanceRecord["status"] = diffMinutes > 15 ? "late" : "present";

      const record: AttendanceRecord = {
        id: `record-mock-${Date.now()}`,
        session_id: session.id,
        user_id: "mock-user-id-123",
        scanned_at: now.toISOString(),
        status,
      };

      return { record, session };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attendanceKeys.today() });
    },
  });
}

// ---------------------------------------------------------------------------
// useTodayAttendance
//
// Fetches attendance records for the current day joined with session data.
// The JOIN is done client-side (two queries) to keep Supabase RLS simple
// for MVP — can be replaced with a Postgres view later.
// ---------------------------------------------------------------------------

interface TodayRecord {
  record: AttendanceRecord;
  session: AttendanceSession;
}

export function useTodayAttendance() {
  return useQuery({
    queryKey: attendanceKeys.today(),
    queryFn: async (): Promise<TodayRecord[]> => {
      // TODO: Replace with Supabase query when connected:
      // const { data } = await supabase.from("attendance_records")
      //   .select("*, attendance_sessions(*)").eq("user_id", userId)
      //   .gte("scanned_at", todayStart).order("scanned_at", { ascending: false });
      await new Promise((r) => setTimeout(r, 200));
      return mockAttendanceHistory;
    },
    refetchInterval: 30_000,
  });
}
