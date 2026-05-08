import { useEffect, useRef } from "react";
import { Animated, Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useNetworkStatus } from "@hooks/useNetworkStatus";

// Animated banner that slides down from the top when the device is offline.
// Re-slides up and hides when connection is restored.
export function OfflineBanner() {
  const { isConnected } = useNetworkStatus();
  const translateY = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isConnected ? -60 : 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [isConnected, translateY]);

  // Always render (for animation), but use pointerEvents to avoid blocking touch when hidden
  return (
    <Animated.View
      style={[styles.banner, { transform: [{ translateY }] }]}
      pointerEvents={isConnected ? "none" : "auto"}
    >
      <Ionicons name="cloud-offline-outline" size={16} color="#854D0E" />
      <Text style={styles.text}>
        Anda sedang offline. Beberapa fitur mungkin tidak tersedia.
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9998,
    backgroundColor: "#FEF9C3",
    borderBottomWidth: 1,
    borderBottomColor: "#FDE047",
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    flex: 1,
    fontSize: 12,
    color: "#854D0E",
    fontWeight: "500",
  },
});
