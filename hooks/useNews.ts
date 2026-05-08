import {
  useQuery,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { newsKeys } from "@constants/queryKeys";
import { NEWS_PAGE_SIZE } from "@constants/config";
import {
  mockNewsList,
  mockFeaturedNews,
  mockLatestNews,
} from "@lib/mockData";
import type { NewsItem, NewsCategory } from "../types/index";

// TODO: Replace with Supabase queries when backend is connected
// import { supabase } from "@lib/supabase";

// ---------------------------------------------------------------------------
// useNewsList — paginated news feed with optional category filter
// ---------------------------------------------------------------------------

/**
 * useNewsList uses useInfiniteQuery to support the "Load more / infinite scroll"
 * pattern. Each page fetches NEWS_PAGE_SIZE items using Supabase range().
 *
 * Menggunakan useInfiniteQuery (bukan useQuery biasa) karena feed berita
 * membutuhkan pagination — memuat halaman berikutnya saat user scroll ke bawah.
 */
export function useNewsList(category?: NewsCategory) {
  return useInfiniteQuery({
    queryKey: newsKeys.list({ category }),
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }): Promise<NewsItem[]> => {
      // TODO: Replace with Supabase paginated query when connected
      await new Promise((r) => setTimeout(r, 200));
      const filtered = category
        ? mockNewsList.filter((n) => n.category === category)
        : mockNewsList;
      const from = (pageParam as number) * NEWS_PAGE_SIZE;
      return filtered.slice(from, from + NEWS_PAGE_SIZE);
    },
    getNextPageParam: (lastPage: NewsItem[], allPages: NewsItem[][]) => {
      return lastPage.length < NEWS_PAGE_SIZE ? undefined : allPages.length;
    },
  });
}

// ---------------------------------------------------------------------------
// useNewsDetail — single article
// ---------------------------------------------------------------------------

export function useNewsDetail(id: string) {
  return useQuery({
    queryKey: newsKeys.detail(id),
    enabled: !!id,
    queryFn: async (): Promise<NewsItem> => {
      // TODO: Replace with Supabase .single() query when connected
      await new Promise((r) => setTimeout(r, 150));
      const found = mockNewsList.find((n) => n.id === id);
      if (!found) throw new Error("Artikel tidak ditemukan.");
      return found;
    },
  });
}

// ---------------------------------------------------------------------------
// useFeaturedNews — hero article for the news feed header
// ---------------------------------------------------------------------------

export function useFeaturedNews() {
  return useQuery({
    queryKey: [...newsKeys.lists(), "featured"],
    queryFn: async (): Promise<NewsItem | null> => {
      // TODO: Replace with Supabase query when connected
      await new Promise((r) => setTimeout(r, 150));
      return mockFeaturedNews;
    },
  });
}

// ---------------------------------------------------------------------------
// useNewsInfinite — alias used by the news feed screen
// Accepts string | null so the "Semua" filter can pass null to show all.
// ---------------------------------------------------------------------------

/**
 * Alias of useNewsList that accepts a nullable string category.
 * Dipakai di screen berita/index.tsx agar "Semua" cukup kirim null.
 */
export function useNewsInfinite(category?: string | null) {
  return useInfiniteQuery({
    queryKey: newsKeys.list({ category: category ?? undefined }),
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }): Promise<NewsItem[]> => {
      // TODO: Replace with Supabase paginated query when connected
      await new Promise((r) => setTimeout(r, 200));
      const filtered = category
        ? mockNewsList.filter((n) => n.category === category)
        : mockNewsList;
      const from = (pageParam as number) * NEWS_PAGE_SIZE;
      return filtered.slice(from, from + NEWS_PAGE_SIZE);
    },
    getNextPageParam: (lastPage: NewsItem[], allPages: NewsItem[][]) =>
      lastPage.length < NEWS_PAGE_SIZE ? undefined : allPages.length,
  });
}

// ---------------------------------------------------------------------------
// useLatestNews — latest N articles for the home screen preview
// ---------------------------------------------------------------------------

/**
 * useLatestNews fetches a small fixed set of articles for the home screen.
 * Separate from useNewsList to avoid coupling the home screen to the news
 * pagination logic.
 */
export function useLatestNews(limit = 3) {
  return useQuery({
    queryKey: [...newsKeys.lists(), "latest", limit],
    queryFn: async (): Promise<NewsItem[]> => {
      // TODO: Replace with Supabase query when connected
      await new Promise((r) => setTimeout(r, 200));
      return mockLatestNews.slice(0, limit);
    },
  });
}
