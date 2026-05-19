import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Pressable,
  Keyboard,
  Dimensions,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { useAuth } from "@hooks/useAuth";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Colors } from "@constants/colors";
import { ENABLE_GOOGLE_OAUTH, ENABLE_PASSWORD_RESET } from "@constants/config";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function validateEmail(email: string): string | undefined {
  if (!email) return "Email wajib diisi";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Format email tidak valid";
}

function validatePassword(password: string): string | undefined {
  if (!password) return "Kata sandi wajib diisi";
  if (password.length < 6) return "Kata sandi minimal 6 karakter";
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/**
 * Login Screen
 *
 * Menggunakan KeyboardAvoidingView agar form tidak tertutup keyboard saat
 * user mengetik — behavior "padding" untuk iOS, "height" untuk Android.
 * ScrollView di dalamnya memungkinkan scroll jika layar kecil.
 */
export default function LoginScreen() {
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();

  // Validate all fields and return true if form is valid
  const validate = (): boolean => {
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    return !eErr && !pErr;
  };

  const handleLogin = () => {
    Keyboard.dismiss();
    if (!validate()) return;
    signInWithEmail.mutate({ email: email.trim(), password });
  };

  const handleGoogle = () => {
    signInWithGoogle.mutate();
  };

  return (
    // Dismiss keyboard when tapping outside inputs (native only — web tidak perlu)
    <Pressable
      style={{ flex: 1 }}
      onPress={Platform.OS !== "web" ? Keyboard.dismiss : undefined}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
        {/* KeyboardAvoidingView — dinonaktifkan di web karena tidak relevan */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : Platform.OS === "android" ? "height" : undefined}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Hero area (top 40%) ── */}
            <LinearGradient
              colors={[Colors.primary, Colors.primaryLight]}
              style={{
                height: SCREEN_HEIGHT * 0.38,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* App logo / icon */}
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 20,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Ionicons name="school" size={44} color={Colors.white} />
              </View>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "800",
                  color: Colors.white,
                  letterSpacing: 0.5,
                }}
              >
                KampusGo
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 4 }}>
                Ekosistem Digital Akademik
              </Text>
            </LinearGradient>

            {/* ── Form card (bottom 60%) ── */}
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.white,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                marginTop: -24,
                paddingHorizontal: 24,
                paddingTop: 32,
                paddingBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: Colors.textPrimary,
                  marginBottom: 4,
                }}
              >
                Selamat Datang
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.textMuted,
                  marginBottom: 28,
                }}
              >
                Masuk ke akun kampus Anda
              </Text>

              {/* Email input */}
              <Input
                label="Email"
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

              {/* Password input */}
              <Input
                label="Kata Sandi"
                placeholder="Minimal 6 karakter"
                value={password}
                onChangeText={(v) => { setPassword(v); setPasswordError(undefined); }}
                secureTextEntry
                error={passwordError}
                leftIcon={
                  <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
                }
              />

              {/* Forgot password link */}
              {ENABLE_PASSWORD_RESET ? (
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/forgot-password")}
                  style={{ alignSelf: "flex-end", marginTop: -4, marginBottom: 24 }}
                >
                  <Text style={{ fontSize: 13, color: Colors.primary, fontWeight: "500" }}>
                    Lupa Kata Sandi?
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={{ marginBottom: 24 }} />
              )}

              {/* Submit button */}
              <Button
                title="Masuk"
                onPress={handleLogin}
                fullWidth
                loading={signInWithEmail.isPending}
                disabled={signInWithEmail.isPending}
              />

              {/* Divider */}
              {ENABLE_GOOGLE_OAUTH && (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginVertical: 20,
                    }}
                  >
                    <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
                    <Text style={{ marginHorizontal: 12, color: Colors.textMuted, fontSize: 13 }}>
                      atau
                    </Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
                  </View>

                  {/* Google sign in */}
                  <Button
                    title="Masuk dengan Google"
                    onPress={handleGoogle}
                    variant="outlined"
                    fullWidth
                    loading={signInWithGoogle.isPending}
                    disabled={signInWithGoogle.isPending}
                    leftIcon={
                      // Simple "G" letter as a proxy — replace with actual Google SVG logo later
                      <Text style={{ fontWeight: "700", fontSize: 16, color: "#EA4335" }}>
                        G
                      </Text>
                    }
                  />
                </>
              )}
              <View
                style={{
                  marginTop: 20,
                }}
              ></View>

              {/* Register link */}
              {/* <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginTop: 28,
                }}
              >
                <Text style={{ color: Colors.textMuted, fontSize: 14 }}>
                  Belum punya akun?{" "}
                </Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                  <Text
                    style={{ color: Colors.primary, fontWeight: "600", fontSize: 14 }}
                  >
                    Daftar Sekarang
                  </Text>
                </TouchableOpacity>
              </View> */}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Pressable>
  );
}
