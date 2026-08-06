import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

interface DiscoveryHeaderProps {
  place: string;
  onLocationPress: () => void;
  rightComponent?: React.ReactNode;
  secondRightComponent?: React.ReactNode;
}

const DiscoveryHeader = ({
  place,
  onLocationPress,
  rightComponent,
  secondRightComponent,
}: DiscoveryHeaderProps) => {
  return (
    <View className="gap-1 pb-1">
      <View className="flex-row items-center justify-between px-5">
        <Text className="font-heading text-organic text-[28px]">Musez</Text>
        <View className="flex-row items-center gap-2">
          {secondRightComponent}
          {rightComponent}
        </View>
      </View>

      <TouchableOpacity
        onPress={onLocationPress}
        activeOpacity={0.7}
        className="self-start mx-5 border-b border-dashed border-organic-faint pb-0.5"
      >
        <Text className="font-figtree text-organic-muted text-sm">
          Exploring near <Text className="font-figtree-bold text-organic">{place}</Text> ▾
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default DiscoveryHeader;
