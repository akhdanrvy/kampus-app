import { View, Text, Modal, Pressable, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@constants/colors";
import type { Profile } from "../../types/index";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ECardFullProps {
  profile: Profile;
  visible: boolean;
  onClose: () => void;
}

const { width: SW } = Dimensions.get("window");
const CARD_W = SW - 48;

function buildQRValue(profile: Profile): string {
  return JSON.stringify({
    nim: profile.nim,
    name: profile.full_name,
    token: profile.e_card_qr_token ?? "NO_TOKEN",
    type: "e_card",
  });
}

// ---------------------------------------------------------------------------
// ECardFull — fullscreen modal showing a large, scannable E-Card QR code.
//
// Dipisah dari ECard komponen utama agar ECard tetap ringan (<150 baris)
// dan fullscreen view bisa memiliki QR 200×200 yang lebih mudah di-scan
// oleh perangkat dosen untuk presensi manual.
// ---------------------------------------------------------------------------

export function ECardFull({ profile, visible, onClose }: ECardFullProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Tap outside to close */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Card — Pressable stops propagation so tap inside doesn't close */}
        <Pressable style={styles.card} onPress={() => {}}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.university}>KampusGo</Text>
              <Text style={styles.cardType}>Kartu Mahasiswa Digital</Text>
            </View>
            <TouchableClose onPress={onClose} />
          </View>

          {/* QR code — 200×200 for easy scanning */}
          <View style={styles.qrContainer}>
            <QRCode
              value={buildQRValue(profile)}
              size={200}
              color={Colors.cardDark}
              backgroundColor={Colors.white}
            />
          </View>

          {/* Student info */}
          <View style={styles.infoBlock}>
            <Text style={styles.nim}>
              {profile.nim ? profile.nim.replace(/(.{4})/g, "$1 ").trim() : "— — — —"}
            </Text>
            <Text style={styles.name}>{profile.full_name}</Text>
            {profile.major && (
              <Text style={styles.major}>{profile.major}</Text>
            )}
          </View>

          {/* Instruction */}
          <Text style={styles.instruction}>
            Tunjukkan QR ini ke dosen untuk presensi manual
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Small X button in the corner
function TouchableClose({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.closeBtn}>
      <Ionicons name="close" size={20} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: CARD_W,
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 16,
  },
  cardHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  university: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.primary,
  },
  cardType: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoBlock: {
    alignItems: "center",
    gap: 4,
  },
  nim: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.cardDark,
    letterSpacing: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  major: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  instruction: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "center",
    paddingTop: 4,
    paddingBottom: 4,
  },
});
