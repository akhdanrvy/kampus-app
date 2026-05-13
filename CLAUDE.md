# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**KampusGo** is a React Native mobile app (Expo + TypeScript) for university students to manage academics, news, class schedules, and QR-code attendance. The app is currently in development using mock data, with TODOs throughout to wire up the real Supabase backend.

## Commands

```bash
# Start dev server (choose platform interactively)
npx expo start

# Platform-specific
npx expo start --android
npx expo start --ios

# Build via EAS
eas build --profile development
eas build --profile preview
eas build --profile production
```

There is no lint or test script configured. TypeScript checking:
```bash
npx tsc --noEmit
```

## Architecture

### Routing (Expo Router v6 — file-based)

```
app/
  _layout.tsx          # Root: QueryClientProvider, ErrorBoundary, OfflineBanner, ToastContainer + auth redirect
  (auth)/              # Unauthenticated screens: login, register, forgot-password
  (tabs)/              # Bottom tab navigator (5 tabs)
    beranda.tsx        # Home dashboard
    berita/            # News feed + [id].tsx detail
    scan.tsx           # QR attendance scanner
    akademik/          # Class schedules
    profil/            # Profile view + edit
```

Auth redirect lives in `app/_layout.tsx`. Currently uses a `MOCK_SESSION` — real Supabase auth is commented out with TODOs.

### State Layers

| Layer | Tool | Persistence |
|-------|------|-------------|
| Auth (userId, role, isAuthenticated) | Zustand (`stores/authStore.ts`) | MMKV (`lib/mmkv.ts`) |
| UI (loading overlay, toasts) | Zustand (`stores/uiStore.ts`) | None (ephemeral) |
| QR scan state | Zustand (`stores/scanStore.ts`) | None (ephemeral) |
| Server data (profiles, news, schedules) | TanStack Query v5 | In-memory, 5-min staleTime |

### Data Fetching

- All hooks live in `hooks/` — each wraps TanStack Query calls against Supabase or mock data.
- Query keys are centralized in `constants/queryKeys.ts` as factory functions (e.g., `newsKeys.list({ category })`).
- News feed uses `useInfiniteQuery` with page size `NEWS_PAGE_SIZE` from `constants/config.ts`.
- Mock data is in `lib/mockData.ts`. When replacing with real Supabase calls, remove mock imports and use `lib/supabase.ts` client directly.

### Backend (Supabase)

- Client: `lib/supabase.ts` — uses `expo-secure-store` as the storage adapter (v15.x API: `getItem`/`setItem`/`removeItem`).
- Types: `types/database.ts` (Supabase-generated, currently a placeholder) and `types/index.ts` (manual domain types).
- No ORM — raw `supabase.from().select()` queries.
- Key tables: `profiles`, `news`, `schedules`, `attendance_sessions`, `attendance_records`, `events`, `event_registrations`.

### Styling

- **NativeWind v4** — Tailwind CSS via `className` props on React Native components.
- Design tokens in `constants/colors.ts` and `tailwind.config.js` (primary navy `#1E3A5F`, accent amber `#F59E0B`).
- Global styles: `global.css`.

### Path Aliases (tsconfig)

```
@components/*  →  components/
@hooks/*       →  hooks/
@stores/*      →  stores/
@lib/*         →  lib/
@constants/*   →  constants/
@types/*       →  types/
```

## Key Conventions

- **Indonesian language** throughout UI strings and date formatting (`date-fns` with `id` locale).
- `day_of_week` in schedules is 1-based (1 = Monday, 7 = Sunday).
- Button component has `variant` (`primary` | `outlined` | `ghost`) and `size` (`sm` | `md` | `lg`) props.
- Skeleton components (e.g., `NewsListSkeleton`) are the loading state pattern — use them, not spinners inline.
- Toast notifications go through `uiStore` → `ToastContainer` (global).
- Network status is exposed via `hooks/useNetworkStatus.ts` and surfaced globally by `OfflineBanner`.

## Environment Variables

```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS
```

All `EXPO_PUBLIC_` prefixed vars are inlined at build time by Metro. Copy `.env.example` to `.env`.
