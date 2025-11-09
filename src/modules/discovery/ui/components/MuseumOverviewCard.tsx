import { View, Text, Image, Pressable, TouchableOpacity } from "react-native";
import React, { useMemo } from "react";
import { Museum } from "@/types/museum";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { api } from "../../../../../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { getPhotoUrl } from "@/utils";
import { useLocationManager } from "@/hooks/useLocationManager";
import { calculateAndFormatDistance, DistanceUnit } from "@/utils/distance";

interface MuseumOverviewCardProps {
  museum: Museum;
  variant?: "compact" | "detailed";
  onCardPress?: () => void;
}

const MuseumOverviewCard = ({
  museum,
  variant = "compact",
  onCardPress,
}: MuseumOverviewCardProps) => {
  const { coords } = useLocationManager(false);

  const isSaved = useQuery(api.function.museums.isMuseumSaved, {
    museumId: museum.placeId,
  });

  const toggleSavedMuseum = useMutation(api.function.museums.toggleSavedMuseum);

  const formattedDistance = useMemo(() => {
    if (!coords || !museum.geometry?.location) return null;

    const museumCoords = {
      latitude: museum.geometry.location.lat,
      longitude: museum.geometry.location.lng,
    };

    const distanceUnit: DistanceUnit = "imperial";

    return calculateAndFormatDistance(coords, museumCoords, distanceUnit);
  }, [coords, museum.geometry?.location]);

  const onFavoritePress = async () => {
    await toggleSavedMuseum({
      museumId: museum.placeId,
    });
  };

  const photoUrl = getPhotoUrl(museum);

  const isOpen =
    museum.openingHours?.openNow ?? museum.currentOpeningHours?.openNow;

  if (variant === "compact") {
    return (
      <TouchableOpacity
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
          <TouchableOpacity
            onPress={onFavoritePress}
            className="absolute top-4 right-4 bg-white/90 rounded-full p-2"
          >
            <Ionicons
              name={isSaved ? "heart" : "heart-outline"}
              size={24}
              color={isSaved ? "#EC4899" : "#6B7280"}
            />
          </TouchableOpacity>
        </View>

        <View className="p-4">
          <Text className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">
            {museum.name}
          </Text>
          <Text className="text-base text-gray-500 mb-3">
            {museum.vicinity || museum.formattedAddress}
          </Text>

          <View className="flex-row items-center">
            <Ionicons name="star" size={20} color="#F59E0B" />
            <Text className="text-base font-semibold text-gray-900 ml-1 mr-3">
              {museum.rating ? museum.rating.toFixed(1) : "N/A"}
            </Text>
            {formattedDistance && (
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="directions" size={20} color="#6B7280" />
                <Text className="text-base text-gray-600">
                  {formattedDistance}
                </Text>
              </View>
            )}
          </View>

          {isOpen !== undefined && (
            <View className="mt-3 flex-row items-center">
              <View
                className={`w-2 h-2 rounded-full mr-2 ${isOpen ? "bg-green-500" : "bg-red-500"}`}
              />
              <Text
                className={`text-sm font-medium ${isOpen ? "text-green-600" : "text-red-600"}`}
              >
                {isOpen ? "Open now" : "Closed"}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <Pressable
      onPress={onCardPress}
      className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4 mx-4"
    >
      <View className="flex-row h-48">
        <View className="w-32">
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

        <View className="flex-1 p-4 pr-12">
          <Text
            className="text-lg font-bold text-gray-900 mb-1"
            numberOfLines={2}
          >
            {museum.name}
          </Text>
          <Text className="text-sm text-gray-500 mb-2" numberOfLines={1}>
            {museum.vicinity || museum.formattedAddress}
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

          {formattedDistance && (
            <View className="flex-row items-center mb-2">
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-1">
                {formattedDistance}
              </Text>
            </View>
          )}

          {isOpen !== undefined && (
            <View className="flex-row items-center mt-auto">
              <View
                className={`w-2 h-2 rounded-full mr-2 ${isOpen ? "bg-green-500" : "bg-red-500"}`}
              />
              <Text
                className={`text-xs font-medium ${isOpen ? "text-green-600" : "text-red-600"}`}
              >
                {isOpen ? "Open now" : "Closed"}
              </Text>
            </View>
          )}
        </View>

        <Pressable
          onPress={onFavoritePress}
          className="absolute top-3 right-3 bg-white/90 rounded-full p-2"
        >
          <Ionicons
            name={isSaved ? "heart" : "heart-outline"}
            size={20}
            color={isSaved ? "#EC4899" : "#6B7280"}
          />
        </Pressable>
      </View>
    </Pressable>
  );
};

export default MuseumOverviewCard;
