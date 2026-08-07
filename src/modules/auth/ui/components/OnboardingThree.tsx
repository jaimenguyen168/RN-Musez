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

  const fogColors = [
    isDark ? "rgba(38,35,31,0.6)" : "rgba(245,234,216,0.6)",
    "transparent",
    isDark ? "rgba(38,35,31,0.6)" : "rgba(245,234,216,0.6)",
    isDark ? "rgba(38,35,31,0.95)" : "rgba(245,234,216,0.95)",
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
    <View className="gap-[26px]">
      <View className="px-5">
        <View className="overflow-hidden w-full justify-between items-center bg-organic-surface rounded-3xl relative" style={{ height: 310 }}>
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
            colors={fogColors}
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
      </View>

      <View className="px-5 gap-2">
        <Text className="font-figtree-bold text-organic-accent text-[11px] tracking-[1.5px] uppercase">
          Your Collection
        </Text>
        <Text className="font-heading text-organic text-[31px] leading-9">
          Build Your Personal Art Collection
        </Text>
        <Text className="font-figtree text-organic-muted text-[14.5px] leading-[22px]" style={{ maxWidth: 330 }}>
          Save your favorite artworks and museums to create your own curated gallery.
        </Text>
      </View>
    </View>
  );
};

export default OnboardingThree;
