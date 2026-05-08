import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@constants/colors";
import { Badge } from "@components/ui/Badge";
import { SkeletonBox, SkeletonText } from "@components/ui/Skeleton";
import { formatDate, truncateText } from "@lib/utils";
import { NEWS_EXCERPT_MAX_LENGTH } from "@constants/config";
import type { NewsItem } from "../../types/index";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface NewsCardProps {
  article: NewsItem;
  onPress: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

export function NewsCardSkeleton() {
  return (
    <View style={styles.container}>
      <View style={{ flex: 1, gap: 8 }}>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <SkeletonBox width={60} height={18} borderRadius={9} />
          <SkeletonBox width={70} height={12} borderRadius={4} />
        </View>
        <SkeletonText lines={2} lineHeight={14} />
      </View>
      <SkeletonBox width={80} height={80} borderRadius={10} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// NewsCard
//
// Horizontal layout: text block on the left, 80×80 thumbnail on the right.
// Menggunakan expo-image agar thumbnail di-cache ke disk — tidak flicker saat
// user kembali dari detail artikel ke list.
// ---------------------------------------------------------------------------

export function NewsCard({ article, onPress }: NewsCardProps) {
  const hasThumbnail = !!article.thumbnail_url;
  const excerpt = article.excerpt
    ? truncateText(article.excerpt, NEWS_EXCERPT_MAX_LENGTH)
    : null;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(article.id)}
      style={styles.container}
    >
      {/* Left: badge + date + title */}
      <View style={styles.textBlock}>
        <View style={styles.metaRow}>
          <Badge category={article.category} size="sm" />
          <Text style={styles.date}>{formatDate(article.published_at)}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>
        {excerpt && (
          <Text style={styles.excerpt} numberOfLines={2}>
            {excerpt}
          </Text>
        )}
      </View>

      {/* Right: thumbnail */}
      <View style={styles.thumbnailWrapper}>
        {hasThumbnail ? (
          <Image
            source={{ uri: article.thumbnail_url }}
            style={styles.thumbnail}
            contentFit="cover"
            cachePolicy="disk"
            transition={150}
          />
        ) : (
          <View style={[styles.thumbnail, styles.fallbackThumb]}>
            <Ionicons name="image-outline" size={24} color={Colors.textMuted} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  textBlock: {
    flex: 1,
    gap: 5,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "nowrap",
  },
  date: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
    lineHeight: 19,
  },
  excerpt: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
  },
  thumbnailWrapper: {
    flexShrink: 0,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: "hidden",
  },
  fallbackThumb: {
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
