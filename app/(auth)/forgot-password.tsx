import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Pressable,
  Keyboard,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@hooks/useAuth";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Colors } from "@constants/colors";
import { ENABLE_PASSWORD_RESET } from "@constants/config";

/**
 * Forgot Password Screen
 *
 * Mengirim link reset password via Supabase Auth ke email mahasiswa.
 * Setelah berhasil, menampilkan pesan sukses inline — tidak pakai modal
 * agar UX lebih ringan untuk alur sederhana seperti ini.
 */
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    if (!email) { setEmailError("Email wajib diisi"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Format email tidak valid");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    if (!validate()) return;

    resetPassword.mutate(email.trim(), {
      onSuccess: () => setIsSuccess(true),
    });
  };

  if (!ENABLE_PASSWORD_RESET) {
    return (
      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: Colors.border,
              }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ marginRight: 12 }}
              >
                <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: "700", color: Colors.textPrimary }}>
                Lupa Kata Sandi
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                paddingHorizontal: 24,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 44,
                  backgroundColor: "#FEF3C7",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Ionicons name="time-outline" size={44} color={Colors.accent} />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: Colors.textPrimary,
                  marginBottom: 8,
                }}
              >
                Fitur Belum Aktif
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.textMuted,
                  textAlign: "center",
                  lineHeight: 20,
                  marginBottom: 24,
                }}
              >
                Reset password sengaja dinonaktifkan sementara selama audit device.
                Gunakan akun yang dibuat dari panel admin.
              </Text>
              <Button
                title="Kembali ke Login"
                onPress={() => router.replace("/(auth)/login")}
                fullWidth
              />
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Pressable>
    );
  }

  return (
    <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* ── Header ── */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: Colors.border,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ marginRight: 12 }}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "700", color: Colors.textPrimary }}>
              Lupa Kata Sandi
            </Text>
          </View>

          {/* ── Content ── */}
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 40 }}>
            {/* Icon illustration */}
            <View style={{ alignItems: "center", marginBottom: 32 }}>
              <View
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 44,
                  backgroundColor: "#EFF6FF",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Ionicons name="mail-unread-outline" size={44} color={Colors.primaryLight} />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: Colors.textPrimary,
                  marginBottom: 8,
                }}
              >
                Reset Password
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.textMuted,
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                Masukkan email kampus Anda. Kami akan mengirimkan link untuk
                membuat kata sandi baru.
              </Text>
            </View>

            {/* Success state */}
            {isSuccess ? (
              <View
                style={{
                  backgroundColor: "#D1FAE5",
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "600", color: "#065F46", fontSize: 14 }}>
                    Link Terkirim!
                  </Text>
                  <Text style={{ fontSize: 13, color: "#065F46", marginTop: 2, lineHeight: 18 }}>
                    Cek inbox email Anda dan ikuti instruksi untuk membuat kata
                    sandi baru.
                  </Text>
                </View>
              </View>
            ) : (
              <>
                <Input
                  label="Email Kampus"
                  placeholder="nama@kampus.ac.id"
                  value={email}
                  onChangeText={(v) => { setEmail(v); setEmailError(undefined); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={emailError}
                  leftIcon={
                    <Ionicons name="mail-outline" size={18} color={Colors.textMuted} />
                  }
                />

                <View style={{ marginTop: 8 }}>
                  <Button
                    title="Kirim Link Reset"
                    onPress={handleSubmit}
                    fullWidth
                    loading={resetPassword.isPending}
                    disabled={resetPassword.isPending}
                  />
                </View>
              </>
            )}

            {/* Back to login */}
            <View
              style={{ flexDirection: "row", justifyContent: "center", marginTop: 32 }}
            >
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <Text style={{ color: Colors.primary, fontWeight: "600", fontSize: 14 }}>
                  ← Kembali ke Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Pressable>
  );
}
