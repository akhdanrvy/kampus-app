import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { TodaySchedule } from "@components/akademik/TodaySchedule";
import { ScheduleCard } from "@components/akademik/ScheduleCard";
import { AttendanceSummary } from "@components/akademik/AttendanceSummary";
import { EmptyState } from "@components/ui/EmptyState";
import { SkeletonBox } from "@components/ui/Skeleton";
import { Colors } from "@constants/colors";
import { getDayName, formatDate, formatTime } from "@lib/utils";
import { useSchedule, isScheduleNow } from "@hooks/useSchedule";
import { useProfile } from "@hooks/useProfile";
import { useTodayAttendance } from "@hooks/useAttendance";

// ---------------------------------------------------------------------------
// AkademikScreen
// ---------------------------------------------------------------------------

type ActiveTab = "jadwal" | "absensi";

export default function AkademikScreen() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("jadwal");
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: allSchedules = [], isLoading: scheduleLoading } = useSchedule();
  const { data: todayAttendance = [], isLoading: attendanceLoading } = useTodayAttendance();

  const scheduleByDay = allSchedules.reduce<Record<number, typeof allSchedules>>(
    (acc, s) => {
      acc[s.day_of_week] = [...(acc[s.day_of_week] ?? []), s];
      return acc;
    },
    {}
  );
  const sortedDays = Object.keys(scheduleByDay).map(Number).sort((a, b) => a - b);

  const noMajor = !profileLoading && !profile?.major;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Akademik</Text>
      </View>

      {/* Segmented control */}
      <View style={styles.segmentContainer}>
        {(["jadwal", "absensi"] as ActiveTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.segment, activeTab === tab && styles.segmentActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.segmentLabel,
                activeTab === tab && styles.segmentLabelActive,
              ]}
            >
              {tab === "jadwal" ? "Jadwal" : "Absensi"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {activeTab === "jadwal" ? (
          <>
            {/* Jadwal hari ini */}
            <TodaySchedule />

            {/* EmptyState jika major belum diisi di profil */}
            {noMajor ? (
              <View style={{ paddingHorizontal: 16 }}>
                <EmptyState
                  emoji="🎓"
                  title="Program Studi Belum Diatur"
                  subtitle="Lengkapi profil kamu terlebih dahulu agar jadwal kuliah bisa ditampilkan."
                  actionText="Lengkapi Profil"
                  onAction={() => router.push("/profil/edit")}
                />
              </View>
            ) : (
              /* Jadwal mingguan */
              <View style={styles.weekSection}>
                <Text style={styles.weekTitle}>Jadwal Minggu Ini</Text>

                {scheduleLoading &&
                  [0, 1, 2].map((i) => (
                    <SkeletonBox
                      key={i}
                      height={76}
                      borderRadius={12}
                      style={{ marginBottom: 10 }}
                    />
                  ))}

                {!scheduleLoading && allSchedules.length === 0 && (
                  <EmptyState
                    emoji="📅"
                    title="Jadwal Tidak Ditemukan"
                    subtitle="Belum ada jadwal yang tersedia untuk program studi dan angkatan kamu."
                  />
                )}

                {!scheduleLoading &&
                  sortedDays.map((day) => (
                    <View key={day}>
                      <Text style={styles.dayLabel}>{getDayName(day)}</Text>
                      {scheduleByDay[day].map((s) => (
                        <ScheduleCard
                          key={s.id}
                          schedule={s}
                          isNow={isScheduleNow(s)}
                        />
                      ))}
                    </View>
                  ))}
              </View>
            )}
          </>
        ) : (
          /* Tab Absensi */
          <View style={styles.attendanceSection}>
            {/* Riwayat absensi hari ini */}
            <Text style={styles.sectionTitle}>Kehadiran Hari Ini</Text>

            {attendanceLoading ? (
              [0, 1].map((i) => (
                <SkeletonBox
                  key={i}
                  height={72}
                  borderRadius={12}
                  style={{ marginBottom: 10 }}
                />
              ))
            ) : todayAttendance.length === 0 ? (
              <View
                style={{
                  backgroundColor: Colors.white,
                  borderRadius: 12,
                  padding: 20,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: Colors.border,
                  marginBottom: 24,
                }}
              >
                <Text style={{ color: Colors.textMuted, fontSize: 13 }}>
                  Belum ada absensi hari ini.
                </Text>
              </View>
            ) : (
              todayAttendance.map(({ record, session }) => {
                const isLate = record.status === "late";
                return (
                  <View key={record.id} style={styles.attendanceCard}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: isLate ? Colors.accent : Colors.success },
                      ]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.courseLabel} numberOfLines={1}>
                        {session?.course_name ?? session?.title ?? "—"}
                      </Text>
                      <Text style={styles.timeLabel}>
                        {formatTime(record.scanned_at)} · {formatDate(record.scanned_at)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: isLate ? "#FEF3C7" : "#DCFCE7" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: isLate ? Colors.accent : Colors.success },
                        ]}
                      >
                        {isLate ? "Terlambat" : "Hadir"}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}

            {/* Rekap per mata kuliah (semester) */}
            <AttendanceSummary />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: Colors.textPrimary },
  segmentContainer: {
    flexDirection: "row",
    margin: 16,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentLabel: { fontSize: 13, fontWeight: "500", color: Colors.textMuted },
  segmentLabelActive: { color: Colors.textPrimary, fontWeight: "700" },
  weekSection: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  weekTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textMuted,
    marginBottom: 6,
    marginTop: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  attendanceSection: { paddingHorizontal: 16, paddingTop: 8 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 12,
    marginTop: 4,
  },
  attendanceCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  courseLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  timeLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
});
