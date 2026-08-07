import { View, Text, ImageBackground } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import covers from "@/constants/covers";
import { useTheme } from "@/provider/ThemeProvider";
import { useOrganicTheme } from "@/constants/organicTheme";

const OnboardingOne = () => {
  const { isDark } = useTheme();
  const c = useOrganicTheme();

  const fogColors = [
    "transparent",
    isDark ? "rgba(38,35,31,0.3)" : "rgba(245,234,216,0.3)",
    isDark ? "rgba(38,35,31,0.6)" : "rgba(245,234,216,0.6)",
    isDark ? "rgba(38,35,31,0.96)" : "rgba(245,234,216,0.96)",
  ] as const;

  return (
    <View className="gap-[26px]">
      <View className="px-5 relative">
        <View
          className="absolute rounded-full"
          style={{ left: 52, top: -14, width: 150, height: 150, backgroundColor: c.accent2Soft }}
        />
        <View
          className="relative overflow-hidden"
          style={{
            height: 310,
            borderTopLeftRadius: 120,
            borderTopRightRadius: 120,
            borderBottomLeftRadius: 26,
            borderBottomRightRadius: 120,
            shadowColor: c.shadow,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.16,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          <ImageBackground source={covers.museum1} resizeMode="cover" style={{ width: "100%", height: "100%" }}>
            <LinearGradient
              colors={fogColors}
              locations={[0.1, 0.5, 0.7, 1]}
              style={{ position: "absolute", bottom: 0, width: "100%", height: "100%" }}
            />
          </ImageBackground>
        </View>
      </View>

      <View className="px-5 gap-2">
        <Text className="font-figtree-bold text-organic-accent text-[11px] tracking-[1.5px] uppercase">Nearby</Text>
        <Text className="font-heading text-organic text-[31px] leading-9">
          Discover Museums Around You
        </Text>
        <Text className="font-figtree text-organic-muted text-[14.5px] leading-[22px]" style={{ maxWidth: 330 }}>
          Explore art, history, and culture with personalized museum recommendations.
        </Text>
      </View>
    </View>
  );
};

export default OnboardingOne;
