import { Share, View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { useNewsDetail } from "@hooks/useNews";
import { Badge } from "@components/ui/Badge";
import { SkeletonBox, SkeletonText } from "@components/ui/Skeleton";
import { Colors } from "@constants/colors";
import { APP_NAME } from "@constants/config";
import { formatDate } from "@lib/utils";

// ---------------------------------------------------------------------------
// Skeleton for detail screen while loading
// ---------------------------------------------------------------------------

function DetailSkeleton() {
  return (
    <ScrollView>
      <SkeletonBox height={240} borderRadius={0} style={{ width: "100%" }} />
      <View style={styles.body}>
        <SkeletonBox width={80} height={20} borderRadius={10} />
        <SkeletonBox width={120} height={12} borderRadius={4} style={{ marginTop: 8 }} />
        <SkeletonBox height={28} borderRadius={6} style={{ marginTop: 12 }} />
        <SkeletonBox height={28} borderRadius={6} style={{ marginTop: 6, width: "80%" }} />
        <View style={{ marginTop: 20, gap: 8 }}>
          <SkeletonText lines={5} lineHeight={16} />
        </View>
      </View>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// NewsDetailScreen
//
// Konten dirender sebagai plain Text untuk MVP — cukup untuk artikel
// yang ditulis sebagai plain text atau dengan newline sederhana.
// Share button menggunakan React Native Share API bawaan.
// ---------------------------------------------------------------------------

export default function BeritaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: article, isLoading, isError } = useNewsDetail(id ?? "");

  const handleShare = async () => {
    if (!article) return;
    try {
      await Share.share({
        message: `${article.title}\n\nBaca selengkapnya di ${APP_NAME}`,
        url: `https://kampusapp.id/berita/${article.slug}`,
      });
    } catch {
      // User dismissed share sheet — do nothing
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Custom back header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {article?.category
            ? article.category.charAt(0).toUpperCase() + article.category.slice(1)
            : "Berita"}
        </Text>
        <TouchableOpacity
          onPress={handleShare}
          style={styles.shareButton}
          disabled={!article}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="share-outline"
            size={22}
            color={article ? Colors.primary : Colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <DetailSkeleton />
      ) : isError || !article ? (
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.errorText}>Artikel tidak ditemukan</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text style={{ color: Colors.primary, fontWeight: "600" }}>← Kembali</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
          {article.thumbnail_url ? (
            <Image
              source={{ uri: article.thumbnail_url }}
              style={styles.heroImage}
              contentFit="cover"
              cachePolicy="disk"
              transition={200}
            />
          ) : (
            <View style={[styles.heroImage, styles.heroFallback]}>
              <Ionicons name="newspaper-outline" size={48} color={Colors.white} style={{ opacity: 0.4 }} />
            </View>
          )}

          <View style={styles.body}>
            <View style={styles.metaRow}>
              <Badge category={article.category} size="md" />
            </View>
            <Text style={styles.date}>{formatDate(article.published_at)}</Text>
            {article.author_name && (
              <Text style={styles.author}>Oleh {article.author_name}</Text>
            )}
            <Text style={styles.title}>{article.title}</Text>
            <View style={styles.divider} />
            <Text style={styles.content}>{article.content}</Text>

            <TouchableOpacity onPress={handleShare} style={styles.shareRow}>
              <Ionicons name="share-social-outline" size={18} color={Colors.primary} />
              <Text style={styles.shareLabel}>Bagikan artikel ini</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  backButton: { padding: 4 },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  shareButton: { padding: 4 },
  heroImage: { width: "100%", height: 240 },
  heroFallback: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { paddingHorizontal: 16, paddingTop: 20 },
  metaRow: { marginBottom: 8 },
  date: { fontSize: 12, color: Colors.textMuted, marginBottom: 2 },
  author: { fontSize: 12, color: Colors.textMuted, marginBottom: 6 },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    lineHeight: 28,
    marginTop: 8,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 16 },
  content: { fontSize: 14, color: Colors.textPrimary, lineHeight: 24 },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 32,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  shareLabel: { fontSize: 14, fontWeight: "600", color: Colors.primary },
  errorState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  errorText: { fontSize: 15, color: Colors.textMuted },
  backLink: { paddingVertical: 8 },
});