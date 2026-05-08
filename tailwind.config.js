/** @type {import('tailwindcss').Config} */
module.exports = {
  // Use NativeWind preset for React Native support
  presets: [require("nativewind/preset")],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom design system colors — matches constants/colors.ts
        primary: "#1E3A5F",
        "primary-light": "#2563EB",
        accent: "#F59E0B",
        "card-dark": "#1E293B",
        "text-primary": "#0F172A",
        "text-muted": "#64748B",
      },
    },
  },
  plugins: [],
};
