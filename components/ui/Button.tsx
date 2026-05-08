import {
  Pressable,
  Text,
  ActivityIndicator,
  View,
  Animated,
  type GestureResponderEvent,
} from "react-native";
import { useRef } from "react";
import type { ReactNode } from "react";
import { Colors } from "@constants/colors";

interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: "primary" | "outlined" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

// Size mappings for padding and font size
const SIZE_STYLES = {
  sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 13 },
  md: { paddingVertical: 14, paddingHorizontal: 20, fontSize: 15 },
  lg: { paddingVertical: 17, paddingHorizontal: 24, fontSize: 16 },
} as const;

/**
 * Reusable Button component.
 * Supports primary (filled), outlined (border), and ghost (text-only) variants.
 * Shows an ActivityIndicator in place of the title while loading.
 */
export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  leftIcon,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const sz = SIZE_STYLES[size];
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  // Determine background color based on variant and state
  const getBg = () => {
    if (isDisabled && variant === "primary") return "#93A3B8";
    if (variant === "primary") return Colors.primary;
    return "transparent";
  };

  // Determine border style for outlined variant
  const getBorder = () => {
    if (variant === "outlined") return { borderWidth: 1.5, borderColor: Colors.primary };
    return {};
  };

  // Determine text color
  const getTextColor = () => {
    if (variant === "primary") return Colors.white;
    if (variant === "outlined") return isDisabled ? Colors.textMuted : Colors.primary;
    return isDisabled ? Colors.textMuted : Colors.primary;
  };

  return (
    <Animated.View style={{ transform: [{ scale }], width: fullWidth ? "100%" : undefined }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDisabled}
        style={[{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 12,
          backgroundColor: getBg(),
          paddingVertical: sz.paddingVertical,
          paddingHorizontal: sz.paddingHorizontal,
          opacity: isDisabled && variant !== "primary" ? 0.5 : 1,
        }, getBorder()]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === "primary" ? Colors.white : Colors.primary}
          />
        ) : (
          <>
            {leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}
            <Text
              style={{
                fontSize: sz.fontSize,
                fontWeight: "600",
                color: getTextColor(),
                letterSpacing: 0.2,
              }}
            >
              {title}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}
