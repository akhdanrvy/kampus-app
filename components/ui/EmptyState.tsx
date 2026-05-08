import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@constants/colors";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  emoji?: string;
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
}

/**
 * Generic empty state — shown when a list or section has no data.
 * Accepts either an Ionicons name or an emoji as the illustration.
 */
export function EmptyState({
  icon,
  emoji,
  title,
  subtitle,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
        paddingHorizontal: 32,
      }}
    >
      {/* Illustration */}
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: "#EFF6FF",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        {emoji ? (
          <Text style={{ fontSize: 32 }}>{emoji}</Text>
        ) : icon ? (
          <Ionicons name={icon} size={36} color={Colors.primaryLight} />
        ) : null}
      </View>

      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: Colors.textPrimary,
          textAlign: "center",
          marginBottom: 6,
        }}
      >
        {title}
      </Text>

      {subtitle && (
        <Text
          style={{
            fontSize: 13,
            color: Colors.textMuted,
            textAlign: "center",
            lineHeight: 18,
            marginBottom: 20,
          }}
        >
          {subtitle}
        </Text>
      )}

      {actionText && onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 24,
            backgroundColor: Colors.primary,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: Colors.white, fontWeight: "600", fontSize: 14 }}>
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
