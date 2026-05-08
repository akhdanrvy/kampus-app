import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AnimatedTabIconProps {
  name: string;
  color: string;
  size: number;
  focused: boolean;
}

// Wraps an Ionicons icon with a spring scale animation when the tab is focused.
// Scale goes 1.0 → 1.18 on focus, and smoothly back to 1.0 on blur.
export function AnimatedTabIcon({ name, color, size, focused }: AnimatedTabIconProps) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.18 : 1,
      useNativeDriver: true,
      damping: 14,
      stiffness: 180,
    }).start();
  }, [focused, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Ionicons name={name as any} size={size} color={color} />
    </Animated.View>
  );
}
