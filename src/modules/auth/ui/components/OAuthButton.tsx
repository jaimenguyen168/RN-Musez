import React, { useCallback, useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useSSO } from "@clerk/clerk-expo";
import { Text, Platform, TouchableOpacity } from "react-native";
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
  const label = provider.charAt(0).toUpperCase() + provider.slice(1);

  const onPress = useCallback(async () => {
    if (disabled) return;

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: config.strategy,
        redirectUrl: AuthSession.makeRedirectUri(),
      });

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
      }
    } catch (err) {
      console.log(`${provider} OAuth error:`, JSON.stringify(err, null, 2));
    }
  }, [startSSOFlow, config.strategy, provider, disabled]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={disabled ? 1 : 0.8}
      disabled={disabled}
      className={`flex-1 py-3.5 rounded-full items-center border border-organic-divider bg-organic-surface-alt ${disabled ? "opacity-50" : ""}`}
    >
      <Text className="font-figtree-bold text-organic text-[13.5px]">{label}</Text>
    </TouchableOpacity>
  );
};

export default OAuthButton;
