import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@hooks/useProfile";
import { scheduleKeys } from "@constants/queryKeys";
import { getDayName } from "@lib/utils";
import { mockSchedules } from "@lib/mockData";
import type { Schedule } from "../types/index";

// TODO: Replace with Supabase query when backend is connected
// import { supabase } from "@lib/supabase";

// ---------------------------------------------------------------------------
// Helper: JS getDay() returns 0=Sun, 1=Mon … 6=Sat
// Our DB uses 1=Senin … 7=Minggu — map accordingly
// ---------------------------------------------------------------------------

function jsDayToDBDay(jsDay: number): number {
  // JS: 0(Sun)=7, 1(Mon)=1, …, 6(Sat)=6
  return jsDay === 0 ? 7 : jsDay;
}

// ---------------------------------------------------------------------------
// useSchedule — full weekly schedule for the student's major + year
// ---------------------------------------------------------------------------

/**
 * Fetches all schedule rows matching the student's major and year_entry.
 * Results are ordered by day_of_week then start_time.
 *
 * Uses profile.major as the enabled guard — no fetch until profile is loaded.
 */
export function useSchedule() {
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: scheduleKeys.byMajor(profile?.major, profile?.year_entry),
    enabled: !!profile?.major,
    queryFn: async (): Promise<Schedule[]> => {
      // TODO: Replace with Supabase query when connected:
      // const { data, error } = await supabase.from("schedules").select("*")
      //   .eq("major", profile.major).order("day_of_week").order("start_time");
      await new Promise((r) => setTimeout(r, 200));
      return mockSchedules;
    },
    staleTime: 1000 * 60 * 30, // 30 min
  });
}

// ---------------------------------------------------------------------------
// useTodaySchedule — only today's schedule entries
// ---------------------------------------------------------------------------

/**
 * Derives today's schedule from the full weekly schedule.
 * Filtering is done client-side to avoid an extra round-trip,
 * since useSchedule is already cached.
 */
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

/**
 * Returns true if the current time is within the schedule's start-end window.
 * Used by ScheduleCard to apply the "currently active" highlight.
 *
 * @param schedule - A schedule item with start_time and end_time ("HH:mm")
 */
export function isScheduleNow(schedule: Schedule): boolean {
  const now = new Date();
  const [startH, startM] = schedule.start_time.split(":").map(Number);
  const [endH, endM] = schedule.end_time.split(":").map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
}
