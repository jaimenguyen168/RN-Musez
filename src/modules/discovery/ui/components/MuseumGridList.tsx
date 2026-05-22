import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Museum } from "@/types/museum";
import { useTheme } from "@/provider/ThemeProvider";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface MuseumGridListProps {
  title: string;
  museums: Museum[];
  onCardPress: (museumId: string) => void;
}

const MuseumGridList = ({ title, museums, onCardPress }: MuseumGridListProps) => {
  const { isDark } = useTheme();
  if (museums.length === 0) return null;

  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center px-6 mb-3.5">
        <Text className={`text-[18px] font-bold ${isDark ? "text-gray-50" : "text-gray-900"}`}>{title}</Text>
      </View>
      <View className="flex-row flex-wrap px-4 gap-2.5">
        {museums.map((museum) => (
          <View key={museum.placeId} className="w-[48%]">
            <MuseumGridCard museum={museum} onCardPress={() => onCardPress(museum.placeId)} />
          </View>
        ))}
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
  const photoRef = museum.imageUrl ?? museum?.photos?.[0]?.photoReference;
  const photoUrl = photoRef
    ? photoRef.startsWith("http")
      ? photoRef
      : `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY}`
    : null;

  return (
    <TouchableOpacity
      onPress={onCardPress}
      activeOpacity={0.9}
      className="rounded-2xl overflow-hidden h-[172px] bg-gray-200"
      style={{ shadowColor: isDark ? "#000" : "#374151", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}
    >
      <View className="absolute inset-0">
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-gray-100">
            <Ionicons name="image-outline" size={32} color="#9CA3AF" />
          </View>
        )}
      </View>

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.16)", "rgba(0,0,0,0.68)"]}
        start={{ x: 0, y: 0.4 }}
        end={{ x: 0, y: 1 }}
        style={{ position: "absolute", inset: 0 }}
        className="absolute inset-0"
      />

      <View className="absolute top-2.5 right-2.5 flex-row items-center gap-0.5 bg-black/40 px-1.5 py-0.5 rounded-full">
        <Ionicons name="star" size={10} color="#F59E0B" />
        <Text className="text-white text-[11px] font-semibold">{museum.rating?.toFixed(1) ?? "0.0"}</Text>
      </View>

      <View className="absolute bottom-0 left-0 right-0 p-2.5">
        <Text className="text-white text-xs font-bold tracking-wide" numberOfLines={2}>
          {museum.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
