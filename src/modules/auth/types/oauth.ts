import { Ionicons } from "@expo/vector-icons";

export type OAuthProvider = "google" | "apple";

export interface OAuthConfig {
  strategy: "oauth_google" | "oauth_apple";
  icon?: any;
  ionIcon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
}
