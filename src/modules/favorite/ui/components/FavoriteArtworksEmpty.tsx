import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/provider/ThemeProvider";

interface FavoriteArtworksEmptyProps {
  onSnapPress: () => void;
}

const FavoriteArtworksEmpty = ({ onSnapPress }: FavoriteArtworksEmptyProps) => {
  const { isDark } = useTheme();

  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="bg-card rounded-3xl p-8 items-center shadow-lg w-full max-w-sm border border-soft">
        <View className="w-20 h-20 bg-surface rounded-full items-center justify-center mb-6">
          <Ionicons
            name="camera-outline"
            size={32}
            color={isDark ? "#6B7280" : "#9CA3AF"}
          />
        </View>

        <Text className="text-xl font-bold text-main mb-3 text-center">
          Start Your Art Collection
        </Text>

        <Text className="text-secondary text-center mb-6 leading-6">
          Discover and save beautiful artworks from museums around the world
        </Text>

        <TouchableOpacity
          onPress={onSnapPress}
          className="bg-indigo-500 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-semibold">Explore Artworks</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FavoriteArtworksEmpty;
