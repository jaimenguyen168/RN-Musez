import { View, Image, TouchableOpacity, Text, Animated } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useOrganicTheme } from "@/constants/organicTheme";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import ParallaxPhotoHeader from "@/components/ParallaxPhotoHeader";

export const MUSEUM_HEADER_HEIGHT = 268;

interface MuseumPhotoHeaderProps {
  museumId: string;
  photoUrls: string[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  initials: string;
  scrollY: Animated.Value;
}

const MuseumPhotoHeader = ({
  museumId,
  photoUrls,
  selectedIndex,
  onSelectIndex,
  initials,
  scrollY,
}: MuseumPhotoHeaderProps) => {
  const router = useRouter();
  const c = useOrganicTheme();
  const isSaved = useQuery(api.function.museums.isMuseumSaved, { museumId });
  const toggleSavedMuseum = useMutation(api.function.museums.toggleSavedMuseum);

  return (
    <ParallaxPhotoHeader
      height={MUSEUM_HEADER_HEIGHT}
      scrollY={scrollY}
      renderPhoto={() =>
        photoUrls[selectedIndex] ? (
          <Image
            source={{ uri: photoUrls[selectedIndex] }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center bg-organic-accent-soft">
            <Text className="font-heading text-organic-accent-strong text-[44px]">
              {initials}
            </Text>
          </View>
        )
      }
    >
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-16 left-3.5 w-9 h-9 rounded-full items-center justify-center bg-organic-photo-btn"
      >
        <Ionicons name="chevron-back" size={19} color={c.text} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => toggleSavedMuseum({ museumId })}
        className="absolute top-16 right-3.5 w-9 h-9 rounded-full items-center justify-center bg-organic-photo-btn"
      >
        <Ionicons
          name={isSaved ? "heart" : "heart-outline"}
          size={19}
          color={isSaved ? c.accent : c.text}
        />
      </TouchableOpacity>

      {photoUrls.length > 1 && (
        <View className="absolute bottom-3 left-0 right-0 flex-row gap-1.5 justify-center">
          {photoUrls.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => onSelectIndex(i)}
              className={`w-[9px] h-[9px] rounded-full ${i === selectedIndex ? "bg-organic-accent" : "bg-organic-faint"}`}
            />
          ))}
        </View>
      )}
    </ParallaxPhotoHeader>
  );
};

export default MuseumPhotoHeader;
