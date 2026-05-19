import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@constants/colors";
import { ScanTabButton } from "@components/ui/ScanTabButton";
import { AnimatedTabIcon } from "@components/ui/AnimatedTabIcon";

export default function TabsLayout() {
  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        animation: "fade",
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
            <AnimatedTabIcon
              name="home-outline"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="berita"
        options={{
          title: "Berita",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name="newspaper-outline"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="scan"
        options={{
          title: "SCAN",
          tabBarButton: (props) => <ScanTabButton {...props} />,
          tabBarIcon: () => (
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
            <AnimatedTabIcon
              name="book-outline"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name="person-outline"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
