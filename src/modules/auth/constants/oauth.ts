import { OAuthConfig, OAuthProvider } from "@/modules/auth/types/oauth";
import { icons } from "@/constants/icons";

export const oauthConfigs: Record<OAuthProvider, OAuthConfig> = {
  google: {
    strategy: "oauth_google",
    ionIcon: "logo-google",
    iconColor: "#4285F4",
    backgroundColor: "bg-white",
    textColor: "text-gray-900",
    borderColor: "border-gray-100",
    icon: icons.googleIcon,
  },
  apple: {
    strategy: "oauth_apple",
    ionIcon: "logo-apple",
    iconColor: "#FFFFFF",
    backgroundColor: "bg-black",
    textColor: "text-white",
    borderColor: "border-black",
  },
};
