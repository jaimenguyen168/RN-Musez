import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/provider/ThemeProvider";
import { Colors } from "@/constants/colors";

interface FavoriteMuseumsEmptyProps {
  onDiscoveryPress: () => void;
}

const FavoriteMuseumsEmpty = ({
  onDiscoveryPress,
}: FavoriteMuseumsEmptyProps) => {
  const { isDark } = useTheme();

  return (
    <View className="flex-1 items-center justify-center p-8 mb-20">
      <View className="bg-card rounded-3xl p-8 items-center shadow-md w-full max-w-sm border border-soft">
        <View className="w-20 h-20 bg-surface rounded-full items-center justify-center mb-6">
          <Ionicons
            name="bookmark-outline"
            size={32}
            color={isDark ? "#6B7280" : "#9CA3AF"}
          />
        </View>

        <Text className="text-xl font-bold text-main mb-3 text-center">
          Start Your Collection
        </Text>

        <Text className="text-secondary text-center mb-6 leading-6">
          Save museums you want to visit and create your personal wishlist
        </Text>

        <TouchableOpacity
          onPress={onDiscoveryPress}
          style={{
            backgroundColor: Colors.Primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 24,
          }}
        >
          <Text className="text-white font-semibold">Discover Museums</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FavoriteMuseumsEmpty;
