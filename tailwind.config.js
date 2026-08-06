/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF9900",
          600: "#FFD79B",
        },
        // App-specific semantic colors
        app: {
          bg: "#f9fafb",
          card: "#ffffff",
          border: "#e5e7eb",
        },
        text: {
          main: "#111827",
          secondary: "#6b7280",
          muted: "#9ca3af",
        },
      },
      fontFamily: {
        // 👇 This makes Manrope the default for "font-sans"
        sans: ["Manrope_400Regular"],
        extralight: ["Manrope_200ExtraLight"],
        light: ["Manrope_300Light"],
        medium: ["Manrope_500Medium"],
        semibold: ["Manrope_600SemiBold"],
        bold: ["Manrope_700Bold"],
        extrabold: ["Manrope_800ExtraBold"],
        // "Organic" design system — Discovery + Museum Detail screens
        heading: ["Caprasimo_400Regular"],
        figtree: ["Figtree_400Regular"],
        "figtree-medium": ["Figtree_500Medium"],
        "figtree-semibold": ["Figtree_600SemiBold"],
        "figtree-bold": ["Figtree_700Bold"],
        "figtree-extrabold": ["Figtree_800ExtraBold"],
      },
    },
  },
  plugins: [
    function ({ addUtilities, theme }) {
      const newUtilities = {
        ".bg-app": {
          backgroundColor: "#FAFAFA",
          "@media (prefers-color-scheme: dark)": {
            backgroundColor: theme("colors.gray.900"),
          },
        },
        ".bg-card": {
          backgroundColor: theme("colors.white"),
          "@media (prefers-color-scheme: dark)": {
            backgroundColor: theme("colors.gray.800"),
          },
        },
        ".bg-surface": {
          backgroundColor: theme("colors.gray.100"),
          "@media (prefers-color-scheme: dark)": {
            backgroundColor: theme("colors.gray.700"),
          },
        },
        ".text-main": {
          color: theme("colors.gray.900"),
          "@media (prefers-color-scheme: dark)": {
            color: theme("colors.white"),
          },
        },
        ".text-secondary": {
          color: theme("colors.gray.600"),
          "@media (prefers-color-scheme: dark)": {
            color: theme("colors.gray.400"),
          },
        },
        ".border-soft": {
          borderColor: theme("colors.gray.200"),
          "@media (prefers-color-scheme: dark)": {
            borderColor: theme("colors.gray.700"),
          },
        },
        ".bg-divider": {
          backgroundColor: theme("colors.gray.200"),
          "@media (prefers-color-scheme: dark)": {
            backgroundColor: theme("colors.gray.700"),
          },
        },
        // "Organic" design system — Discovery + Museum Detail screens.
        // Same auto-dark-mode-aware pattern as the tokens above.
        ".bg-organic": {
          backgroundColor: "#f5ead8",
          "@media (prefers-color-scheme: dark)": { backgroundColor: "#26231f" },
        },
        ".bg-organic-surface": {
          backgroundColor: "#ebddc5",
          "@media (prefers-color-scheme: dark)": { backgroundColor: "#35312a" },
        },
        ".bg-organic-surface-alt": {
          backgroundColor: "#f9f4ed",
          "@media (prefers-color-scheme: dark)": { backgroundColor: "#26231f" },
        },
        ".text-organic": {
          color: "#201e1d",
          "@media (prefers-color-scheme: dark)": { color: "#f5ead8" },
        },
        ".text-organic-muted": {
          color: "#645c50",
          "@media (prefers-color-scheme: dark)": { color: "#c0b6a5" },
        },
        ".text-organic-faint": {
          color: "#a19786",
          "@media (prefers-color-scheme: dark)": { color: "#a19786" },
        },
        ".bg-organic-faint": {
          backgroundColor: "rgba(32,30,29,0.25)",
          "@media (prefers-color-scheme: dark)": { backgroundColor: "rgba(245,234,216,0.35)" },
        },
        ".text-organic-accent": {
          color: "#c67139",
          "@media (prefers-color-scheme: dark)": { color: "#f6a06b" },
        },
        ".bg-organic-accent": {
          backgroundColor: "#c67139",
          "@media (prefers-color-scheme: dark)": { backgroundColor: "#f6a06b" },
        },
        ".text-organic-accent-strong": {
          color: "#8c491a",
          "@media (prefers-color-scheme: dark)": { color: "#ffc6a5" },
        },
        ".bg-organic-accent-soft": {
          backgroundColor: "#ffe1d0",
          "@media (prefers-color-scheme: dark)": { backgroundColor: "#46352a" },
        },
        ".text-organic-accent-soft": {
          color: "#ffe1d0",
          "@media (prefers-color-scheme: dark)": { color: "#402310" },
        },
        ".text-organic-accent2": {
          color: "#7a8a5e",
          "@media (prefers-color-scheme: dark)": { color: "#ccdbb2" },
        },
        ".bg-organic-accent2-soft": {
          backgroundColor: "#e1eecc",
          "@media (prefers-color-scheme: dark)": { backgroundColor: "#3d472b" },
        },
        ".border-organic-divider": {
          borderColor: "rgba(32,30,29,0.14)",
          "@media (prefers-color-scheme: dark)": { borderColor: "rgba(245,234,216,0.12)" },
        },
        ".bg-organic-placeholder-a": {
          backgroundColor: "#eee7db",
          "@media (prefers-color-scheme: dark)": { backgroundColor: "#3d3830" },
        },
        ".text-organic-status-open": {
          color: "#56633f",
          "@media (prefers-color-scheme: dark)": { color: "#aebf92" },
        },
        ".text-organic-status-closed": {
          color: "#8c491a",
          "@media (prefers-color-scheme: dark)": { color: "#ffc6a5" },
        },
        ".bg-organic-overlay": {
          backgroundColor: "rgba(32,30,29,0.42)",
          "@media (prefers-color-scheme: dark)": { backgroundColor: "rgba(0,0,0,0.55)" },
        },
        // Translucent circular backdrop for icon buttons sitting over a photo
        ".bg-organic-photo-btn": {
          backgroundColor: "rgba(249,244,237,0.94)",
          "@media (prefers-color-scheme: dark)": { backgroundColor: "rgba(38,35,31,0.85)" },
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
