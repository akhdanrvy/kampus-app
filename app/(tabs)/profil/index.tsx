import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useProfile } from "@hooks/useProfile";
import { useSignOut } from "@hooks/useAuth";
import { ECard } from "@components/home/ECard";
import { ECardFull } from "@components/profil/ECardFull";
import { FadeIn, SkeletonBox, SkeletonText } from "@components/ui/Skeleton";
import { Colors } from "@constants/colors";
import { generateInitials } from "@lib/utils";

// ---------------------------------------------------------------------------
// Menu item helper
// ---------------------------------------------------------------------------

interface MenuItem {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

function MenuRow({ icon, label, onPress, danger }: MenuItem) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.menuRow} activeOpacity={0.7}>
      <View style={[styles.menuIconWrap, danger && styles.menuIconDanger]}>
        <Ionicons
          name={icon as any}
          size={18}
          color={danger ? Colors.danger : Colors.primary}
        />
      </View>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>
        {label}
      </Text>
      {!danger && (
        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// ProfilScreen
// ---------------------------------------------------------------------------

export default function ProfilScreen() {
  const { data: profile, isLoading, isError, error } = useProfile();
  const signOut = useSignOut();
  const [eCardVisible, setECardVisible] = useState(false);

  useEffect(() => {
    console.log("[Profil] profile:", profile);
    console.log("[Profil] isLoading:", isLoading, "isError:", isError, error?.message);
  }, [profile, isLoading, isError, error]);

  const handleLogout = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Apakah kamu yakin ingin keluar dari akun ini?");
      if (confirmed) {
        signOut.mutate();
      }
      return;
    }

    Alert.alert("Keluar", "Apakah kamu yakin ingin keluar dari akun ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: () => signOut.mutate(),
      },
    ]);
  };

  const initials = profile ? generateInitials(profile.full_name) : "?";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <FadeIn duration={220}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>

        {/* Avatar + identity */}
        <View style={styles.identitySection}>
          {isLoading ? (
            <>
              <SkeletonBox width={80} height={80} borderRadius={40} />
              <View style={{ gap: 8, flex: 1 }}>
                <SkeletonBox height={18} borderRadius={6} />
                <SkeletonBox width={140} height={13} borderRadius={4} />
              </View>
            </>
          ) : (
            <>
              {/* Avatar circle with initials */}
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fullName}>{profile?.full_name}</Text>
                <Text style={styles.nim}>{profile?.nim}</Text>
                {profile?.major && (
                  <Text style={styles.major}>{profile.major}</Text>
                )}
                {profile?.year_entry && (
                  <Text style={styles.year}>Angkatan {profile.year_entry}</Text>
                )}
              </View>
            </>
          )}
        </View>

        {/* E-Card section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>E-Card Digital Saya</Text>
          {isLoading || !profile ? (
            <SkeletonBox height={188} borderRadius={20} />
          ) : (
            <>
              <ECard profile={profile} onPressQR={() => setECardVisible(true)} />
              <TouchableOpacity
                onPress={() => setECardVisible(true)}
                style={styles.expandHint}
              >
                <Text style={styles.expandHintText}>Tap QR untuk perbesar →</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionLabel}>Menu</Text>
          <View style={styles.menuCard}>
            <MenuRow
              icon="person-outline"
              label="Edit Profil"
              onPress={() =>
                router.push({
                  pathname: "/profil/edit",
                  params: { from: "/(tabs)/profil" },
                })
              }
            />
            <View style={styles.divider} />
            <MenuRow
              icon="notifications-outline"
              label="Notifikasi"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <MenuRow
              icon="lock-closed-outline"
              label="Ubah Password"
              onPress={() => router.push("/(auth)/forgot-password")}
            />
            <View style={styles.divider} />
            <MenuRow
              icon="information-circle-outline"
              label="Tentang Aplikasi"
              onPress={() =>
                router.push({
                  pathname: "/profil/about",
                  params: { from: "/(tabs)/profil" },
                })
              }
            />
            <View style={styles.divider} />
            <MenuRow
              icon="log-out-outline"
              label="Keluar"
              onPress={handleLogout}
              danger
            />
          </View>
        </View>
        </FadeIn>
      </ScrollView>

      {/* Fullscreen E-Card modal */}
      {profile && (
        <ECardFull
          profile={profile}
          visible={eCardVisible}
          onClose={() => setECardVisible(false)}
        />
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
  identitySection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.white,
  },
  fullName: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  nim: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
    fontFamily: "monospace",
  },
  major: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  year: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 4,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textMuted,
    marginBottom: 4,
  },
  expandHint: {
    alignSelf: "flex-end",
    marginTop: 4,
  },
  expandHintText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "500",
  },
  menuSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  menuSectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  menuIconDanger: {
    backgroundColor: "#FEF2F2",
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  menuLabelDanger: {
    color: Colors.danger,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 62,
  },
});
