import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useTheme } from "@/provider/ThemeProvider";

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
  const { isDark } = useTheme();

  return (
    <View className="flex-row items-center justify-between px-6 py-3">
      <View className="flex-1 gap-0.5">
        <Text className={`text-[28px] font-extrabold -tracking-[0.5px] ${isDark ? "text-gray-50" : "text-gray-900"}`}>
          Musez
        </Text>
        <TouchableOpacity onPress={onLocationPress} className="flex-row items-center gap-1" activeOpacity={0.7}>
          <Ionicons name="location-sharp" size={13} color={Colors.Primary} />
          <Text
            className={`text-[13px] font-medium shrink ${isDark ? "text-gray-400" : "text-gray-500"}`}
            numberOfLines={1}
          >
            {place}
          </Text>
          <Ionicons name="chevron-forward" size={12} color={isDark ? "#9CA3AF" : "#6B7280"} />
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center gap-2 ml-3">
        {secondRightComponent}
        {rightComponent}
      </View>
    </View>
  );
};

export default DiscoveryHeader;
