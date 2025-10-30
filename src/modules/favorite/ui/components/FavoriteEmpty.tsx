import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

interface FavoriteEmptyProps {
  onDiscoveryPress: () => void;
}

const FavoriteEmpty = ({ onDiscoveryPress }: FavoriteEmptyProps) => (
  <View className="flex-1 items-center justify-center p-8">
    <View className="bg-white rounded-3xl p-8 items-center shadow-lg w-full max-w-sm">
      <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
        <Ionicons name="bookmark-outline" size={32} color="#9CA3AF" />
      </View>

      <Text className="text-xl font-bold text-gray-900 mb-3 text-center">
        Start Your Collection
      </Text>

      <Text className="text-gray-600 text-center mb-6 leading-6">
        Save museums you want to visit and create your personal wishlist
      </Text>

      <TouchableOpacity
        onPress={onDiscoveryPress}
        className="bg-indigo-500 px-6 py-3 rounded-full"
      >
        <Text className="text-white font-semibold">Discover Museums</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default FavoriteEmpty;
