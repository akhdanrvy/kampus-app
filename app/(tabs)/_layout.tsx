import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@constants/colors";
import { ScanTabButton } from "@components/ui/ScanTabButton";
import { AnimatedTabIcon } from "@components/ui/AnimatedTabIcon";

// Bottom tab navigator with 5 tabs.
// The centre tab (SCAN) is elevated above the bar using a custom button component.
// Regular tab icons use AnimatedTabIcon to scale up when focused.
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="beranda"
        options={{
          title: "Beranda",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="home-outline" color={color} size={size} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="berita/index"
        options={{
          title: "Berita",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="newspaper-outline" color={color} size={size} focused={focused} />
          ),
        }}
      />

      {/* Centre elevated scan tab */}
      <Tabs.Screen
        name="scan"
        options={{
          title: "SCAN",
          tabBarButton: (props) => <ScanTabButton {...props} />,
          tabBarIcon: () => (
            // Icon is always white since the button background is primary colour
            <Ionicons name="qr-code-outline" size={26} color={Colors.white} />
          ),
          tabBarLabel: () => null,
        }}
      />

      <Tabs.Screen
        name="akademik/index"
        options={{
          title: "Akademik",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="book-outline" color={color} size={size} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="profil/index"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="person-outline" color={color} size={size} focused={focused} />
          ),
        }}
      />

      {/* Hidden screens — not shown in tab bar */}
      <Tabs.Screen name="berita/[id]" options={{ href: null }} />
      <Tabs.Screen name="profil/edit" options={{ href: null }} />
    </Tabs>
  );
}
