import { View, StyleSheet } from "react-native";
import { SkeletonBox, SkeletonText } from "@components/ui/Skeleton";

// ---------------------------------------------------------------------------
// Skeleton cards matching the exact proportions of HeroNews + NewsCard
// ---------------------------------------------------------------------------

function HeroNewsSkeleton() {
  return <SkeletonBox height={220} borderRadius={0} style={{ width: "100%" }} />;
}

function NewsCardSkeleton() {
  return (
    <View style={styles.card}>
      {/* Left text block */}
      <View style={{ flex: 1, gap: 8 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <SkeletonBox width={60} height={18} borderRadius={9} />
          <SkeletonBox width={70} height={12} borderRadius={4} />
        </View>
        <SkeletonText lines={2} lineHeight={14} />
      </View>
      {/* Right thumbnail */}
      <SkeletonBox width={80} height={80} borderRadius={10} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// NewsListSkeleton — composite placeholder for the full news feed
// ---------------------------------------------------------------------------

/**
 * Renders 1 hero skeleton + 4 card skeletons.
 * Ditampilkan selama data pertama kali di-fetch (isLoading === true).
 */
export function NewsListSkeleton() {
  return (
    <View>
      {/* Hero placeholder */}
      <HeroNewsSkeleton />

      {/* Filter bar placeholder */}
      <View style={styles.filterBar}>
        {[80, 70, 65, 75, 60].map((w, i) => (
          <SkeletonBox key={i} width={w} height={32} borderRadius={999} />
        ))}
      </View>

      {/* Card placeholders */}
      {[0, 1, 2, 3].map((i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  filterBar: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
});
