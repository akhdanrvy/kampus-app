import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@constants/colors";
import { SkeletonBox, SkeletonText } from "@components/ui/Skeleton";
import { formatTime } from "@lib/utils";
import { useTodayAttendance } from "@hooks/useAttendance";

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function HistorySkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonBox width={160} height={16} borderRadius={6} />
      <View style={{ marginTop: 12, gap: 10 }}>
        {[0, 1].map((i) => (
          <View key={i} style={styles.item}>
            <SkeletonBox width={36} height={36} borderRadius={18} />
            <View style={{ flex: 1, gap: 6 }}>
              <SkeletonText lines={1} lineHeight={14} />
              <SkeletonBox width={80} height={11} borderRadius={4} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// AttendanceHistory
//
// Displays today's scan records fetched from useTodayAttendance hook.
// Mounted below the QR scanner on the Scan tab.
// ---------------------------------------------------------------------------

export function AttendanceHistory() {
  const { data: records = [], isLoading } = useTodayAttendance();

  if (isLoading) return <HistorySkeleton />;

  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Kehadiran Hari Ini</Text>
        {records.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{records.length}</Text>
          </View>
        )}
      </View>

      {/* Empty state */}
      {records.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={32} color={Colors.textMuted} />
          <Text style={styles.emptyText}>Belum ada kehadiran hari ini</Text>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          {records.map(({ record, session }) => (
            <View key={record.id} style={styles.item}>
              {/* Status icon */}
              <View
                style={[
                  styles.iconCircle,
                  record.status === "late" && styles.iconCircleLate,
                ]}
              >
                <Ionicons
                  name={record.status === "present" ? "checkmark" : "time-outline"}
                  size={18}
                  color={Colors.white}
                />
              </View>

              {/* Course + time */}
              <View style={{ flex: 1 }}>
                <Text style={styles.courseName} numberOfLines={1}>
                  {session?.course_name ?? session?.title ?? "Sesi Kehadiran"}
                </Text>
                <Text style={styles.timeText}>
                  {formatTime(record.scanned_at)} WIB ·{" "}
                  <Text
                    style={{
                      color:
                        record.status === "present"
                          ? Colors.success
                          : Colors.accent,
                    }}
                  >
                    {record.status === "present" ? "Hadir" : "Terlambat"}
                  </Text>
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  countBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.white,
  },
  emptyState: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconCircleLate: {
    backgroundColor: Colors.accent,
  },
  courseName: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
