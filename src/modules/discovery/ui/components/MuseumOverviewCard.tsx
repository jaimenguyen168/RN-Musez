import { View, Text, Image, Pressable } from "react-native";
import React from "react";
import { Museum } from "@/types";
import { Ionicons } from "@expo/vector-icons";

interface MuseumOverviewCardProps {
  museum: Museum;
  variant?: "compact" | "detailed";
  onCardPress?: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
  distanceInMeters?: number;
}

const MuseumOverviewCard = ({
  museum,
  variant = "compact",
  onCardPress,
  onFavoritePress,
  isFavorite = false,
  distanceInMeters,
}: MuseumOverviewCardProps) => {
  const getPhotoUrl = () => {
    if (museum.photos && museum.photos.length > 0) {
      const photoReference = museum.photos[0].photoReference;
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    }
    return null;
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m away`;
    }
    return `${(meters / 1000).toFixed(1)}km away`;
  };

  const photoUrl = getPhotoUrl();

  if (variant === "compact") {
    return (
      <Pressable
        onPress={onCardPress}
        className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4 mx-4"
      >
        <View className="relative">
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              className="w-full h-56"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-56 bg-gray-200 items-center justify-center">
              <Ionicons name="image-outline" size={48} color="#9CA3AF" />
            </View>
          )}
          <Pressable
            onPress={onFavoritePress}
            className="absolute top-4 right-4 bg-white/90 rounded-full p-2"
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "#EC4899" : "#6B7280"}
            />
          </Pressable>
        </View>

        <View className="p-4">
          <Text className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">
            {museum.name}
          </Text>
          <Text className="text-base text-gray-500 mb-3">
            {museum.vicinity}
          </Text>

          <View className="flex-row items-center">
            <Ionicons name="star" size={20} color="#F59E0B" />
            <Text className="text-base font-semibold text-gray-900 ml-1 mr-3">
              {museum.rating ? museum.rating.toFixed(1) : "N/A"}
            </Text>
            {distanceInMeters !== undefined && (
              <Text className="text-base text-gray-600">
                {formatDistance(distanceInMeters)}
              </Text>
            )}
          </View>

          {museum.openingHours && museum.openingHours.openNow !== undefined && (
            <View className="mt-3 flex-row items-center">
              <View
                className={`w-2 h-2 rounded-full mr-2 ${museum.openingHours.openNow ? "bg-green-500" : "bg-red-500"}`}
              />
              <Text
                className={`text-sm font-medium ${museum.openingHours.openNow ? "text-green-600" : "text-red-600"}`}
              >
                {museum.openingHours.openNow ? "Open now" : "Closed"}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  }

  // Detailed variant
  return (
    <Pressable
      onPress={onCardPress}
      className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4 mx-4"
    >
      <View className="flex-row">
        <View className="w-32 h-40">
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-gray-200 items-center justify-center">
              <Ionicons name="image-outline" size={32} color="#9CA3AF" />
            </View>
          )}
        </View>

        <View className="flex-1 p-4">
          <Text
            className="text-xl font-bold text-gray-900 mb-1"
            numberOfLines={2}
          >
            {museum.name}
          </Text>
          <Text className="text-sm text-gray-500 mb-2" numberOfLines={1}>
            {museum.vicinity}
          </Text>

          <View className="flex-row items-center mb-2">
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text className="text-sm font-semibold text-gray-900 ml-1">
              {museum.rating ? museum.rating.toFixed(1) : "N/A"}
            </Text>
            <Text className="text-xs text-gray-500 ml-1">
              ({museum.userRatingsTotal || 0} Review
              {museum.userRatingsTotal !== 1 ? "s" : ""})
            </Text>
          </View>

          {distanceInMeters !== undefined && (
            <View className="flex-row items-center mb-2">
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-1">
                {formatDistance(distanceInMeters)}
              </Text>
            </View>
          )}

          {museum.openingHours && museum.openingHours.openNow !== undefined && (
            <View className="flex-row items-center">
              <View
                className={`w-2 h-2 rounded-full mr-2 ${museum.openingHours.openNow ? "bg-green-500" : "bg-red-500"}`}
              />
              <Text
                className={`text-xs font-medium ${museum.openingHours.openNow ? "text-green-600" : "text-red-600"}`}
              >
                {museum.openingHours.openNow ? "Open now" : "Closed"}
              </Text>
            </View>
          )}
        </View>

        <Pressable
          onPress={onFavoritePress}
          className="absolute top-3 right-3 bg-white/90 rounded-full p-2"
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={20}
            color={isFavorite ? "#EC4899" : "#6B7280"}
          />
        </Pressable>
      </View>
    </Pressable>
  );
};

export default MuseumOverviewCard;
