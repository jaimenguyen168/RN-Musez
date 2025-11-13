import { View, Text, ImageBackground } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import covers from "@/constants/covers";
import { useTheme } from "@/provider/ThemeProvider";

const OnboardingOne = () => {
  const { isDark } = useTheme();

  const lightFogColors = [
    "transparent",
    "rgba(255, 255, 255, 0.3)",
    "rgba(255, 255, 255, 0.6)",
    "rgba(255, 255, 255, 0.98)",
  ] as const;

  const darkFogColors = [
    "transparent",
    "rgba(17, 24, 39, 0.3)",
    "rgba(17, 24, 39, 0.6)",
    "rgba(17, 24, 39, 0.98)",
  ] as const;

  return (
    <View className="w-full h-full flex-col items-center justify-between">
      <View
        className="overflow-hidden w-11/12 h-3/4 relative justify-center items-center"
        style={{
          borderTopLeftRadius: 200,
          borderTopRightRadius: 200,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <ImageBackground
          source={covers.museum1}
          resizeMode="cover"
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          {/* Theme-aware foggy gradient overlay */}
          <LinearGradient
            colors={isDark ? darkFogColors : lightFogColors}
            locations={[0.1, 0.5, 0.7, 1]}
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: "100%",
            }}
          />
        </ImageBackground>
      </View>

      {/* Content positioned at the bottom */}
      <View className="gap-3">
        <Text className="text-3xl font-bold text-main text-center leading-tight">
          Discover Museums{"\n"}Around You
        </Text>
        <Text className="text-lg text-secondary font-light text-center leading-relaxed">
          Explore art, history, and culture with{"\n"}personalized museum
          recommendations.
        </Text>
      </View>
    </View>
  );
};

export default OnboardingOne;
