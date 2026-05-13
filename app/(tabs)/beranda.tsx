import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useProfile } from "@hooks/useProfile";
import { useLatestNews } from "@hooks/useNews";
import { useEvents } from "@hooks/useEvents";
import { ECard } from "@components/home/ECard";
import { QuickActions } from "@components/home/QuickActions";
import { BannerCarousel } from "@components/home/BannerCarousel";
import { NewsPreview } from "@components/home/NewsPreview";
import { SkeletonBox, SkeletonText } from "@components/ui/Skeleton";
import { Colors } from "@constants/colors";
import { profileKeys, newsKeys, eventKeys } from "@constants/queryKeys";
import { generateInitials, formatDate, formatTime } from "@lib/utils";

// ---------------------------------------------------------------------------
// Skeleton loaders
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
// EventCard — single upcoming event row
// ---------------------------------------------------------------------------

function EventCard({ event }: { event: import("../../types/index").EventItem }) {
  return (
    <View
      style={{
        backgroundColor: Colors.white,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.border,
        flexDirection: "row",
        gap: 12,
        alignItems: "flex-start",
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          backgroundColor: "#EFF6FF",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Ionicons name="calendar-outline" size={24} color={Colors.primaryLight} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: 13, fontWeight: "600", color: Colors.textPrimary, lineHeight: 18 }}
          numberOfLines={2}
        >
          {event.title}
        </Text>
        {event.location && (
          <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }} numberOfLines={1}>
            <Ionicons name="location-outline" size={11} /> {event.location}
          </Text>
        )}
        <Text style={{ fontSize: 11, color: Colors.primaryLight, marginTop: 3, fontWeight: "500" }}>
          {formatDate(event.event_date)} · {formatTime(event.event_date)}
        </Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// BerandaScreen
// ---------------------------------------------------------------------------

export default function BerandaScreen() {
  const qc = useQueryClient();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: latestNews = [], isLoading: newsLoading } = useLatestNews(3);
  const { data: events = [], isLoading: eventsLoading } = useEvents();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      qc.invalidateQueries({ queryKey: profileKeys.me() }),
      qc.invalidateQueries({ queryKey: newsKeys.lists() }),
      qc.invalidateQueries({ queryKey: eventKeys.lists() }),
    ]);
    setRefreshing(false);
  }, [qc]);

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
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text style={{ fontSize: 13, color: Colors.textMuted }}>Halo 👋</Text>
                <Text
                  style={{ fontSize: 18, fontWeight: "700", color: Colors.textPrimary, marginTop: 1 }}
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

              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
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

        {/* ── Upcoming Events ── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.textPrimary }}>
              Event Mendatang
            </Text>
          </View>

          {eventsLoading ? (
            <>
              <SkeletonBox height={76} borderRadius={14} style={{ marginBottom: 10 }} />
              <SkeletonBox height={76} borderRadius={14} style={{ marginBottom: 10 }} />
            </>
          ) : events.length === 0 ? (
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
                Belum ada event mendatang.
              </Text>
            </View>
          ) : (
            events.slice(0, 3).map((ev) => <EventCard key={ev.id} event={ev} />)
          )}
        </View>

        {/* ── News Preview ── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
          <NewsPreview news={latestNews} isLoading={newsLoading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
