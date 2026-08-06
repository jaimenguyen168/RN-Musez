import { useTheme } from "@/provider/ThemeProvider";

// "Organic" design system — cream ground, terracotta + sage accents, soft
// radii. Scoped to the Discovery and Museum Detail screens (see the Fable
// design project "Musez Discovery"), not the app-wide theme.
export interface OrganicPalette {
  bg: string;
  surface: string;
  surfaceAlt: string; // textarea / inset fields
  text: string;
  textMuted: string;
  textFaint: string;
  accent: string; // terracotta — buttons, kickers, links
  accentStrong: string; // deeper terracotta step, for text on the ground
  accentSoft: string; // tinted background (initials tiles, badges)
  accent2: string; // sage — avatar tiles, secondary accents
  accent2Soft: string;
  divider: string;
  placeholderA: string; // photo placeholder stripes
  placeholderB: string;
  statusOpen: string;
  statusClosed: string;
  shadow: string;
  overlay: string; // sheet/modal backdrop
}

const light: OrganicPalette = {
  bg: "#f5ead8",
  surface: "#ebddc5",
  surfaceAlt: "#f9f4ed",
  text: "#201e1d",
  textMuted: "#645c50",
  textFaint: "#a19786",
  accent: "#c67139",
  accentStrong: "#8c491a",
  accentSoft: "#ffe1d0",
  accent2: "#7a8a5e",
  accent2Soft: "#e1eecc",
  divider: "rgba(32,30,29,0.14)",
  placeholderA: "#eee7db",
  placeholderB: "#dcd3c4",
  statusOpen: "#56633f",
  statusClosed: "#8c491a",
  shadow: "#2e2b25",
  overlay: "rgba(32,30,29,0.42)",
};

const dark: OrganicPalette = {
  bg: "#26231f",
  surface: "#35312a",
  surfaceAlt: "#26231f",
  text: "#f5ead8",
  textMuted: "#c0b6a5",
  textFaint: "#a19786",
  accent: "#f6a06b",
  accentStrong: "#ffc6a5",
  accentSoft: "#46352a",
  accent2: "#ccdbb2",
  accent2Soft: "#3d472b",
  divider: "rgba(245,234,216,0.12)",
  placeholderA: "#3d3830",
  placeholderB: "#464036",
  statusOpen: "#aebf92",
  statusClosed: "#ffc6a5",
  shadow: "#000000",
  overlay: "rgba(0,0,0,0.55)",
};

export const organicTheme = { light, dark };

export const useOrganicTheme = (): OrganicPalette => {
  const { isDark } = useTheme();
  return isDark ? dark : light;
};
