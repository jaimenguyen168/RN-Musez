import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useOrganicTheme } from "@/constants/organicTheme";

interface FavoriteMuseumsEmptyProps {
  onDiscoveryPress: () => void;
}

const FavoriteMuseumsEmpty = ({ onDiscoveryPress }: FavoriteMuseumsEmptyProps) => {
  const c = useOrganicTheme();

  return (
    <View className="flex-1 items-center justify-center px-8 gap-3">
      <View className="w-24 h-24 rounded-full items-center justify-center bg-organic-surface">
        <Ionicons name="heart-outline" size={38} color={c.accent} />
      </View>
      <Text className="font-heading text-organic text-[22px]">Nothing saved yet</Text>
      <Text className="font-figtree text-organic-muted text-[13.5px] text-center leading-5 max-w-[280px]">
        Tap the heart on any museum and it lands here. Groups let you sort them into trips later.
      </Text>
      <TouchableOpacity onPress={onDiscoveryPress} className="mt-1 px-7 py-3.5 rounded-full bg-organic-accent">
        <Text className="font-heading text-organic-accent-soft text-[14.5px]">Find museums nearby</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FavoriteMuseumsEmpty;
