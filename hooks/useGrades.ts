import { useQuery } from "@tanstack/react-query";
import { gradeKeys } from "@constants/queryKeys";
import { supabase } from "@lib/supabase";
import type { Grade } from "../types/index";

export function useGrades(semester?: string) {
  return useQuery({
    queryKey: gradeKeys.list(semester),
    queryFn: async (): Promise<Grade[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("grades")
        .select("*")
        .eq("student_id", user.id)
        .order("course_name", { ascending: true });

      if (semester) {
        query = query.eq("semester", semester);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data ?? []) as Grade[];
    },
  });
}

export function calculateIPK(grades: Grade[]): number {
  if (!grades.length) return 0;

  const totalBobot = grades.reduce(
    (sum, grade) => sum + grade.grade_point * grade.credits,
    0
  );
  const totalSks = grades.reduce((sum, grade) => sum + grade.credits, 0);

  return totalSks > 0 ? Math.round((totalBobot / totalSks) * 100) / 100 : 0;
}
