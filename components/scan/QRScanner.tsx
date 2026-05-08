import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { useRef, useEffect, useCallback } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@constants/colors";
import type { QRPayload } from "../../stores/scanStore";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCAN_BOX_SIZE = SCREEN_WIDTH * 0.65;
// Double-scan guard: ignore new scans for this many ms after a successful one
const SCAN_COOLDOWN_MS = 2000;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface QRScannerProps {
  onScan: (token: string) => void;
  isActive: boolean;
  isTorchOn: boolean;
  onToggleTorch: () => void;
}

// ---------------------------------------------------------------------------
// PermissionScreen — shown when camera permission is denied or not yet granted
// ---------------------------------------------------------------------------

function PermissionScreen({
  onRequest,
  isDenied,
}: {
  onRequest: () => void;
  isDenied: boolean;
}) {
  return (
    <View style={styles.permissionContainer}>
      <Ionicons name="camera-outline" size={64} color={Colors.textMuted} />
      <Text style={styles.permissionTitle}>Izin Kamera Diperlukan</Text>
      <Text style={styles.permissionSubtitle}>
        Aplikasi membutuhkan akses kamera untuk scan QR kehadiran.
      </Text>
      <TouchableOpacity onPress={onRequest} style={styles.permissionBtn}>
        <Text style={styles.permissionBtnText}>Berikan Izin Kamera</Text>
      </TouchableOpacity>
      {isDenied && (
        <TouchableOpacity
          onPress={() => Linking.openSettings()}
          style={[styles.permissionBtn, styles.settingsBtn]}
        >
          <Text style={[styles.permissionBtnText, { color: Colors.primary }]}>
            Buka Pengaturan
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// ScanLineAnimation — vertical line that bounces inside the scan box
// ---------------------------------------------------------------------------

function ScanLine() {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: SCAN_BOX_SIZE - 4,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [translateY]);

  return (
    <Animated.View
      style={[styles.scanLine, { transform: [{ translateY }] }]}
    />
  );
}

// ---------------------------------------------------------------------------
// QRScanner
//
// Menggunakan expo-camera CameraView dengan onBarcodeScanned callback.
//
// Mencegah double-scan dengan isProcessingRef (useRef boolean):
// - Saat QR pertama berhasil di-scan, flag diset true
// - onBarcodeScanned return awal jika flag true
// - Setelah SCAN_COOLDOWN_MS, flag di-reset false
// Menggunakan useRef (bukan useState) karena perubahan flag tidak perlu
// trigger re-render — hanya butuh nilai terbaru saat callback dipanggil.
// ---------------------------------------------------------------------------

export function QRScanner({ onScan, isActive, isTorchOn, onToggleTorch }: QRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  // Double-scan guard — useRef agar tidak trigger re-render
  const isProcessingRef = useRef(false);

  const handleBarcode = useCallback(
    ({ data }: { data: string }) => {
      // Guard: ignore if already processing or scanner not active
      if (isProcessingRef.current || !isActive) return;

      // Try to parse the JSON payload from the QR code
      let payload: QRPayload;
      try {
        payload = JSON.parse(data) as QRPayload;
      } catch {
        // Not a valid KampusGo QR — silently ignore (could be any QR code)
        return;
      }

      // Validate required fields
      if (!payload.session_id || !payload.token) return;

      // Lock against further scans for SCAN_COOLDOWN_MS
      isProcessingRef.current = true;
      onScan(payload.token);

      setTimeout(() => {
        isProcessingRef.current = false;
      }, SCAN_COOLDOWN_MS);
    },
    [isActive, onScan]
  );

  // Permission not yet determined
  if (!permission) {
    return <View style={styles.camera} />;
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <PermissionScreen
        onRequest={requestPermission}
        isDenied={!permission.canAskAgain}
      />
    );
  }

  return (
    <View style={styles.camera}>
      {/* Live camera feed */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={isTorchOn}
        onBarcodeScanned={isActive ? handleBarcode : undefined}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      />

      {/* Semi-transparent overlay with a transparent "cutout" in the center */}
      {/* Top overlay */}
      <View style={[styles.overlay, styles.overlayTop]} />
      {/* Middle row: left bar + scan box + right bar */}
      <View style={styles.overlayMiddle}>
        <View style={styles.overlaySide} />

        {/* Scan box with corner markers */}
        <View style={styles.scanBox}>
          {/* Corner markers */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          {/* Animated scan line */}
          <ScanLine />
        </View>

        <View style={styles.overlaySide} />
      </View>
      {/* Bottom overlay */}
      <View style={[styles.overlay, styles.overlayBottom]}>
        <Text style={styles.instructionText}>
          Arahkan kamera ke QR Code kehadiran
        </Text>

        {/* Torch toggle button */}
        <TouchableOpacity onPress={onToggleTorch} style={styles.torchButton}>
          <Ionicons
            name={isTorchOn ? "flash" : "flash-outline"}
            size={22}
            color={isTorchOn ? Colors.accent : Colors.white}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const OVERLAY_COLOR = "rgba(0,0,0,0.62)";
const CORNER_SIZE = 22;
const CORNER_THICKNESS = 3;
const CORNER_COLOR = Colors.accent;

const styles = StyleSheet.create({
  camera: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#000",
    overflow: "hidden",
  },

  // --- Overlay ---
  overlay: {
    backgroundColor: OVERLAY_COLOR,
  },
  overlayTop: {
    flex: 1,
  },
  overlayMiddle: {
    flexDirection: "row",
    height: SCAN_BOX_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: OVERLAY_COLOR,
  },
  overlayBottom: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  // --- Scan box ---
  scanBox: {
    width: SCAN_BOX_SIZE,
    height: SCAN_BOX_SIZE,
    overflow: "hidden",
  },

  // --- Corner markers ---
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: CORNER_COLOR,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },

  // --- Scan line ---
  scanLine: {
    position: "absolute",
    left: 4,
    right: 4,
    height: 2,
    backgroundColor: Colors.accent,
    opacity: 0.9,
    borderRadius: 1,
  },

  // --- Bottom bar ---
  instructionText: {
    flex: 1,
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    textAlign: "left",
  },
  torchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  // --- Permission screen ---
  permissionContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.white,
    textAlign: "center",
    marginTop: 8,
  },
  permissionSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 20,
  },
  permissionBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    backgroundColor: Colors.primary,
    borderRadius: 999,
  },
  settingsBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  permissionBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white,
  },
});
