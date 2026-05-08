import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@constants/colors";
import { Badge } from "@components/ui/Badge";
import { SkeletonBox } from "@components/ui/Skeleton";
import { formatDate } from "@lib/utils";
import type { NewsItem } from "../../types/index";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface HeroNewsProps {
  article: NewsItem;
  onPress: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

export function HeroNewsSkeleton() {
  return <SkeletonBox height={220} borderRadius={0} style={{ width: "100%" }} />;
}

// ---------------------------------------------------------------------------
// HeroNews
//
// Featured article at the top of the news feed — full-width, 220px tall.
// Menggunakan expo-image karena mendukung disk cache bawaan sehingga gambar
// tidak di-download ulang saat user kembali ke list dari detail artikel.
// Overlay dibuat dengan dua View bertumpuk (hitam semi-transparan di atas gambar)
// karena LinearGradient perlu dependency tambahan (sudah ada) tapi approach
// View lebih ringan dan cukup untuk MVP.
// ---------------------------------------------------------------------------

export function HeroNews({ article, onPress }: HeroNewsProps) {
  const hasThumbnail = !!article.thumbnail_url;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onPress(article.id)}
      style={styles.container}
    >
      {/* Background image */}
      {hasThumbnail ? (
        <Image
          source={{ uri: article.thumbnail_url }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          // expo-image caches to disk by default — no re-download on back navigation
          cachePolicy="disk"
          transition={200}
        />
      ) : (
        // Fallback gradient-like background when no thumbnail
        <View style={[StyleSheet.absoluteFill, styles.fallbackBg]}>
          <Ionicons name="newspaper-outline" size={48} color={Colors.white} style={{ opacity: 0.3 }} />
        </View>
      )}

      {/* Dark overlay from bottom */}
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />

      {/* Content pinned to bottom-left */}
      <View style={styles.content}>
        <View style={styles.metaRow}>
          <Badge category={article.category} size="sm" />
          <Text style={styles.date}>{formatDate(article.published_at)}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 220,
    backgroundColor: Colors.cardDark,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  fallbackBg: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    // Simulate bottom-to-top dark gradient with a solid semi-transparent view
    // For full gradient: use expo-linear-gradient (already installed)
    backgroundColor: "rgba(0,0,0,0.52)",
  },
  content: {
    position: "absolute",
    bottom: 14,
    left: 14,
    right: 14,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  date: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.white,
    lineHeight: 22,
  },
});
