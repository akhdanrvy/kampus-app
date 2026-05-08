import { ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Colors } from "@constants/colors";

// ---------------------------------------------------------------------------
// Filter categories — "Semua" maps to null (no filter applied)
// ---------------------------------------------------------------------------

const FILTERS: { label: string; value: string | null }[] = [
  { label: "Semua", value: null },
  { label: "Akademik", value: "akademik" },
  { label: "Kampus", value: "kampus" },
  { label: "Nasional", value: "nasional" },
  { label: "Umum", value: "umum" },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface NewsFilterProps {
  activeCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

// ---------------------------------------------------------------------------
// NewsFilter
//
// Horizontal scrollable pill tabs for category filtering.
// State dikelola di parent (berita/index.tsx) agar query invalidation bisa
// terpusat — filter change → invalidate → useNewsInfinite re-fetch dari page 0.
// ---------------------------------------------------------------------------

export function NewsFilter({ activeCategory, onSelectCategory }: NewsFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {FILTERS.map((item) => {
        const isActive = activeCategory === item.value;
        return (
          <TouchableOpacity
            key={item.label}
            onPress={() => onSelectCategory(item.value)}
            activeOpacity={0.75}
            style={[styles.pill, isActive && styles.pillActive]}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
  },
  pillActive: {
    backgroundColor: Colors.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.textMuted,
  },
  labelActive: {
    color: Colors.white,
  },
});
