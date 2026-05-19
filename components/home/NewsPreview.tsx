import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@constants/colors";
import { Badge } from "@components/ui/Badge";
import { SkeletonBox, SkeletonText } from "@components/ui/Skeleton";
import { formatDate, truncateText } from "@lib/utils";
import type { NewsItem } from "../../types/index";

// ---------------------------------------------------------------------------
// Skeleton loader for a single news card row
// ---------------------------------------------------------------------------

function NewsCardSkeleton() {
  return (
    <View
      style={{
        flexDirection: "row",
        padding: 12,
        backgroundColor: Colors.white,
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.border,
      }}
    >
      <SkeletonBox width={72} height={72} borderRadius={10} />
      <View style={{ flex: 1, marginLeft: 12, justifyContent: "space-between" }}>
        <SkeletonBox width={50} height={18} borderRadius={10} />
        <SkeletonText lines={2} lastLineWidth="70%" lineHeight={11} spacing={6} />
        <SkeletonBox width={70} height={10} borderRadius={6} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Single news card row
// ---------------------------------------------------------------------------

function NewsCard({ item }: { item: NewsItem }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/(tabs)/berita/[id]" as any,
          params: {
            id: item.id,
            from: "/(tabs)/beranda",
          },
        })
      }
      activeOpacity={0.75}
      style={{
        flexDirection: "row",
        padding: 12,
        backgroundColor: Colors.white,
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      {/* Thumbnail */}
      {item.thumbnail_url ? (
        <Image
          source={{ uri: item.thumbnail_url }}
          style={{ width: 72, height: 72, borderRadius: 10 }}
          resizeMode="cover"
        />
      ) : (
        // Fallback colored block when no thumbnail
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 10,
            backgroundColor: "#EFF6FF",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="newspaper-outline" size={28} color={Colors.primaryLight} />
        </View>
      )}

      {/* Text content */}
      <View style={{ flex: 1, marginLeft: 12, justifyContent: "space-between" }}>
        <Badge category={item.category} size="sm" />
        <Text
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: Colors.textPrimary,
            lineHeight: 18,
            marginTop: 5,
          }}
          numberOfLines={2}
        >
          {truncateText(item.title, 70)}
        </Text>
        <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 4 }}>
          {formatDate(item.published_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// NewsPreview — section header + 3 cards
// ---------------------------------------------------------------------------

interface NewsPreviewProps {
  news: NewsItem[];
  isLoading: boolean;
}

/**
 * NewsPreview — shows up to 3 latest articles on the home screen.
 * Displays skeleton cards while data is loading.
 */
export function NewsPreview({ news, isLoading }: NewsPreviewProps) {
  const router = useRouter();

  return (
    <View>
      {/* Section header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.textPrimary }}>
          Artikel Terbaru
        </Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/berita" as any)}>
          <Text style={{ fontSize: 13, color: Colors.primaryLight, fontWeight: "500" }}>
            Lihat Semua
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cards or skeletons */}
      {isLoading ? (
        <>
          <NewsCardSkeleton />
          <NewsCardSkeleton />
          <NewsCardSkeleton />
        </>
      ) : news.length === 0 ? (
        <View
          style={{
            padding: 20,
            alignItems: "center",
            backgroundColor: Colors.white,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          <Text style={{ color: Colors.textMuted, fontSize: 13 }}>
            Belum ada artikel tersedia.
          </Text>
        </View>
      ) : (
        news.slice(0, 3).map((item) => <NewsCard key={item.id} item={item} />)
      )}
    </View>
  );
}
