import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TodaySchedule } from "@components/akademik/TodaySchedule";
import { ScheduleCard } from "@components/akademik/ScheduleCard";
import { AttendanceSummary } from "@components/akademik/AttendanceSummary";
import { SkeletonBox } from "@components/ui/Skeleton";
import { Colors } from "@constants/colors";
import { getDayName } from "@lib/utils";
import { useSchedule, isScheduleNow } from "@hooks/useSchedule";

// ---------------------------------------------------------------------------
// AkademikScreen
//
// Two-tab segmented control: Jadwal and Absensi.
// Tab state is local (useState) — no need for global/server state here.
// ---------------------------------------------------------------------------

type ActiveTab = "jadwal" | "absensi";

export default function AkademikScreen() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("jadwal");
  const { data: allSchedules = [], isLoading } = useSchedule();

  // Group weekly schedules by day for the "Minggu Ini" section
  const scheduleByDay = allSchedules.reduce<Record<number, typeof allSchedules>>(
    (acc, s) => {
      acc[s.day_of_week] = [...(acc[s.day_of_week] ?? []), s];
      return acc;
    },
    {}
  );
  const sortedDays = Object.keys(scheduleByDay)
    .map(Number)
    .sort((a, b) => a - b);

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
            {/* Today's schedule */}
            <TodaySchedule />

            {/* Full weekly schedule */}
            <View style={styles.weekSection}>
              <Text style={styles.weekTitle}>Jadwal Minggu Ini</Text>

              {isLoading &&
                [0, 1, 2].map((i) => (
                  <SkeletonBox key={i} height={76} borderRadius={12} style={{ marginBottom: 10 }} />
                ))}

              {!isLoading &&
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
          </>
        ) : (
          <AttendanceSummary />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  // --- Segmented control ---
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
  segmentLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.textMuted,
  },
  segmentLabelActive: {
    color: Colors.textPrimary,
    fontWeight: "700",
  },
  // --- Week section ---
  weekSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
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
});
