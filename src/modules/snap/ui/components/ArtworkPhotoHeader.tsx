import { Image, TouchableOpacity, Text, Animated } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/provider/ThemeProvider";
import { useOrganicTheme } from "@/constants/organicTheme";
import ParallaxPhotoHeader from "@/components/ParallaxPhotoHeader";

export const ARTWORK_HEADER_HEIGHT = 340;

interface ArtworkPhotoHeaderProps {
  imageUri?: string;
  scrollY: Animated.Value;
}

const ArtworkPhotoHeader = ({ imageUri, scrollY }: ArtworkPhotoHeaderProps) => {
  const router = useRouter();
  const { isDark } = useTheme();
  const c = useOrganicTheme();

  return (
    <ParallaxPhotoHeader
      height={ARTWORK_HEADER_HEIGHT}
      scrollY={scrollY}
      renderPhoto={() => (
        <>
          {imageUri && <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />}
          <LinearGradient
            colors={["transparent", isDark ? "rgba(38,35,31,0.96)" : "rgba(245,234,216,0.94)"]}
            style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 88 }}
          />
        </>
      )}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-16 left-3.5 w-[38px] h-[38px] rounded-full items-center justify-center bg-organic-photo-btn"
        style={{ shadowColor: c.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 2 }}
      >
        <Ionicons name="chevron-back" size={19} color={c.text} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/snap")}
        className="absolute top-16 right-3.5 rounded-full px-4 py-2.5 flex-row items-center gap-1.5 bg-organic-photo-btn"
        style={{ shadowColor: c.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 2 }}
      >
        <Ionicons name="camera-outline" size={15} color={c.text} />
        <Text className="font-heading text-organic text-[13.5px]">Snap another</Text>
      </TouchableOpacity>
    </ParallaxPhotoHeader>
  );
};

export default ArtworkPhotoHeader;
