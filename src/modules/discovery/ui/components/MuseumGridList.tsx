import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Museum } from "@/types/museum";
import { useTheme } from "@/provider/ThemeProvider";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { getPhotoUrl } from "@/utils";

interface MuseumGridListProps {
  title: string;
  museums: Museum[];
  onCardPress: (museumId: string) => void;
}

const MuseumGridList = ({
  title,
  museums,
  onCardPress,
}: MuseumGridListProps) => {
  if (museums.length === 0) {
    return null;
  }

  return (
    <View className="mb-6">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 mb-4">
        <Text className="text-xl font-bold text-main">{title}</Text>
      </View>

      {/* Grid Layout */}
      <View className="px-6">
        <View className="flex-row flex-wrap justify-between">
          {museums.map((museum, index) => (
            <View key={museum.placeId} className="w-[48%] mb-4">
              <MuseumGridCard
                museum={museum}
                onCardPress={() => onCardPress(museum.placeId)}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default MuseumGridList;

interface MuseumGridCardProps {
  museum: Museum;
  onCardPress?: () => void;
}

const MuseumGridCard = ({ museum, onCardPress }: MuseumGridCardProps) => {
  const { isDark } = useTheme();

  const photoUrl = getPhotoUrl(museum?.photos?.[0].photoReference || null);

  return (
    <TouchableOpacity
      onPress={onCardPress}
      className="bg-card rounded-2xl overflow-hidden shadow-sm flex-1"
      activeOpacity={0.7}
    >
      {/* Image */}
      <View className="relative">
        {photoUrl ? (
          <Image
            source={{
              uri: photoUrl,
            }}
            style={{
              width: "100%",
              height: 120,
            }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View className="w-full h-[120px] bg-surface items-center justify-center">
            <Ionicons
              name="image-outline"
              size={32}
              color={isDark ? "#6B7280" : "#9CA3AF"}
            />
          </View>
        )}
      </View>

      {/* Content */}
      <View className="p-3 flex-1">
        <Text className="text-sm font-bold text-main mb-2" numberOfLines={2}>
          {museum.name}
        </Text>

        <View className="flex-row items-center mt-auto">
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text className="text-sm font-semibold text-main ml-1">
            {museum.rating ? museum.rating.toFixed(1) : "N/A"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
