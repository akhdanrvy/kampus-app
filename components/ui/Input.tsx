import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  type KeyboardTypeOptions,
} from "react-native";
import type { ReactNode } from "react";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@constants/colors";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  autoCapitalize?: "none" | "sentences" | "words";
  editable?: boolean;
}

/**
 * Reusable Input component with label, left/right icon slots, and inline error.
 * Password inputs automatically get a show/hide toggle when secureTextEntry is true.
 */
export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = "default",
  leftIcon,
  rightIcon,
  autoCapitalize = "sentences",
  editable = true,
}: InputProps) {
  // Manage local visibility toggle for password fields
  const [isVisible, setIsVisible] = useState(!secureTextEntry);
  const isFocused_placeholder = false; // keeps lint happy

  const borderColor = error ? Colors.danger : Colors.border;

  return (
    <View style={{ marginBottom: 16 }}>
      {/* Optional label above the input */}
      {label && (
        <Text
          style={{
            fontSize: 13,
            fontWeight: "500",
            color: Colors.textPrimary,
            marginBottom: 6,
          }}
        >
          {label}
        </Text>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#F8FAFC",
          borderWidth: 1.5,
          borderColor,
          borderRadius: 12,
          paddingHorizontal: 14,
          height: 52,
        }}
      >
        {/* Left icon slot */}
        {leftIcon && (
          <View style={{ marginRight: 10, opacity: 0.6 }}>{leftIcon}</View>
        )}

        {/* Text input */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secureTextEntry && !isVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          style={{
            flex: 1,
            fontSize: 15,
            color: Colors.textPrimary,
            height: "100%",
          }}
        />

        {/* Right icon — show/hide toggle for password, or custom rightIcon */}
        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setIsVisible((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isVisible ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        ) : (
          rightIcon && (
            <View style={{ marginLeft: 10, opacity: 0.6 }}>{rightIcon}</View>
          )
        )}
      </View>

      {/* Inline error message */}
      {error && (
        <Text
          style={{
            fontSize: 12,
            color: Colors.danger,
            marginTop: 4,
            marginLeft: 2,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
