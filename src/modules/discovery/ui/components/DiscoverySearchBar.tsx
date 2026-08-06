import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useOrganicTheme } from "@/constants/organicTheme";

interface DiscoverySearchBarProps {
  onPress: () => void;
}

const DiscoverySearchBar = ({ onPress }: DiscoverySearchBarProps) => {
  const c = useOrganicTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="mx-5 flex-row items-center gap-2 rounded-full px-[18px] py-3 bg-organic-surface-alt border border-organic-divider"
    >
      <Ionicons name="search" size={16} color={c.textFaint} />
      <Text className="font-figtree text-organic-faint flex-1 text-[14.5px]">
        Search museums nearby…
      </Text>
    </TouchableOpacity>
  );
};

export default DiscoverySearchBar;
