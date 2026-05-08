import { View, Text } from "react-native";
import { Colors } from "@constants/colors";
import type { NewsCategory } from "../../types/index";

interface BadgeProps {
  category: NewsCategory | string;
  size?: "sm" | "md";
}

// Color config per news category — matches design system spec
const CATEGORY_CONFIG: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  akademik: {
    bg: Colors.badgeAkademik,
    text: Colors.badgeAkademikText,
    label: "Akademik",
  },
  kampus: {
    bg: Colors.badgeKampus,
    text: Colors.badgeKampusText,
    label: "Kampus",
  },
  nasional: {
    bg: Colors.badgeNasional,
    text: Colors.badgeNasionalText,
    label: "Nasional",
  },
  umum: {
    bg: Colors.badgeUmum,
    text: Colors.badgeUmumText,
    label: "Umum",
  },
};

/**
 * Badge — coloured pill label for news categories.
 * Falls back to "Umum" styling for unknown category values.
 */
export function Badge({ category, size = "sm" }: BadgeProps) {
  const config = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.umum;
  const fontSize = size === "sm" ? 10 : 12;
  const px = size === "sm" ? 8 : 10;
  const py = size === "sm" ? 3 : 5;

  return (
    <View
      style={{
        backgroundColor: config.bg,
        borderRadius: 20,
        paddingHorizontal: px,
        paddingVertical: py,
        alignSelf: "flex-start",
      }}
    >
      <Text
        style={{
          fontSize,
          fontWeight: "600",
          color: config.text,
          textTransform: "capitalize",
        }}
      >
        {config.label}
      </Text>
    </View>
  );
}
