import { View, Text, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";

import { QRScanner } from "@components/scan/QRScanner";
import { ScanResult } from "@components/scan/ScanResult";
import { AttendanceHistory } from "@components/scan/AttendanceHistory";
import { useScanStore } from "@stores/scanStore";
import { useSubmitAttendance } from "@hooks/useAttendance";
import { attendanceKeys } from "@constants/queryKeys";
import { Colors } from "@constants/colors";

// ---------------------------------------------------------------------------
// ScanScreen — tab tengah QR kehadiran
//
// Kamera di-pause saat tab tidak aktif karena:
// 1. Hemat baterai — sensor kamera adalah salah satu komponen paling boros daya
// 2. Privasi — kamera tidak merekam di background tanpa sepengetahuan user
// 3. Performa — CameraView memblokir GPU resources; pause saat tidak visible
//    agar tab lain bisa render dengan lebih smooth
//
// useFocusEffect (bukan useEffect) dipakai karena React Navigation / Expo Router
// tidak unmount screen saat pindah tab — hanya hide. Sehingga kita perlu hook
// yang dipanggil saat screen benar-benar visible/invisible.
// ---------------------------------------------------------------------------

export default function ScanScreen() {
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const {
    isActive,
    isTorchOn,
    scanStatus,
    lastResult,
    errorMessage,
    setActive,
    toggleTorch,
    setScanStatus,
    setResult,
    setError,
    reset,
  } = useScanStore();

  const submitAttendance = useSubmitAttendance();

  // Activate camera on focus, deactivate on blur
  useFocusEffect(
    useCallback(() => {
      setActive(true);
      // Cleanup: pause camera when navigating away
      return () => {
        setActive(false);
      };
    }, [setActive])
  );

  // Called by QRScanner after successful QR parse
  const handleScan = useCallback(
    async (token: string) => {
      setScanStatus("processing");

      submitAttendance.mutate(token, {
        onSuccess: (data) => {
          setResult(data);
          setScanStatus("success");
          // Haptic success feedback — notifies user even without looking at screen
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
          setScanStatus("error");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        },
      });
    },
    [setScanStatus, submitAttendance, setResult, setError]
  );

  // Close modal and re-enable scanner
  const handleCloseResult = useCallback(() => {
    reset();
  }, [reset]);

  // Pull-to-refresh: refetch today's attendance history
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: attendanceKeys.today() });
    setRefreshing(false);
  }, [qc]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan Kehadiran</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
          />
        }
      >
        {/* Camera scanner */}
        <QRScanner
          onScan={handleScan}
          isActive={isActive && scanStatus === "idle"}
          isTorchOn={isTorchOn}
          onToggleTorch={toggleTorch}
        />

        {/* Today's attendance records */}
        <AttendanceHistory />
      </ScrollView>

      {/* Result modal — renders on top of everything */}
      <ScanResult
        status={scanStatus}
        result={lastResult}
        errorMessage={errorMessage}
        onClose={handleCloseResult}
      />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
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
});
