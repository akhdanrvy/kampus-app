import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

import { TodaySchedule } from "@components/akademik/TodaySchedule";
import { ScheduleCard } from "@components/akademik/ScheduleCard";
import { AttendanceSummary } from "@components/akademik/AttendanceSummary";
import { GradeCard } from "@components/akademik/GradeCard";
import { IPKSummary } from "@components/akademik/IPKSummary";
import { EmptyState } from "@components/ui/EmptyState";
import { FadeIn, SkeletonBox } from "@components/ui/Skeleton";
import { Colors } from "@constants/colors";
import { getDayName, formatDate, formatTime } from "@lib/utils";
import { useSchedule, isScheduleNow } from "@hooks/useSchedule";
import { useProfile } from "@hooks/useProfile";
import { useTodayAttendance } from "@hooks/useAttendance";
import { useGrades, calculateIPK } from "@hooks/useGrades";
import type { Grade } from "../../../types/index";

type ActiveTab = "jadwal" | "absensi" | "nilai";

const TAB_LABELS: Record<ActiveTab, string> = {
  jadwal: "Jadwal",
  absensi: "Absensi",
  nilai: "Nilai",
};

function sortSemesters(semesters: string[]) {
  return [...semesters].sort((a, b) =>
    b.localeCompare(a, undefined, { numeric: true, sensitivity: "base" })
  );
}

function totalCredits(grades: Grade[]) {
  return grades.reduce((sum, grade) => sum + grade.credits, 0);
}

function GradeListSkeleton() {
  return (
    <>
      <SkeletonBox height={156} borderRadius={16} style={{ marginBottom: 16 }} />
      <SkeletonBox height={52} borderRadius={12} style={{ marginBottom: 16 }} />
      {[0, 1, 2].map((i) => (
        <SkeletonBox
          key={i}
          height={92}
          borderRadius={12}
          style={{ marginBottom: 10 }}
        />
      ))}
    </>
  );
}

function isValidTab(value: unknown): value is ActiveTab {
  return value === "jadwal" || value === "absensi" || value === "nilai";
}

