import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@hooks/useProfile";
import { scheduleKeys } from "@constants/queryKeys";
import { getDayName } from "@lib/utils";
import { supabase } from "@lib/supabase";
import type { Schedule } from "../types/index";

// ---------------------------------------------------------------------------
// Helper: JS getDay() returns 0=Sun, 1=Mon … 6=Sat
// Our DB uses 1=Senin … 7=Minggu — map accordingly
// ---------------------------------------------------------------------------

function jsDayToDBDay(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay;
}

// ---------------------------------------------------------------------------
// useSchedule — full weekly schedule for the student's major + year_entry
// ---------------------------------------------------------------------------

export function useSchedule() {
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: scheduleKeys.byMajor(profile?.major, profile?.year_entry),
    // Tidak fetch sampai profil + major tersedia — mencegah query tanpa filter
    enabled: !!profile?.major,
    queryFn: async (): Promise<Schedule[]> => {
      let query = supabase
        .from("schedules")
        .select("*")
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

      if (profile?.major) {
        query = query.eq("major", profile.major);
      }
      if (profile?.year_entry) {
        query = query.eq("year_entry", profile.year_entry);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Schedule[];
    },
    staleTime: 1000 * 60 * 30, // jadwal kuliah jarang berubah — cache 30 menit
  });
}

// ---------------------------------------------------------------------------
// useTodaySchedule — only today's schedule entries (client-side filter)
// ---------------------------------------------------------------------------

export function useTodaySchedule() {
  const { data: allSchedules = [], isLoading } = useSchedule();

  const todayDBDay = jsDayToDBDay(new Date().getDay());
  const todayName = getDayName(todayDBDay);

  const todaySchedules = allSchedules.filter(
    (s) => s.day_of_week === todayDBDay
  );

  return {
    data: todaySchedules,
    isLoading,
    dayName: todayName,
  };
}

// ---------------------------------------------------------------------------
// isScheduleNow — checks if a schedule is currently active
// ---------------------------------------------------------------------------

export function isScheduleNow(schedule: Schedule): boolean {
  const now = new Date();
  const [startH, startM] = schedule.start_time.split(":").map(Number);
  const [endH, endM] = schedule.end_time.split(":").map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
}
