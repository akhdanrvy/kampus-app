import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  Pressable,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@constants/colors";
import type { Profile } from "../../types/index";

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------

interface ECardProps {
  profile: Profile;
  onPressQR?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 32; // 16px padding each side
const CARD_HEIGHT = 188;

/**
 * Format NIM as a credit-card style number: "20221234 5678" (groups of 4).
 *
 * Design decision: NIM diformat seperti nomor kartu kredit agar E-Card terasa
 * premium dan mudah dibaca. Ini juga membantu mahasiswa menghafal NIM mereka
 * secara visual per-blok, bukan sebagai satu string panjang.
 */
function formatNIM(nim: string): string {
  return nim.replace(/(.{4})/g, "$1 ").trim();
}

/**
 * Build QR code value — JSON payload containing NIM and the rotating token.
 * The timestamp is NOT included in the E-Card QR (unlike attendance QR)
 * so the QR value stays stable and can be cached offline via MMKV.
 */
function buildQRValue(profile: Profile): string {
  return JSON.stringify({
    nim: profile.nim,
    name: profile.full_name,
    token: profile.e_card_qr_token ?? "NO_TOKEN",
    type: "e_card",
  });
}

// ---------------------------------------------------------------------------
// Sub-component: Chip icon (simulates physical card chip)
// ---------------------------------------------------------------------------

function CardChip() {
  return (
    <View
      style={{
        width: 36,
        height: 28,
        borderRadius: 5,
        backgroundColor: Colors.accent, // amber — mimics gold chip
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Horizontal lines to simulate chip contacts */}
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            width: "80%",
            height: 1,
            backgroundColor: "rgba(0,0,0,0.2)",
            marginVertical: 2,
          }}
        />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main ECard component
// ---------------------------------------------------------------------------

/**
 * ECard — digital student ID card styled like a premium credit card.
 *
 * Design decisions:
 * - Dark (#1E293B) background agar kontras tinggi dengan teks putih dan
 *   terasa "premium" seperti kartu debit/kredit dark edition.
 * - QR kecil (56px) di pojok kanan bawah — cukup untuk scan jarak dekat,
 *   tap untuk expand ke fullscreen agar bisa discan dari jarak lebih jauh.
 * - QR value di-cache implisit: karena buildQRValue() hanya bergantung pada
 *   data profil yang sudah ada di MMKV, QR tetap muncul saat offline.
 */
export function ECard({ profile, onPressQR }: ECardProps) {
  const [qrModalVisible, setQRModalVisible] = useState(false);
  const qrValue = buildQRValue(profile);

  const handleQRPress = () => {
    setQRModalVisible(true);
    onPressQR?.();
  };

  return (
    <>
      {/* ── Card body ── */}
      <View
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          borderRadius: 20,
          backgroundColor: Colors.cardDark,
          padding: 20,
          // Subtle inner border for depth
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
          // Shadow
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        {/* ── Row 1: Logo + Chip ── */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: Colors.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="school" size={16} color={Colors.white} />
            </View>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "600", letterSpacing: 1 }}>
              KAMPUSGO
            </Text>
          </View>
          <CardChip />
        </View>

        {/* ── Row 2: NIM formatted as card number ── */}
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text
            style={{
              color: Colors.white,
              fontSize: 18,
              fontWeight: "300",
              letterSpacing: 3,
              fontVariant: ["tabular-nums"],
            }}
          >
            {formatNIM(profile.nim)}
          </Text>
        </View>

        {/* ── Row 3: Name + Prodi + QR ── */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ color: Colors.white, fontSize: 14, fontWeight: "700", letterSpacing: 0.5 }}>
              {profile.full_name.toUpperCase()}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 3 }}>
              {profile.major ?? "Program Studi"}
              {profile.year_entry ? ` · ${profile.year_entry}` : ""}
            </Text>
          </View>

          {/* QR Code — tap to expand */}
          <TouchableOpacity
            onPress={handleQRPress}
            activeOpacity={0.8}
            style={{
              padding: 4,
              backgroundColor: Colors.white,
              borderRadius: 8,
            }}
          >
            {profile.e_card_qr_token ? (
              <QRCode value={qrValue} size={56} />
            ) : (
              // Placeholder when token not yet assigned
              <View
                style={{
                  width: 56,
                  height: 56,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#F1F5F9",
                  borderRadius: 4,
                }}
              >
                <Ionicons name="qr-code-outline" size={32} color={Colors.textMuted} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Fullscreen QR Modal ── */}
      <Modal
        visible={qrModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQRModalVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.85)",
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => setQRModalVisible(false)}
        >
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 24,
              padding: 32,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.textPrimary, marginBottom: 4 }}>
              E-Card Mahasiswa
            </Text>
            <Text style={{ fontSize: 13, color: Colors.textMuted, marginBottom: 20 }}>
              {profile.full_name}
            </Text>

            {profile.e_card_qr_token ? (
              <QRCode value={qrValue} size={220} />
            ) : (
              <View style={{ width: 220, height: 220, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="qr-code-outline" size={80} color={Colors.textMuted} />
                <Text style={{ color: Colors.textMuted, marginTop: 12, textAlign: "center", fontSize: 13 }}>
                  QR belum tersedia.{"\n"}Hubungi admin kampus.
                </Text>
              </View>
            )}

            <Text style={{ marginTop: 20, fontSize: 12, color: Colors.textMuted }}>
              NIM: {profile.nim}
            </Text>
            <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 4 }}>
              Tap di mana saja untuk menutup
            </Text>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
