import { QueryClient } from "@tanstack/react-query";

// Single QueryClient instance for the whole app
// staleTime: 5 minutes — data is fresh for 5 minutes before re-fetching in background
// retry: 2 — retry failed requests twice before showing an error
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
