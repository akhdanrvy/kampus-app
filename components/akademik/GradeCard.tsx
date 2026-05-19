import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@constants/colors";
import type { Grade } from "../../types/index";

interface GradeCardProps {
  grade: Grade;
}

function getGradeBadgeStyle(gradeLetter: string) {
  if (gradeLetter === "A" || gradeLetter === "A-") {
    return { backgroundColor: "#DCFCE7", color: "#166534" };
  }

  if (gradeLetter === "B+" || gradeLetter === "B") {
    return { backgroundColor: "#DBEAFE", color: "#1E40AF" };
  }

  if (gradeLetter === "B-" || gradeLetter === "C+") {
    return { backgroundColor: "#FEF3C7", color: "#92400E" };
  }

  return { backgroundColor: "#FEE2E2", color: "#991B1B" };
}

export function GradeCard({ grade }: GradeCardProps) {
  const badgeStyle = getGradeBadgeStyle(grade.grade_letter);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.courseCode}>{grade.course_code ?? "Tanpa Kode"}</Text>
        <View style={[styles.badge, { backgroundColor: badgeStyle.backgroundColor }]}>
          <Text style={[styles.badgeText, { color: badgeStyle.color }]}>
            {grade.grade_letter}
          </Text>
        </View>
      </View>

      <Text style={styles.courseName}>{grade.course_name}</Text>
      <Text style={styles.metaText}>
        {grade.credits} SKS - {grade.grade_point.toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  courseCode: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  courseName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: 10,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 6,
  },
});
