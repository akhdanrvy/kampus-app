import { View, Text, StyleSheet } from "react-native";
import { ScheduleCard } from "@components/akademik/ScheduleCard";
import { SkeletonBox } from "@components/ui/Skeleton";
import { EmptyState } from "@components/ui/EmptyState";
import { Colors } from "@constants/colors";
import { useTodaySchedule, isScheduleNow } from "@hooks/useSchedule";

// ---------------------------------------------------------------------------
// TodaySchedule
//
// Shows the list of scheduled classes for today, highlighting the active one.
// Data is derived from useSchedule (weekly) filtered to today's day_of_week.
// ---------------------------------------------------------------------------

export function TodaySchedule() {
  const { data: todaySchedules, isLoading, dayName } = useTodaySchedule();

  return (
    <View style={styles.container}>
      {/* Section header */}
      <Text style={styles.sectionTitle}>
        Jadwal Hari Ini — {dayName}
      </Text>

      {/* Loading state */}
      {isLoading && (
        <View style={{ gap: 10, marginTop: 8 }}>
          {[0, 1, 2].map((i) => (
            <SkeletonBox key={i} height={76} borderRadius={12} />
          ))}
        </View>
      )}

      {/* Empty state */}
      {!isLoading && todaySchedules.length === 0 && (
        <EmptyState
          icon="calendar-outline"
          title="Tidak ada jadwal hari ini"
          subtitle="Selamat menikmati waktu luang Anda!"
        />
      )}

      {/* Schedule cards */}
      {!isLoading &&
        todaySchedules.map((schedule) => (
          <ScheduleCard
            key={schedule.id}
            schedule={schedule}
            isNow={isScheduleNow(schedule)}
          />
        ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
});
