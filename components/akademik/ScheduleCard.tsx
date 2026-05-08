import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@constants/colors";
import { getDayName } from "@lib/utils";
import type { Schedule } from "../../types/index";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ScheduleCardProps {
  schedule: Schedule;
  /** Highlight with accent border when the class is currently in session */
  isNow?: boolean;
}

// ---------------------------------------------------------------------------
// ScheduleCard
//
// Displays one lecture slot with a colored left border.
// isNow=true highlights the card so students instantly see the active class.
// ---------------------------------------------------------------------------

export function ScheduleCard({ schedule, isNow = false }: ScheduleCardProps) {
  return (
    <View style={[styles.card, isNow && styles.cardActive]}>
      {/* Left accent border */}
      <View style={[styles.accentBar, isNow && styles.accentBarActive]} />

      <View style={styles.content}>
        {/* Top row: time + course name */}
        <View style={styles.topRow}>
          <Text style={[styles.time, isNow && styles.timeActive]}>
            {schedule.start_time} – {schedule.end_time}
          </Text>
          {isNow && (
            <View style={styles.nowBadge}>
              <Text style={styles.nowBadgeText}>Sekarang</Text>
            </View>
          )}
        </View>

        <Text style={styles.courseName} numberOfLines={1}>
          {schedule.course_name}
          {schedule.course_code ? ` (${schedule.course_code})` : ""}
        </Text>

        {/* Bottom meta row */}
        <View style={styles.metaRow}>
          <Text style={styles.dayLabel}>{getDayName(schedule.day_of_week)}</Text>
          {(schedule.room || schedule.lecturer_name) && (
            <Text style={styles.meta}>
              {[schedule.room, schedule.lecturer_name].filter(Boolean).join(" · ")}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardActive: {
    borderColor: Colors.accent,
    backgroundColor: "#FFFBEB",
  },
  accentBar: {
    width: 4,
    backgroundColor: Colors.primary,
  },
  accentBarActive: {
    backgroundColor: Colors.accent,
  },
  content: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  time: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
  },
  timeActive: {
    color: Colors.accent,
  },
  nowBadge: {
    backgroundColor: Colors.accent,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  nowBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.white,
  },
  courseName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  dayLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  meta: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
