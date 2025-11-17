import { View, Text, TouchableOpacity } from "react-native";
import React, { useMemo } from "react";
import { Museum } from "@/types/museum";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/provider/ThemeProvider";
import { useLocationManager } from "@/hooks/useLocationManager";
import { calculateAndFormatDistance, DistanceUnit } from "@/utils/distance";

interface MuseumInfoListProps {
  title: string;
  museums: Museum[];
  onCardPress: (museumId: string) => void;
}

const MuseumInfoList = ({
  title,
  museums,
  onCardPress,
}: MuseumInfoListProps) => {
  const { isDark } = useTheme();
  const { coords } = useLocationManager(false);

  if (museums.length === 0) {
    return null;
  }

  const MuseumInfoCard = ({ museum }: { museum: Museum }) => {
    const formattedDistance = useMemo(() => {
      if (!coords || !museum.geometry?.location) return null;

      const museumCoords = {
        latitude: museum.geometry.location.lat,
        longitude: museum.geometry.location.lng,
      };

      const distanceUnit: DistanceUnit = "imperial";

      return calculateAndFormatDistance(coords, museumCoords, distanceUnit);
    }, [coords, museum.geometry?.location]);

    const isOpen =
      museum.openingHours?.openNow ?? museum.currentOpeningHours?.openNow;

    return (
      <TouchableOpacity
        onPress={() => onCardPress(museum.placeId)}
        className="bg-card rounded-2xl p-4 mb-3 mx-6"
        activeOpacity={0.7}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <Text
              className="text-base font-bold text-main mb-1"
              numberOfLines={2}
            >
              {museum.name}
            </Text>

            <Text className="text-sm text-secondary mb-2" numberOfLines={1}>
              {museum.vicinity || museum.formattedAddress}
            </Text>

            <View className="flex-row items-center flex-wrap gap-3">
              {/* Distance */}
              {formattedDistance && (
                <View className="flex-row items-center">
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                  <Text className="text-sm text-secondary ml-1">
                    {formattedDistance}
                  </Text>
                </View>
              )}

              {/* Open Status */}
              {isOpen !== undefined && (
                <View className="flex-row items-center">
                  <View
                    className={`w-2 h-2 rounded-full mr-1 ${
                      isOpen ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <Text
                    className={`text-sm font-medium ${
                      isOpen ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isOpen ? "Open" : "Closed"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Chevron */}
          <View className="justify-center">
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? "#9CA3AF" : "#6B7280"}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="mb-6">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 mb-4">
        <Text className="text-xl font-bold text-main">{title}</Text>
      </View>

      {/* Vertical List */}
      <View>
        {museums.map((museum) => (
          <MuseumInfoCard key={museum.placeId} museum={museum} />
        ))}
      </View>
    </View>
  );
};

export default MuseumInfoList;
