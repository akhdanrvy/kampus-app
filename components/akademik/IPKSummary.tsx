import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@constants/colors";

interface IPKSummaryProps {
  ipk: number;
  semesterLabel: string;
  totalCredits: number;
  totalCourses: number;
}

export function IPKSummary({
  ipk,
  semesterLabel,
  totalCredits,
  totalCourses,
}: IPKSummaryProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>IPK Semester Ini</Text>

      <View style={styles.centerBlock}>
        <Text style={styles.ipkValue}>{ipk.toFixed(2)}</Text>
        <Text style={styles.semesterText}>{semesterLabel}</Text>
      </View>

      <Text style={styles.metaText}>
        Total SKS: {totalCredits} - Mata Kuliah: {totalCourses}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  centerBlock: {
    alignItems: "center",
    paddingVertical: 18,
  },
  ipkValue: {
    fontSize: 34,
    fontWeight: "800",
    color: Colors.primary,
  },
  semesterText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 6,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "center",
  },
});
