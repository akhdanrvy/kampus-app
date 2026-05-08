import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Animated, View, type ViewStyle } from "react-native";

/**
 * usePulseAnimation — returns an Animated.Value cycling between 0.4 and 1
 * to produce the shimmer/pulse effect used by skeleton placeholders.
 */
function usePulseAnimation(): Animated.Value {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return opacity;
}

// ---------------------------------------------------------------------------
// SkeletonBox — rectangular placeholder (for images, cards, avatars)
// ---------------------------------------------------------------------------

interface SkeletonBoxProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * A pulsing rectangular skeleton placeholder.
 * Default color is slate-200 to match the off-white background.
 */
export function SkeletonBox({
  width = "100%",
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonBoxProps) {
  const opacity = usePulseAnimation();

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: "#E2E8F0",
          opacity,
        },
        style,
      ]}
    />
  );
}

// ---------------------------------------------------------------------------
// SkeletonText — line(s) of text placeholder
// ---------------------------------------------------------------------------

interface SkeletonTextProps {
  lines?: number;
  /** Width of the last line (shorter to look natural). Default 60% */
  lastLineWidth?: `${number}%`;
  lineHeight?: number;
  spacing?: number;
}

/**
 * Multi-line text skeleton. The last line is narrower to mimic real paragraphs.
 */
export function SkeletonText({
  lines = 1,
  lastLineWidth = "60%",
  lineHeight = 14,
  spacing = 8,
}: SkeletonTextProps) {
  return (
    <View>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          width={i === lines - 1 && lines > 1 ? lastLineWidth : "100%"}
          height={lineHeight}
          borderRadius={6}
          style={i > 0 ? { marginTop: spacing } : undefined}
        />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// SkeletonCard — composite card skeleton (thumbnail + text lines)
// ---------------------------------------------------------------------------

/**
 * Pre-built skeleton for a horizontal news card layout.
 */
export function SkeletonCard() {
  return (
    <View
      style={{
        flexDirection: "row",
        padding: 12,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        marginBottom: 12,
      }}
    >
      {/* Thumbnail placeholder */}
      <SkeletonBox width={80} height={80} borderRadius={10} />

      {/* Text lines placeholder */}
      <View style={{ flex: 1, marginLeft: 12, justifyContent: "center" }}>
        <SkeletonText lines={3} lastLineWidth="50%" lineHeight={12} spacing={7} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// FadeIn — fades content in when it first mounts (skeleton → content transition)
// ---------------------------------------------------------------------------

interface FadeInProps {
  children: ReactNode;
  /** Duration in ms. Default 300. */
  duration?: number;
  style?: ViewStyle;
}

/**
 * Wraps children in a fade-in animation on mount.
 * Use to transition from skeleton placeholders to real content without a harsh pop.
 */
export function FadeIn({ children, duration = 300, style }: FadeInProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  }, [duration, opacity]);

  return (
    <Animated.View style={[{ opacity }, style]}>
      {children}
    </Animated.View>
  );
}
