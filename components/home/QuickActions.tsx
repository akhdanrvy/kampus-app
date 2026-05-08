import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@constants/colors";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

type QuickActionItem = {
  id: string;
  emoji: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
};

const ACTIONS: QuickActionItem[] = [
  {
    id: "jadwal",
    emoji: "📅",
    label: "Jadwal",
    icon: "calendar-outline",
    route: "/(tabs)/akademik",
  },
  {
    id: "ecard",
    emoji: "🪪",
    label: "E-Card",
    icon: "card-outline",
    route: "/(tabs)/profil",
  },
  {
    id: "absensi",
    emoji: "✅",
    label: "Absensi",
    icon: "checkmark-circle-outline",
    route: "/(tabs)/akademik",
  },
  {
    id: "nilai",
    emoji: "📊",
    label: "Nilai",
    icon: "bar-chart-outline",
    route: "/(tabs)/akademik",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * QuickActions — 4-column grid of shortcut buttons.
 * Each item taps to the corresponding tab screen.
 */
export function QuickActions() {
  const router = useRouter();

  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      {ACTIONS.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => router.push(item.route as any)}
          activeOpacity={0.7}
          style={{
            flex: 1,
            backgroundColor: Colors.white,
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: "center",
            justifyContent: "center",
            // Card shadow
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 2,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
          <Text
            style={{
              fontSize: 11,
              color: Colors.textMuted,
              marginTop: 6,
              textAlign: "center",
              fontWeight: "500",
            }}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
