import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@constants/colors";

// ---------------------------------------------------------------------------
// Mock data — MVP placeholder
//
// Untuk MVP, data absensi di-hardcode karena membutuhkan query kompleks
// (JOIN attendance_records + schedules per semester + aggregation).
// Akan diganti dengan hook useAttendanceSummary di fase berikutnya.
// ---------------------------------------------------------------------------

interface SubjectAttendance {
  course: string;
  attended: number;
  total: number;
}

const MOCK_ATTENDANCE: SubjectAttendance[] = [
  { course: "Algoritma Pemrograman", attended: 12, total: 14 },
  { course: "Basis Data", attended: 10, total: 14 },
  { course: "Jaringan Komputer", attended: 7, total: 14 },
  { course: "Rekayasa Perangkat Lunak", attended: 13, total: 14 },
  { course: "Kalkulus", attended: 6, total: 14 },
];

// ---------------------------------------------------------------------------
// ProgressBar — colored bar based on attendance percentage
// ---------------------------------------------------------------------------

function ProgressBar({ percentage }: { percentage: number }) {
  const color =
    percentage >= 75
      ? Colors.success
      : percentage >= 50
      ? Colors.accent
      : Colors.danger;

  return (
    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          { width: `${Math.min(percentage, 100)}%` as any, backgroundColor: color },
        ]}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// AttendanceSummary
// ---------------------------------------------------------------------------

export function AttendanceSummary() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Rekap Kehadiran</Text>
      <Text style={styles.subtitle}>Semester ini (data mock)</Text>

      <View style={{ marginTop: 12 }}>
        {MOCK_ATTENDANCE.map((item) => {
          const pct = Math.round((item.attended / item.total) * 100);
          const color =
            pct >= 75 ? Colors.success : pct >= 50 ? Colors.accent : Colors.danger;

          return (
            <View key={item.course} style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.courseName} numberOfLines={1}>
                  {item.course}
                </Text>
                <Text style={[styles.countText, { color }]}>
                  {item.attended}/{item.total}
                </Text>
              </View>
              <ProgressBar percentage={pct} />
              <Text style={[styles.pctText, { color }]}>{pct}% hadir</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  item: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  courseName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginRight: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: "700",
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  pctText: {
    fontSize: 11,
    fontWeight: "500",
  },
});
