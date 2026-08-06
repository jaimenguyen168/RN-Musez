import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useOrganicTheme } from "@/constants/organicTheme";

interface FavoriteArtworksEmptyProps {
  onSnapPress: () => void;
}

const FavoriteArtworksEmpty = ({ onSnapPress }: FavoriteArtworksEmptyProps) => {
  const c = useOrganicTheme();

  return (
    <View className="flex-1 items-center justify-center px-8 gap-3">
      <View className="w-24 h-24 rounded-full items-center justify-center bg-organic-accent2-soft">
        <Ionicons name="camera-outline" size={36} color={c.accent2} />
      </View>
      <Text className="font-heading text-organic text-[22px]">No artworks kept</Text>
      <Text className="font-figtree text-organic-muted text-[13.5px] text-center leading-5 max-w-[280px]">
        Snap a painting or sculpture, and anything you keep after the read shows up here.
      </Text>
      <TouchableOpacity onPress={onSnapPress} className="mt-1 px-7 py-3.5 rounded-full bg-organic-accent">
        <Text className="font-heading text-organic-accent-soft text-[14.5px]">Open the camera</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FavoriteArtworksEmpty;
