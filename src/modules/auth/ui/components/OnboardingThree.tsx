import { View, Text, Image, Animated } from "react-native";
import React, { useEffect, useRef } from "react";
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

  const topRowAnim = useRef(new Animated.Value(0)).current;
  const middleRowAnim = useRef(new Animated.Value(0)).current;
  const bottomRowAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    const topRowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(topRowAnim, {
          toValue: 30,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(topRowAnim, {
          toValue: -30,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(topRowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );

    const middleRowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(middleRowAnim, {
          toValue: -25,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(middleRowAnim, {
          toValue: 25,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(middleRowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    );

    const bottomRowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bottomRowAnim, {
          toValue: 20,
          duration: 1250,
          useNativeDriver: true,
        }),
        Animated.timing(bottomRowAnim, {
          toValue: -20,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(bottomRowAnim, {
          toValue: 0,
          duration: 1250,
          useNativeDriver: true,
        }),
      ]),
    );

    topRowAnimation.start();
    middleRowAnimation.start();
    bottomRowAnimation.start();

    return () => {
      topRowAnimation.stop();
      middleRowAnimation.stop();
      bottomRowAnimation.stop();
    };
  }, [topRowAnim, middleRowAnim, bottomRowAnim]);

  return (
    <View className="w-full h-full flex-col items-center justify-between">
      <View className="overflow-hidden w-11/12 h-3/4 justify-between items-center bg-card rounded-3xl relative">
        <Animated.View
          className="w-full px-2 flex-row justify-between items-center gap-3 -ml-64"
          style={{
            height: "20%",
            transform: [{ translateX: topRowAnim }],
          }}
        >
          {imageUrlsFirst.map((url, index) => (
            <Image
              key={index}
              source={url}
              className="rounded-xl w-40 h-full"
              resizeMode="cover"
            />
          ))}
        </Animated.View>

        <Animated.View
          className="w-full px-1 flex-row justify-between items-center gap-3 -ml-80"
          style={{
            height: "45%",
            transform: [{ translateX: middleRowAnim }],
          }}
        >
          {imageUrlsSecond.map((url, index) => (
            <Image
              key={index}
              source={url}
              className="rounded-xl w-64 h-full"
              resizeMode="cover"
            />
          ))}
        </Animated.View>

        <Animated.View
          className="w-full px-2 flex-row justify-between items-center gap-3 -ml-44"
          style={{
            height: "25%",
            transform: [{ translateX: bottomRowAnim }],
          }}
        >
          {imageUrlsThird.map((url, index) => (
            <Image
              key={index}
              source={url}
              className="rounded-xl w-40 h-full"
              resizeMode="cover"
            />
          ))}
        </Animated.View>

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