export default function AkademikScreen() {
  const params = useLocalSearchParams<{ tab?: string | string[] }>();
  const requestedTab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    isValidTab(requestedTab) ? requestedTab : "jadwal"
  );
  const [selectedSemester, setSelectedSemester] = useState<string | undefined>();
  const [semesterInitialized, setSemesterInitialized] = useState(false);
  const [semesterModalVisible, setSemesterModalVisible] = useState(false);

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: allSchedules = [], isLoading: scheduleLoading } = useSchedule();
  const { data: todayAttendance = [], isLoading: attendanceLoading } = useTodayAttendance();
  const { data: allGrades = [], isLoading: allGradesLoading } = useGrades();
  const { data: filteredGrades = [], isLoading: filteredGradesLoading } =
    useGrades(selectedSemester);

  const semesterOptions = sortSemesters(
    Array.from(new Set(allGrades.map((grade) => grade.semester).filter(Boolean)))
  );

  useEffect(() => {
    if (isValidTab(requestedTab) && requestedTab !== activeTab) {
      setActiveTab(requestedTab);
    }
  }, [activeTab, requestedTab]);

  useEffect(() => {
    if (!semesterInitialized && semesterOptions.length > 0) {
      setSelectedSemester(semesterOptions[0]);
      setSemesterInitialized(true);
    }

    if (!semesterInitialized && !allGradesLoading && semesterOptions.length === 0) {
      setSemesterInitialized(true);
    }
  }, [allGradesLoading, semesterInitialized, semesterOptions]);

  const grades = selectedSemester ? filteredGrades : allGrades;
  const gradesLoading =
    allGradesLoading || (!!selectedSemester && filteredGradesLoading);

  const scheduleByDay = allSchedules.reduce<Record<number, typeof allSchedules>>(
    (acc, schedule) => {
      acc[schedule.day_of_week] = [...(acc[schedule.day_of_week] ?? []), schedule];
      return acc;
    },
    {}
  );
  const sortedDays = Object.keys(scheduleByDay)
    .map(Number)
    .sort((a, b) => a - b);

  const noMajor = !profileLoading && !profile?.major;
  const gradeSemesterLabel = selectedSemester ?? "Semua Semester";
  const gradeTotalCredits = totalCredits(grades);
  const gradeIpk = calculateIPK(grades);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Akademik</Text>
      </View>

      <View style={styles.segmentContainer}>
        {(["jadwal", "absensi", "nilai"] as ActiveTab[]).map((tab) => (
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
              {TAB_LABELS[tab]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <FadeIn duration={220}>
        {activeTab === "jadwal" ? (
          <>
            <TodaySchedule />

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
                      {scheduleByDay[day].map((schedule) => (
                        <ScheduleCard
                          key={schedule.id}
                          schedule={schedule}
                          isNow={isScheduleNow(schedule)}
                        />
                      ))}
                    </View>
                  ))}
              </View>
            )}
          </>
        ) : activeTab === "absensi" ? (
          <View style={styles.attendanceSection}>
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
              <View style={styles.emptyInlineCard}>
                <Text style={styles.emptyInlineText}>Belum ada absensi hari ini.</Text>
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
                        {session?.course_name ?? session?.title ?? "-"}
                      </Text>
                      <Text style={styles.timeLabel}>
                        {formatTime(record.scanned_at)} - {formatDate(record.scanned_at)}
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

            <AttendanceSummary />
          </View>
        ) : (
          <View style={styles.gradesSection}>
            {gradesLoading ? (
              <GradeListSkeleton />
            ) : allGrades.length === 0 ? (
              <EmptyState
                emoji="📝"
                title="Belum Ada Nilai"
                subtitle="Nilai mata kuliah kamu akan muncul di sini setelah diinput oleh kampus."
              />
            ) : (
              <>
                <IPKSummary
                  ipk={gradeIpk}
                  semesterLabel={gradeSemesterLabel}
                  totalCredits={gradeTotalCredits}
                  totalCourses={grades.length}
                />

                <View style={styles.filterCard}>
                  <Text style={styles.filterLabel}>Filter Semester</Text>
                  <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setSemesterModalVisible(true)}
                  >
                    <Text style={styles.filterButtonText}>{gradeSemesterLabel}</Text>
                    <Text style={styles.filterButtonChevron}>v</Text>
                  </TouchableOpacity>
                </View>

                {grades.length === 0 ? (
                  <EmptyState
                    emoji="📚"
                    title="Nilai Tidak Ditemukan"
                    subtitle="Belum ada nilai untuk semester yang kamu pilih."
                  />
                ) : (
                  grades.map((grade) => <GradeCard key={grade.id} grade={grade} />)
                )}
              </>
            )}
          </View>
        )}
        </FadeIn>
      </ScrollView>

      <Modal
        visible={semesterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSemesterModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSemesterModalVisible(false)}
        >
          <Pressable style={styles.modalCard}>
            <Text style={styles.modalTitle}>Pilih Semester</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setSelectedSemester(undefined);
                setSemesterInitialized(true);
                setSemesterModalVisible(false);
              }}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  !selectedSemester && styles.modalOptionTextActive,
                ]}
              >
                Semua Semester
              </Text>
            </TouchableOpacity>

            {semesterOptions.map((semester) => (
              <TouchableOpacity
                key={semester}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedSemester(semester);
                  setSemesterModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedSemester === semester && styles.modalOptionTextActive,
                  ]}
                >
                  {semester}
                </Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

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
  gradesSection: { paddingHorizontal: 16, paddingTop: 8 },
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
  emptyInlineCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  emptyInlineText: {
    color: Colors.textMuted,
    fontSize: 13,
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
  filterCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textMuted,
    marginBottom: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: "#F8FAFC",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  filterButtonChevron: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  modalOption: {
    paddingVertical: 12,
  },
  modalOptionText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  modalOptionTextActive: {
    color: Colors.primary,
    fontWeight: "700",
  },
});
