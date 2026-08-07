import { View, Text, ImageBackground } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import covers from "@/constants/covers";
import { useTheme } from "@/provider/ThemeProvider";
import { useOrganicTheme } from "@/constants/organicTheme";

const OnboardingTwo = () => {
  const { isDark } = useTheme();
  const c = useOrganicTheme();

  const fogColors = [
    "transparent",
    isDark ? "rgba(38,35,31,0.3)" : "rgba(245,234,216,0.3)",
    isDark ? "rgba(38,35,31,0.6)" : "rgba(245,234,216,0.6)",
    isDark ? "rgba(38,35,31,0.9)" : "rgba(245,234,216,0.9)",
  ] as const;

  return (
    <View className="gap-[26px]">
      <View className="px-5 relative">
        <View
          className="absolute rounded-full"
          style={{ right: 44, bottom: -16, width: 132, height: 132, backgroundColor: c.accentSoft }}
        />
        <View
          className="relative overflow-hidden"
          style={{
            height: 310,
            borderTopLeftRadius: 26,
            borderTopRightRadius: 120,
            borderBottomLeftRadius: 120,
            borderBottomRightRadius: 120,
            shadowColor: c.shadow,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.16,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          <ImageBackground source={covers.painting1} resizeMode="cover" style={{ width: "100%", height: "100%" }}>
            <LinearGradient
              colors={fogColors}
              locations={[0.0, 0.3, 0.6, 1]}
              style={{ position: "absolute", bottom: 0, width: "100%", height: "100%" }}
            />
          </ImageBackground>
        </View>
      </View>

      <View className="px-5 gap-2">
        <Text className="font-figtree-bold text-organic-accent text-[11px] tracking-[1.5px] uppercase">
          AI Insights
        </Text>
        <Text className="font-heading text-organic text-[31px] leading-9">
          Get Insights of Artwork Powered by AI
        </Text>
        <Text className="font-figtree text-organic-muted text-[14.5px] leading-[22px]" style={{ maxWidth: 330 }}>
          Learn about artists, styles, and history with intelligent artwork analysis.
        </Text>
      </View>
    </View>
  );
};

export default OnboardingTwo;
