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
      };
      addUtilities(newUtilities);
    },
  ],
};
