import { useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { useNewsInfinite } from "@hooks/useNews";
import { useFeaturedNews } from "@hooks/useNews";
import { HeroNews } from "@components/news/HeroNews";
import { NewsCard } from "@components/news/NewsCard";
import { NewsFilter } from "@components/news/NewsFilter";
import { NewsListSkeleton } from "@components/news/NewsListSkeleton";
import { EmptyState } from "@components/ui/EmptyState";
import { Colors } from "@constants/colors";
import { newsKeys } from "@constants/queryKeys";
import type { NewsItem } from "../../../types/index";

// ---------------------------------------------------------------------------
// BeritaScreen — News feed with hero, filter tabs, and infinite scroll
//
// Menggunakan FlashList (@shopify/flash-list) sebagai pengganti FlatList
// karena FlashList recycles cell views (mirip RecyclerView di Android),
// sehingga scroll 100+ item tetap smooth di low-end devices.
// Trade-off: butuh `estimatedItemSize` prop agar layout pass tidak berulang.
// Untuk MVP ini, FlatList juga bisa — tapi FlashList future-proof.
//
// Infinite scroll menggunakan useNewsInfinite (useInfiniteQuery) bukan
// useQuery biasa, karena feed berita paginated — kita hanya mau load
// 10 item pertama, lalu tambah 10 lagi saat scroll mendekati akhir list.
// useQuery biasa tidak punya konsep "page param" bawaan.
// ---------------------------------------------------------------------------

export default function BeritaScreen() {
  const qc = useQueryClient();

  // Local state — category filter. null = "Semua" (no filter)
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Featured hero article
  const { data: featured, isLoading: featuredLoading } = useFeaturedNews();

  // Paginated news list
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = useNewsInfinite(activeCategory);

  // Flatten pages from infinite query into a single array
  const articles: NewsItem[] = data?.pages.flat() ?? [];

  // Handle category change — reset list scroll by re-fetching from page 0
  const handleCategoryChange = useCallback(
    (category: string | null) => {
      setActiveCategory(category);
      // Invalidate the specific query key so the new filter starts fresh
      qc.invalidateQueries({ queryKey: newsKeys.list({ category: category ?? undefined }) });
    },
    [qc]
  );

  const handleArticlePress = useCallback((id: string) => {
    router.push(`/berita/${id}`);
  }, []);

  // Load more when user scrolls to 30% from the end
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Footer: spinner while fetching next page
  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }, [isFetchingNextPage]);

  // Show skeleton on first load
  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Berita & Pengumuman</Text>
        </View>
        <NewsListSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Static header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Berita & Pengumuman</Text>
      </View>

      <FlashList
        data={articles}
        keyExtractor={(item) => item.id}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <View>
            {/* Hero news — show skeleton placeholder if still loading */}
            {featuredLoading ? null : featured ? (
              <HeroNews article={featured} onPress={handleArticlePress} />
            ) : null}
            {/* Category filter tabs */}
            <NewsFilter
              activeCategory={activeCategory}
              onSelectCategory={handleCategoryChange}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="newspaper-outline"
            title="Belum ada berita"
            subtitle={
              activeCategory
                ? `Tidak ada berita untuk kategori "${activeCategory}" saat ini.`
                : "Belum ada berita yang dipublikasikan."
            }
          />
        }
        ListFooterComponent={renderFooter}
        renderItem={({ item }) => (
          <NewsCard article={item} onPress={handleArticlePress} />
        )}
        // Pull-to-refresh
        onRefresh={refetch}
        refreshing={isRefetching}
      />
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
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
