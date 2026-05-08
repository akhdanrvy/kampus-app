import { useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Animated,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useUIStore, type Toast } from "@stores/uiStore";
import { Colors } from "@constants/colors";

// ---------------------------------------------------------------------------
// Single animated toast item
// ---------------------------------------------------------------------------

const ICON_MAP: Record<Toast["type"], { name: string; color: string; bg: string }> = {
  success: { name: "checkmark-circle", color: "#10B981", bg: "#ECFDF5" },
  error: { name: "close-circle", color: "#EF4444", bg: "#FEF2F2" },
  info: { name: "information-circle", color: "#2563EB", bg: "#EFF6FF" },
};

function ToastItem({ toast }: { toast: Toast }) {
  const hideToast = useUIStore((s) => s.hideToast);
  const translateY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 80, duration: 200, useNativeDriver: true }),
    ]).start(() => hideToast(toast.id));
  }, [hideToast, opacity, toast.id, translateY]);

  useEffect(() => {
    // Slide up + fade in
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 160 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    // Auto-dismiss
    const timer = setTimeout(dismiss, toast.duration ?? 3000);
    return () => clearTimeout(timer);
  }, []);

  const meta = ICON_MAP[toast.type];

  return (
    <Animated.View
      style={[
        styles.toastWrap,
        { backgroundColor: meta.bg, opacity, transform: [{ translateY }] },
      ]}
    >
      <Ionicons name={meta.name as any} size={20} color={meta.color} />
      <Text style={[styles.toastText, { color: Colors.textPrimary }]} numberOfLines={3}>
        {toast.message}
      </Text>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Container — renders all active toasts
// Placed at the root layout; position absolute above the tab bar
// ---------------------------------------------------------------------------

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 90, // clears the tab bar
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  } as ViewStyle,
  toastWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
});
