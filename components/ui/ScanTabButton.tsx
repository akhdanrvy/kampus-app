import { Pressable, View, Animated } from "react-native";
import { useRef } from "react";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Colors } from "@constants/colors";

// Custom elevated button for the centre QR-scan tab.
// The button protrudes above the tab bar, styled with the primary brand colour.
// Uses Pressable + Animated scale for a spring press-feedback effect.
export function ScanTabButton({
  children,
  onPress,
  onLongPress,
  accessibilityState,
}: BottomTabBarButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  return (
    <Pressable
      onPress={onPress ?? undefined}
      onLongPress={onLongPress ?? undefined}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityState={accessibilityState}
      style={{
        top: -20,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Animated.View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: Colors.primary,
          justifyContent: "center",
          alignItems: "center",
          transform: [{ scale }],
          // Shadow — iOS
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          // Elevation — Android
          elevation: 8,
        }}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
