import React, { useCallback, useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useSSO } from "@clerk/clerk-expo";
import { View, Platform, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OAuthProvider } from "@/modules/auth/types/oauth";
import { oauthConfigs } from "@/modules/auth/constants/oauth";

export const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

interface OAuthButtonProps {
  provider: OAuthProvider;
  disabled?: boolean;
}

const OAuthButton = ({ provider, disabled = false }: OAuthButtonProps) => {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();

  const config = oauthConfigs[provider];

  const onPress = useCallback(async () => {
    if (disabled) return;

    const redirectUri = AuthSession.makeRedirectUri();
    console.log("Using redirect URI:", redirectUri);
    console.log(`OAuth button pressed ${provider}`);

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: config.strategy,
        redirectUrl: redirectUri,
      });

      console.log("SSO Flow result:", { createdSessionId });

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
      } else {
        console.log(`${provider} OAuth failed - no session created`);
      }
    } catch (err) {
      console.log(`${provider} OAuth error:`, JSON.stringify(err, null, 2));
    }
  }, [startSSOFlow, config.strategy, provider, disabled]);

  const buttonClasses = [
    config.backgroundColor,
    config.borderColor ? `border ${config.borderColor}` : "",
    "rounded-xl py-3 shadow-sm flex-1",
    disabled ? "opacity-50" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <TouchableOpacity
      onPress={onPress}
      className={buttonClasses}
      activeOpacity={disabled ? 1 : 0.8}
      disabled={disabled}
    >
      <View className="flex-row items-center justify-center">
        {config.icon ? (
          <Image source={config.icon} className="size-6" />
        ) : config.ionIcon ? (
          <Ionicons name={config.ionIcon} size={24} color={config.iconColor} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default OAuthButton;
