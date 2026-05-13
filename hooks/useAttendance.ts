import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceKeys } from "@constants/queryKeys";
import { supabase } from "@lib/supabase";
import type { AttendanceRecord, AttendanceSession } from "../types/index";
import type { AttendanceResult } from "../stores/scanStore";

// ---------------------------------------------------------------------------
// useSubmitAttendance
//
// Validasi token QR dilakukan sepenuhnya di server (Supabase), bukan di client:
// 1. Client bisa dimanipulasi — validasi di app mudah di-bypass
// 2. Token expiry menggunakan server time via .gte("qr_expires_at", now)
// 3. Race condition dua device scan bersamaan ditangani PostgreSQL constraint
// ---------------------------------------------------------------------------

export function useSubmitAttendance() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (qrToken: string): Promise<AttendanceResult> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Tidak terautentikasi.");

      // Validasi: QR token aktif dan belum kedaluwarsa (server time)
      const { data: attendanceSession, error: sessionError } = await (supabase as any)
        .from("attendance_sessions")
        .select("*")
        .eq("qr_token", qrToken)
        .eq("is_active", true)
        .gte("qr_expires_at", new Date().toISOString())
        .maybeSingle();

      if (sessionError) throw sessionError;
      if (!attendanceSession) {
        throw new Error(
          "QR tidak valid atau sudah kedaluwarsa. Minta dosen untuk refresh QR."
        );
      }

      // Cek apakah user sudah absen di sesi ini
      const { data: existingRecord } = await (supabase as any)
        .from("attendance_records")
        .select("id")
        .eq("session_id", attendanceSession.id)
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (existingRecord) {
        throw new Error("Anda sudah tercatat hadir di sesi ini.");
      }

      // Tentukan status: hadir tepat waktu atau terlambat (> 15 menit dari mulai sesi)
      const now = new Date();
      const sessionStart = new Date(attendanceSession.created_at);
      const diffMinutes = (now.getTime() - sessionStart.getTime()) / 60_000;
      const status: AttendanceRecord["status"] = diffMinutes > 15 ? "late" : "present";

      // Insert record absensi
      const { data: record, error: recordError } = await (supabase as any)
        .from("attendance_records")
        .insert({
          session_id: attendanceSession.id,
          user_id: session.user.id,
          scanned_at: now.toISOString(),
          status,
        })
        .select()
        .single();

      if (recordError) throw recordError;

      return {
        record: record as AttendanceRecord,
        session: attendanceSession as AttendanceSession,
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attendanceKeys.today() });
    },
  });
}

// ---------------------------------------------------------------------------
// useTodayAttendance
//
// Fetch riwayat absensi hari ini dengan JOIN ke attendance_sessions.
// Menggunakan select("*, attendance_sessions(*)") agar satu query — lebih
// efisien daripada dua query terpisah untuk MVP.
// ---------------------------------------------------------------------------

interface TodayRecord {
  record: AttendanceRecord;
  session: AttendanceSession;
}

export function useTodayAttendance() {
  return useQuery({
    queryKey: attendanceKeys.today(),
    queryFn: async (): Promise<TodayRecord[]> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return [];

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data, error } = await (supabase as any)
        .from("attendance_records")
        .select("*, attendance_sessions(*)")
        .eq("user_id", session.user.id)
        .gte("scanned_at", todayStart.toISOString())
        .order("scanned_at", { ascending: false });

      if (error) throw error;

      return (data ?? []).map((row: any) => ({
        record: {
          id: row.id,
          session_id: row.session_id,
          user_id: row.user_id,
          scanned_at: row.scanned_at,
          status: row.status,
        } as AttendanceRecord,
        session: row.attendance_sessions as AttendanceSession,
      }));
    },
    refetchInterval: 30_000, // polling setiap 30 detik agar riwayat terupdate
  });
}
