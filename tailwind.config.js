/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        secondary: "#E1E1D1",
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
  plugins: [],
};
