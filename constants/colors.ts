// Design system color palette for KampusGo
// Keep in sync with tailwind.config.js custom colors
export const Colors = {
  // Brand colors
  primary: "#1E3A5F",       // Navy blue — main brand color
  primaryLight: "#2563EB",  // Blue — accent / secondary actions
  accent: "#F59E0B",        // Amber — CTA, highlights, important badges

  // Backgrounds
  background: "#F8FAFC",    // Off-white — screen background
  cardDark: "#1E293B",      // Dark slate — E-Card background

  // Text
  textPrimary: "#0F172A",   // Near-black — main body text
  textMuted: "#64748B",     // Slate-500 — secondary / placeholder text

  // Status colors
  success: "#10B981",       // Emerald — success states
  danger: "#EF4444",        // Red — error / destructive states

  // Neutrals
  white: "#FFFFFF",
  border: "#E2E8F0",        // Slate-200 — dividers, card borders

  // Badge colors — background + text pairs per category
  badgeAkademik: "#DBEAFE",       // blue-100
  badgeAkademikText: "#1E40AF",   // blue-800
  badgeKampus: "#D1FAE5",         // green-100
  badgeKampusText: "#065F46",     // green-800
  badgeNasional: "#FEF3C7",       // amber-100
  badgeNasionalText: "#92400E",   // amber-800
  badgeUmum: "#F1F5F9",           // slate-100
  badgeUmumText: "#475569",       // slate-600
} as const;

export type ColorKey = keyof typeof Colors;
