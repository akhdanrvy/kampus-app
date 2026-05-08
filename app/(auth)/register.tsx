import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Pressable,
  Keyboard,
  Modal,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@hooks/useAuth";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Colors } from "@constants/colors";

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validate(fields: {
  full_name: string;
  nim: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  const errors: Partial<typeof fields> = {};

  if (!fields.full_name || fields.full_name.trim().length < 3)
    errors.full_name = "Nama minimal 3 karakter";

  if (!fields.nim || !/^\d{8,}$/.test(fields.nim))
    errors.nim = "NIM harus berupa angka minimal 8 digit";

  if (!fields.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    errors.email = "Format email tidak valid";

  if (!fields.password || fields.password.length < 8)
    errors.password = "Password minimal 8 karakter";

  if (fields.confirmPassword !== fields.password)
    errors.confirmPassword = "Konfirmasi password tidak cocok";

  return errors;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/**
 * Register Screen
 *
 * Validasi dilakukan di layer UI (sebelum hit API) untuk memberi feedback
 * instan ke user — mengurangi request yang tidak perlu ke Supabase.
 * Modal sukses ditampilkan setelah register berhasil, lalu redirect ke login.
 */
export default function RegisterScreen() {
  const router = useRouter();
  const { signUpWithEmail } = useAuth();

  const [form, setForm] = useState({
    full_name: "",
    nim: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const setField = (key: keyof typeof form) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    // Clear individual field error on change
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleRegister = () => {
    Keyboard.dismiss();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    signUpWithEmail.mutate(
      {
        email: form.email.trim(),
        password: form.password,
        full_name: form.full_name.trim(),
        nim: form.nim.trim(),
      },
      {
        onSuccess: () => {
          setShowSuccess(true);
          // Redirect to login after 2.5 seconds
          setTimeout(() => {
            setShowSuccess(false);
            router.replace("/(auth)/login");
          }, 2500);
        },
      }
    );
  };

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
              Daftar Akun Baru
            </Text>
          </View>

          {/* ── Form ── */}
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={{ fontSize: 14, color: Colors.textMuted, marginBottom: 24 }}>
              Isi data diri Anda untuk membuat akun mahasiswa.
            </Text>

            <Input
              label="Nama Lengkap"
              placeholder="Sesuai KTP / ijazah"
              value={form.full_name}
              onChangeText={setField("full_name")}
              error={errors.full_name}
              autoCapitalize="words"
              leftIcon={
                <Ionicons name="person-outline" size={18} color={Colors.textMuted} />
              }
            />

            <Input
              label="NIM"
              placeholder="Nomor Induk Mahasiswa (min. 8 digit)"
              value={form.nim}
              onChangeText={setField("nim")}
              error={errors.nim}
              keyboardType="numeric"
              autoCapitalize="none"
              leftIcon={
                <Ionicons name="card-outline" size={18} color={Colors.textMuted} />
              }
            />

            <Input
              label="Email Kampus"
              placeholder="nama@kampus.ac.id"
              value={form.email}
              onChangeText={setField("email")}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={
                <Ionicons name="mail-outline" size={18} color={Colors.textMuted} />
              }
            />

            <Input
              label="Password"
              placeholder="Minimal 8 karakter"
              value={form.password}
              onChangeText={setField("password")}
              error={errors.password}
              secureTextEntry
              leftIcon={
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
              }
            />

            <Input
              label="Konfirmasi Password"
              placeholder="Ulangi password"
              value={form.confirmPassword}
              onChangeText={setField("confirmPassword")}
              error={errors.confirmPassword}
              secureTextEntry
              leftIcon={
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
              }
            />

            <View style={{ marginTop: 8 }}>
              <Button
                title="Daftar"
                onPress={handleRegister}
                fullWidth
                loading={signUpWithEmail.isPending}
                disabled={signUpWithEmail.isPending}
              />
            </View>

            {/* Login link */}
            <View
              style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}
            >
              <Text style={{ color: Colors.textMuted, fontSize: 14 }}>
                Sudah punya akun?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <Text style={{ color: Colors.primary, fontWeight: "600", fontSize: 14 }}>
                  Masuk
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* ── Success Modal ── */}
        <Modal visible={showSuccess} transparent animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 32,
            }}
          >
            <View
              style={{
                backgroundColor: Colors.white,
                borderRadius: 20,
                padding: 32,
                alignItems: "center",
                width: "100%",
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: "#D1FAE5",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Ionicons name="checkmark-circle" size={36} color={Colors.success} />
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: Colors.textPrimary,
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                Akun Berhasil Dibuat!
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.textMuted,
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                Cek email Anda untuk verifikasi akun sebelum masuk.
              </Text>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Pressable>
  );
}
