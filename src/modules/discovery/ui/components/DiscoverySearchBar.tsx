import { View, TextInput } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useOrganicTheme } from "@/constants/organicTheme";

interface DiscoverySearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

const DiscoverySearchBar = ({ value, onChangeText }: DiscoverySearchBarProps) => {
  const c = useOrganicTheme();

  return (
    <View className="mx-5 flex-row items-center gap-2 rounded-full px-[18px] py-3 bg-organic-surface-alt border border-organic-divider">
      <Ionicons name="search" size={16} color={c.textFaint} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search museums nearby…"
        placeholderTextColor={c.textFaint}
        className="font-figtree text-organic flex-1 text-[14.5px]"
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
    </View>
  );
};

export default DiscoverySearchBar;
