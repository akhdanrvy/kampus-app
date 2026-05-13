import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { newsKeys } from "@constants/queryKeys";
import { NEWS_PAGE_SIZE } from "@constants/config";
import { supabase } from "@lib/supabase";
import type { NewsItem, NewsCategory } from "../types/index";

// ---------------------------------------------------------------------------
// useNewsList — paginated news feed with optional category filter
// ---------------------------------------------------------------------------

export function useNewsList(category?: NewsCategory) {
  return useInfiniteQuery({
    queryKey: newsKeys.list({ category }),
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }): Promise<NewsItem[]> => {
      const from = (pageParam as number) * NEWS_PAGE_SIZE;
      const to = from + NEWS_PAGE_SIZE - 1;

      let query = supabase
        .from("news")
        .select("*")
        .order("published_at", { ascending: false })
        .range(from, to);

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as NewsItem[];
    },
    getNextPageParam: (lastPage: NewsItem[], allPages: NewsItem[][]) =>
      lastPage.length < NEWS_PAGE_SIZE ? undefined : allPages.length,
  });
}

// ---------------------------------------------------------------------------
// useNewsDetail — single article by id
// ---------------------------------------------------------------------------

export function useNewsDetail(id: string) {
  return useQuery({
    queryKey: newsKeys.detail(id),
    enabled: !!id,
    queryFn: async (): Promise<NewsItem> => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      if (!data) throw new Error("Artikel tidak ditemukan.");
      return data as NewsItem;
    },
  });
}

// ---------------------------------------------------------------------------
// useFeaturedNews — hero article (is_featured = true) for the news feed header
// ---------------------------------------------------------------------------

export function useFeaturedNews() {
  return useQuery({
    queryKey: [...newsKeys.lists(), "featured"],
    queryFn: async (): Promise<NewsItem | null> => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("is_featured", true)
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as NewsItem | null;
    },
  });
}

// ---------------------------------------------------------------------------
// useNewsInfinite — alias used by berita/index.tsx
// Accepts string | null so "Semua" filter can pass null to show all categories.
// ---------------------------------------------------------------------------

export function useNewsInfinite(category?: string | null) {
  return useInfiniteQuery({
    queryKey: newsKeys.list({ category: category ?? undefined }),
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }): Promise<NewsItem[]> => {
      const from = (pageParam as number) * NEWS_PAGE_SIZE;
      const to = from + NEWS_PAGE_SIZE - 1;

      let query = supabase
        .from("news")
        .select("*")
        .order("published_at", { ascending: false })
        .range(from, to);

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as NewsItem[];
    },
    getNextPageParam: (lastPage: NewsItem[], allPages: NewsItem[][]) =>
      lastPage.length < NEWS_PAGE_SIZE ? undefined : allPages.length,
  });
}

// ---------------------------------------------------------------------------
// useLatestNews — latest N articles for the home screen preview
// ---------------------------------------------------------------------------

export function useLatestNews(limit = 3) {
  return useQuery({
    queryKey: [...newsKeys.lists(), "latest", limit],
    queryFn: async (): Promise<NewsItem[]> => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as NewsItem[];
    },
  });
}
