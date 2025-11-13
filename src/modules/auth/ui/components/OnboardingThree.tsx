import { View, Text, Image } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import covers from "@/constants/covers";
import { useTheme } from "@/provider/ThemeProvider";

const {
  painting1,
  painting2,
  painting3,
  painting4,
  painting5,
  art1,
  art2,
  art3,
  art4,
  statue1,
} = covers;

const OnboardingThree = () => {
  const { isDark } = useTheme();

  const lightFogColors = [
    "rgba(255, 255, 255, 0.6)",
    "transparent",
    "rgba(255, 255, 255, 0.6)",
    "rgba(255, 255, 255, 0.95)",
  ] as const;

  const darkFogColors = [
    "rgba(17, 24, 39, 0.6)",
    "transparent",
    "rgba(17, 24, 39, 0.6)",
    "rgba(17, 24, 39, 0.95)",
  ] as const;

  const imageUrlsFirst = [painting1, art1, painting2, painting5];

  const imageUrlsSecond = [painting3, statue1, art4];

  const imageUrlsThird = [painting4, art3, art2, painting1];

  return (
    <View className="w-full h-full flex-col items-center justify-between">
      <View className="overflow-hidden w-11/12 h-3/4 justify-between items-center bg-card rounded-3xl relative">
        {/* Top Row - 4 images with random shifts */}
        <View
          className="w-full px-2 flex-row justify-between items-center gap-3 -ml-64"
          style={{ height: "20%" }}
        >
          {imageUrlsFirst.map((url, index) => (
            <Image
              key={index}
              source={url}
              className="rounded-xl w-40 h-full"
              resizeMode="cover"
            />
          ))}
        </View>

        {/* Middle Row - 3 larger images */}
        <View
          className="w-full px-1 flex-row justify-between items-center gap-3 -ml-80 "
          style={{ height: "45%" }}
        >
          {imageUrlsSecond.map((url, index) => (
            <Image
              key={index}
              source={url}
              className="rounded-xl w-64 h-full"
              resizeMode="cover"
            />
          ))}
        </View>

        {/* Bottom Row - 4 images with random shifts */}
        <View
          className="w-full px-2 flex-row justify-between items-center gap-3 -ml-44"
          style={{ height: "25%" }}
        >
          {imageUrlsThird.map((url, index) => (
            <Image
              key={index}
              source={url}
              className="rounded-xl w-40 h-full"
              resizeMode="cover"
            />
          ))}
        </View>

        {/* Theme-aware foggy gradient overlay */}
        <LinearGradient
          colors={isDark ? darkFogColors : lightFogColors}
          locations={[0, 0.3, 0.7, 1]}
          style={{
            position: "absolute",
            bottom: 0,
            top: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </View>

      {/* Content positioned at the bottom */}
      <View className="gap-3">
        <Text className="text-3xl font-bold text-main text-center leading-tight">
          Build Your Personal{"\n"}Art Collection
        </Text>
        <Text className="text-lg text-secondary font-light text-center leading-relaxed">
          Save your favorite artworks and museums{"\n"}to create your own
          curated gallery
        </Text>
      </View>
    </View>
  );
};

export default OnboardingThree;
