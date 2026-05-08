import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useProfile, useUpdateProfile } from "@hooks/useProfile";
import { Input } from "@components/ui/Input";
import { Button } from "@components/ui/Button";
import { Colors } from "@constants/colors";
import { generateInitials } from "@lib/utils";

// ---------------------------------------------------------------------------
// EditProfilScreen
//
// Only editable fields: full_name and phone.
// NIM, email, prodi, angkatan are readonly (must be changed by admin).
// Avatar upload placeholder — expo-image-picker integration in a later phase.
// ---------------------------------------------------------------------------

export default function EditProfilScreen() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // Sync form values when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert("Validasi", "Nama tidak boleh kosong.");
      return;
    }

    updateProfile.mutate(
      { full_name: fullName.trim(), phone: phone.trim() },
      {
        onSuccess: () => {
          Alert.alert("Berhasil", "Profil berhasil diperbarui.", [
            { text: "OK", onPress: () => router.back() },
          ]);
        },
        onError: (err) => {
          Alert.alert(
            "Gagal",
            err instanceof Error ? err.message : "Terjadi kesalahan."
          );
        },
      }
    );
  };

  const initials = profile ? generateInitials(profile.full_name) : "?";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Back header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profil</Text>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar placeholder */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <TouchableOpacity style={styles.changePhotoBtn}>
              <Ionicons name="camera-outline" size={16} color={Colors.primary} />
              <Text style={styles.changePhotoLabel}>Ganti Foto</Text>
            </TouchableOpacity>
            <Text style={styles.avatarNote}>
              Fitur upload foto akan tersedia di pembaruan berikutnya.
            </Text>
          </View>

          {/* Editable fields */}
          <View style={styles.fieldGroup}>
            <Text style={styles.groupLabel}>Informasi yang dapat diubah</Text>

            <Input
              label="Nama Lengkap"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Masukkan nama lengkap"
              leftIcon="person-outline"
              autoCapitalize="words"
            />

            <Input
              label="Nomor Telepon"
              value={phone}
              onChangeText={setPhone}
              placeholder="08xx-xxxx-xxxx"
              leftIcon="call-outline"
              keyboardType="phone-pad"
            />
          </View>

          {/* Readonly fields */}
          <View style={styles.fieldGroup}>
            <Text style={styles.groupLabel}>
              Informasi yang tidak dapat diubah sendiri
            </Text>

            <ReadonlyField label="NIM" value={profile?.nim ?? "—"} />
            <ReadonlyField label="Email" value={profile?.email ?? "—"} />
            <ReadonlyField label="Program Studi" value={profile?.major ?? "—"} />
            <ReadonlyField
              label="Angkatan"
              value={profile?.year_entry ? String(profile.year_entry) : "—"}
            />
          </View>

          {/* Save button */}
          <View style={{ marginTop: 8 }}>
            <Button
              title="Simpan Perubahan"
              variant="primary"
              onPress={handleSave}
              loading={updateProfile.isPending}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// ReadonlyField
// ---------------------------------------------------------------------------

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.readonlyField}>
      <Text style={styles.readonlyLabel}>{label}</Text>
      <Text style={styles.readonlyValue}>{value}</Text>
    </View>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 20,
  },
  avatarSection: {
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.white,
  },
  changePhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  changePhotoLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
  },
  avatarNote: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: "center",
  },
  fieldGroup: {
    gap: 12,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  readonlyField: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  readonlyLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  readonlyValue: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
});
