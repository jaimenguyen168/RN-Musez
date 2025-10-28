import { View, Text, FlatList, Pressable } from "react-native";
import React from "react";
import { Museum } from "@/types";
import MuseumOverviewCard from "./MuseumOverviewCard";

interface MuseumRowListProps {
  title: string;
  museums: Museum[];
  onCardPress: (museumId: string) => void;
  onFavoritePress: (museumId: string) => void;
  favoriteMuseumIds?: string[];
  onShowAll?: () => void;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

const MuseumRowList = ({
  title,
  museums,
  onCardPress,
  onFavoritePress,
  favoriteMuseumIds = [],
  onShowAll,
  userLocation,
}: MuseumRowListProps) => {
  const calculateDistance = (museum: Museum) => {
    if (!userLocation) return undefined;

    const lat1 = userLocation.latitude;
    const lon1 = userLocation.longitude;
    const lat2 = museum.geometry.location.lat;
    const lon2 = museum.geometry.location.lng;

    // Haversine formula to calculate distance
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  if (museums.length === 0) {
    return null;
  }

  return (
    <View className="mb-6">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 mb-4">
        <Text className="text-xl font-bold text-gray-900">{title}</Text>
        {onShowAll && (
          <Pressable onPress={onShowAll}>
            <Text className="text-base font-medium underline">Show all</Text>
          </Pressable>
        )}
      </View>

      {/* Horizontal ScrollView */}
      <FlatList
        horizontal
        data={museums}
        keyExtractor={(item) => item.placeId}
        renderItem={({ item }) => (
          <View className="w-80">
            <MuseumOverviewCard
              museum={item}
              variant="compact"
              onCardPress={() => onCardPress(item.placeId)}
              onFavoritePress={() => onFavoritePress(item.placeId)}
              isFavorite={favoriteMuseumIds.includes(item.placeId)}
              distanceInMeters={calculateDistance(item)}
            />
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 12,
          gap: 16,
        }}
      />
    </View>
  );
};

export default MuseumRowList;
