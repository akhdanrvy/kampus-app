import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from "react-native";
import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@constants/colors";
import { formatDate, formatTime } from "@lib/utils";
import type { ScanStatus, AttendanceResult } from "../../stores/scanStore";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ScanResultProps {
  status: ScanStatus;
  result: AttendanceResult | null;
  errorMessage: string | null;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// ScanResult
//
// Modal yang muncul setelah scan — tiga state berbeda:
// - processing: spinner saat menunggu respons Supabase
// - success: centang besar + detail sesi kehadiran
// - error: ikon X + pesan error spesifik
//
// Animasi scale-up saat modal muncul menggunakan react-native-reanimated
// withSpring agar terasa "bouncy" dan responsif.
// ---------------------------------------------------------------------------

export function ScanResult({ status, result, errorMessage, onClose }: ScanResultProps) {
  const isVisible = status === "processing" || status === "success" || status === "error";

  // Scale animation: starts small, springs to full size when visible
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, damping: 14, stiffness: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0.8);
      opacity.setValue(0);
    }
  }, [isVisible, scale, opacity]);

  const cardStyle = { transform: [{ scale }], opacity };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={status !== "processing" ? onClose : undefined}
    >
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, cardStyle]}>
          {/* ── Processing state ── */}
          {status === "processing" && (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.processingText}>Memverifikasi kehadiran...</Text>
            </View>
          )}

          {/* ── Success state ── */}
          {status === "success" && result && (
            <View style={styles.stateContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="checkmark" size={40} color={Colors.white} />
              </View>
              <Text style={styles.successTitle}>Kehadiran Tercatat!</Text>

              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Mata Kuliah</Text>
                <Text style={styles.detailValue}>
                  {result.session.course_name ?? result.session.title}
                </Text>

                <Text style={[styles.detailLabel, { marginTop: 10 }]}>Tanggal</Text>
                <Text style={styles.detailValue}>
                  {formatDate(result.record.scanned_at)}
                </Text>

                <Text style={[styles.detailLabel, { marginTop: 10 }]}>Waktu Scan</Text>
                <Text style={styles.detailValue}>
                  {formatTime(result.record.scanned_at)} WIB
                </Text>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>
                    {result.record.status === "present" ? "✓ Hadir" : "⚠ Terlambat"}
                  </Text>
                </View>
              </View>

              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>Tutup</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Error state ── */}
          {status === "error" && (
            <View style={styles.stateContainer}>
              <View style={[styles.iconCircle, styles.iconCircleError]}>
                <Ionicons name="close" size={40} color={Colors.white} />
              </View>
              <Text style={styles.errorTitle}>Gagal Mencatat Kehadiran</Text>
              <Text style={styles.errorMessage}>
                {errorMessage ?? "Terjadi kesalahan tidak diketahui."}
              </Text>
              <TouchableOpacity onPress={onClose} style={[styles.closeBtn, styles.retryBtn]}>
                <Text style={styles.closeBtnText}>Coba Lagi</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  stateContainer: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  // --- Icon ---
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  iconCircleError: {
    backgroundColor: Colors.danger,
  },
  // --- Processing ---
  processingText: {
    fontSize: 15,
    color: Colors.textMuted,
    marginTop: 12,
  },
  // --- Success ---
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  detailBox: {
    width: "100%",
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: 2,
  },
  statusBadge: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#065F46",
  },
  // --- Error ---
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  // --- Buttons ---
  closeBtn: {
    marginTop: 16,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  retryBtn: {
    backgroundColor: Colors.danger,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.white,
  },
});
