import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

import { useProfile } from "@hooks/useProfile";
import { useLatestNews } from "@hooks/useNews";
import { ECard } from "@components/home/ECard";
import { QuickActions } from "@components/home/QuickActions";
import { BannerCarousel } from "@components/home/BannerCarousel";
import { NewsPreview } from "@components/home/NewsPreview";
import { SkeletonBox, SkeletonText } from "@components/ui/Skeleton";
import { Colors } from "@constants/colors";
import { profileKeys, newsKeys } from "@constants/queryKeys";
import { generateInitials } from "@lib/utils";

// ---------------------------------------------------------------------------
// Header skeleton while profile is loading
// ---------------------------------------------------------------------------

function HeaderSkeleton() {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <View>
        <SkeletonBox width={140} height={20} borderRadius={8} />
        <SkeletonBox width={100} height={13} borderRadius={6} style={{ marginTop: 6 }} />
      </View>
      <SkeletonBox width={40} height={40} borderRadius={20} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// E-Card skeleton
// ---------------------------------------------------------------------------

function ECardSkeleton() {
  return (
    <SkeletonBox
      height={188}
      borderRadius={20}
      style={{ marginHorizontal: 16 }}
    />
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/**
 * BerandaScreen — main home screen.
 *
 * Menggunakan RefreshControl pada ScrollView agar user bisa pull-to-refresh
 * tanpa harus menutup dan membuka ulang aplikasi. Invalidasi query TanStack
 * Query memicu re-fetch otomatis semua data di halaman ini.
 */
export default function BerandaScreen() {
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: latestNews = [], isLoading: newsLoading } = useLatestNews(3);

  // Pull-to-refresh: invalidate both profile and news queries
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      qc.invalidateQueries({ queryKey: profileKeys.me() }),
      qc.invalidateQueries({ queryKey: newsKeys.lists() }),
    ]);
    setRefreshing(false);
  }, [qc]);

  // Build avatar initials from name
  const initials = profile ? generateInitials(profile.full_name) : "?";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* ── Header ── */}
        <View
          style={{
            backgroundColor: Colors.white,
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
          }}
        >
          {profileLoading ? (
            <HeaderSkeleton />
          ) : (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* Greeting text */}
              <View>
                <Text style={{ fontSize: 13, color: Colors.textMuted }}>
                  Halo 👋
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: Colors.textPrimary,
                    marginTop: 1,
                  }}
                  numberOfLines={1}
                >
                  {profile?.full_name ?? "Mahasiswa"}
                </Text>
                {profile?.major && (
                  <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 1 }}>
                    {profile.major}
                    {profile.year_entry ? ` · ${profile.year_entry}` : ""}
                  </Text>
                )}
              </View>

              {/* Right icons — notification + avatar */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                {/* Notification bell — placeholder for Phase 5 */}
                <TouchableOpacity
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: Colors.background,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: Colors.border,
                  }}
                >
                  <Ionicons name="notifications-outline" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>

                {/* Avatar initials circle */}
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: Colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: Colors.white, fontWeight: "700", fontSize: 14 }}>
                    {initials}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* ── E-Card ── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 }}>
          <Text style={{ fontSize: 13, color: Colors.textMuted, marginBottom: 10 }}>
            Kartu Mahasiswa Digital
          </Text>
          {profileLoading || !profile ? (
            <ECardSkeleton />
          ) : (
            <ECard profile={profile} />
          )}
        </View>

        {/* ── Quick Actions ── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
          <QuickActions />
        </View>

        {/* ── Banner Carousel ── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
          <BannerCarousel />
        </View>

        {/* ── News Preview ── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
          <NewsPreview news={latestNews} isLoading={newsLoading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
