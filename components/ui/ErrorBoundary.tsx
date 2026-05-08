import { Component, type ReactNode } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@constants/colors";

interface Props {
  children: ReactNode;
  /** Optional custom fallback. If omitted, the default UI is used. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

// React class-based Error Boundary — catches unhandled JS errors in the
// component tree below it and shows a friendly fallback instead of crashing.
// Must be a class component; functional components cannot catch errors.
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error) {
    // In production, send to crash-reporting service (e.g. Sentry)
    console.error("[ErrorBoundary]", error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View style={styles.container}>
          <Ionicons name="warning-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.title}>Terjadi Kesalahan</Text>
          <Text style={styles.message} numberOfLines={4}>
            {this.state.errorMessage || "Terjadi kesalahan yang tidak terduga."}
          </Text>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
            onPress={this.handleRetry}
          >
            <Ionicons name="refresh-outline" size={16} color={Colors.white} />
            <Text style={styles.buttonText}>Muat Ulang</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: Colors.background,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: 8,
  },
  message: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
});
