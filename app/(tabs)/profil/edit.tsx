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
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { useProfile, useUpdateProfile } from "@hooks/useProfile";
import { Input } from "@components/ui/Input";
import { Button } from "@components/ui/Button";
import { Colors } from "@constants/colors";
import { generateInitials } from "@lib/utils";
import { supabase } from "@lib/supabase";

// ---------------------------------------------------------------------------
// EditProfilScreen
//
// Field yang bisa diubah: full_name, phone, avatar.
// NIM, email, prodi, angkatan hanya bisa diubah oleh admin.
//
// Upload avatar dilakukan saat tombol Simpan ditekan (bukan langsung saat
// foto dipilih) — menghindari upload yang terbuang jika user batal.
// ---------------------------------------------------------------------------

export default function EditProfilScreen() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    console.log("=== Edit Profil Debug ===");
    console.log("profile loaded:", profile);
    console.log("========================");
  }, [profile]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  // ── Pilih foto dari galeri ─────────────────────────────────────────────────

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Izin Diperlukan", "Akses galeri diperlukan untuk mengganti foto profil.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets[0]) return;
    // Simpan URI lokal — upload baru terjadi saat user tekan Simpan
    setNewAvatarUri(result.assets[0].uri);
  };

  // ── Upload foto ke Supabase Storage ───────────────────────────────────────

  const uploadAvatar = async (uri: string): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) throw new Error("User tidak terautentikasi");

    const response = await fetch(uri);
    const blob = await response.blob();

    // Tentukan ekstensi dari URI; default ke jpg
    const ext = uri.split(".").pop()?.toLowerCase().replace(/\?.*$/, "") ?? "jpg";
    const contentType = ext === "png" ? "image/png" : "image/jpeg";

    // Path: <user_id>/avatar-<timestamp>.<ext> — pakai subfolder per user
    // agar Storage policy bisa di-scope ke auth.uid()
    const fileName = `${user.id}/avatar-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, blob, { contentType, upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(data.path);

    return publicUrl;
  };

  // ── Simpan semua perubahan ─────────────────────────────────────────────────

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("Validasi", "Nama tidak boleh kosong.");
      return;
    }

    try {
      let avatarUrl = profile?.avatar_url;

      // Upload foto baru jika user memilih foto berbeda
      if (newAvatarUri) {
        setIsUploading(true);
        avatarUrl = await uploadAvatar(newAvatarUri);
        setIsUploading(false);
      }

      updateProfile(
        {
          full_name: fullName.trim(),
          phone: phone.trim(),
          ...(avatarUrl !== profile?.avatar_url && { avatar_url: avatarUrl }),
        },
        {
          onSuccess: () => {
            Alert.alert("Berhasil", "Profil berhasil diperbarui.", [
              { text: "OK", onPress: () => router.back() },
            ]);
          },
          onError: (err) => {
            Alert.alert(
              "Gagal",
              err instanceof Error ? err.message : "Gagal menyimpan perubahan. Coba lagi."
            );
          },
        }
      );
    } catch (err) {
      setIsUploading(false);
      Alert.alert(
        "Upload Gagal",
        err instanceof Error ? err.message : "Tidak dapat mengupload foto."
      );
    }
  };

  const initials = profile ? generateInitials(profile.full_name) : "?";
  // Tampilkan preview foto baru (belum diupload) atau foto dari profil
  const avatarSource = newAvatarUri ?? profile?.avatar_url;
  const isBusy = isPending || isUploading;

  if (profileLoading && !profile) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profil</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
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
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              onPress={handlePickAvatar}
              disabled={isBusy}
              activeOpacity={0.8}
            >
              {avatarSource ? (
                <Image source={{ uri: avatarSource }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}
              <View style={styles.cameraOverlay}>
                {isUploading ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Ionicons name="camera" size={14} color={Colors.white} />
                )}
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarNote}>
              {isUploading
                ? "Mengupload foto..."
                : newAvatarUri
                ? "Foto baru dipilih — tekan Simpan untuk menyimpan"
                : "Tap foto untuk mengganti"}
            </Text>
          </View>

          {/* Field yang bisa diubah */}
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

          {/* Field readonly */}
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

          <View style={{ marginTop: 8 }}>
            <Button
              title={isUploading ? "Mengupload foto..." : "Simpan Perubahan"}
              variant="primary"
              onPress={handleSave}
              loading={isBusy}
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
  avatarSection: { alignItems: "center", gap: 10 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: { width: 88, height: 88, borderRadius: 44 },
  avatarText: { fontSize: 28, fontWeight: "800", color: Colors.white },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  avatarNote: { fontSize: 11, color: Colors.textMuted, textAlign: "center" },
  fieldGroup: { gap: 12 },
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
  readonlyLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 2 },
  readonlyValue: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
});
