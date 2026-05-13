import { useQuery } from "@tanstack/react-query";
import { eventKeys } from "@constants/queryKeys";
import { supabase } from "@lib/supabase";
import type { EventItem } from "../types/index";

// ---------------------------------------------------------------------------
// useEvents — upcoming published events
// ---------------------------------------------------------------------------

export function useEvents() {
  return useQuery({
    queryKey: eventKeys.lists(),
    queryFn: async (): Promise<EventItem[]> => {
      const { data, error } = await (supabase as any)
        .from("events")
        .select("*")
        .eq("is_published", true)
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true });

      if (error) throw error;
      return (data ?? []) as EventItem[];
    },
    staleTime: 1000 * 60 * 5, // events bisa berubah cepat — cache 5 menit
  });
}
