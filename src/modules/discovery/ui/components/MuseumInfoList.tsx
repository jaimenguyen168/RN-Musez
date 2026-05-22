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

const MuseumInfoList = ({ title, museums, onCardPress }: MuseumInfoListProps) => {
  const { isDark } = useTheme();
  if (museums.length === 0) return null;

  return (
    <View className="mb-6">
      <View className="px-6 mb-3">
        <Text className={`text-[18px] font-bold ${isDark ? "text-gray-50" : "text-gray-900"}`}>{title}</Text>
      </View>
      <View
        className="mx-4 rounded-2xl overflow-hidden"
        style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}
      >
        {museums.map((museum, index) => (
          <MuseumInfoCard
            key={museum.placeId}
            museum={museum}
            onCardPress={() => onCardPress(museum.placeId)}
            isLast={index === museums.length - 1}
          />
        ))}
      </View>
    </View>
  );
};

export default MuseumInfoList;

const MuseumInfoCard = ({
  museum,
  onCardPress,
  isLast,
}: {
  museum: Museum;
  onCardPress: () => void;
  isLast: boolean;
}) => {
  const { isDark } = useTheme();
  const { coords } = useLocationManager(false);

  const formattedDistance = useMemo(() => {
    if (!coords || !museum.geometry?.location) return null;
    return calculateAndFormatDistance(
      coords,
      { latitude: museum.geometry.location.lat, longitude: museum.geometry.location.lng },
      "imperial" as DistanceUnit,
    );
  }, [coords, museum.geometry?.location]);

  const isOpen = museum.openingHours?.openNow ?? museum.currentOpeningHours?.openNow;

  return (
    <TouchableOpacity
      onPress={onCardPress}
      activeOpacity={0.7}
      className={`flex-row items-center px-3.5 py-3 gap-3 ${isDark ? "bg-gray-800" : "bg-white"} ${!isLast ? `border-b ${isDark ? "border-gray-700" : "border-gray-100"}` : ""}`}
    >
      <View className={`w-9 h-9 rounded-[10px] items-center justify-center ${isDark ? "bg-gray-700" : "bg-indigo-50"}`}>
        <Ionicons name="business-outline" size={18} color="#6366F1" />
      </View>

      <View className="flex-1 gap-0.5">
        <Text className={`text-[13px] font-semibold ${isDark ? "text-gray-50" : "text-gray-900"}`} numberOfLines={1}>
          {museum.name}
        </Text>
        <View className="flex-row items-center">
          {formattedDistance && (
            <Text className="text-[11px] text-gray-400">{formattedDistance}</Text>
          )}
          {formattedDistance && museum.vicinity && (
            <Text className={`text-[11px] ${isDark ? "text-gray-600" : "text-gray-300"}`}>{"  ·  "}</Text>
          )}
          {(museum.vicinity || museum.formattedAddress) && (
            <Text className="text-[11px] text-gray-400 flex-1" numberOfLines={1}>
              {museum.vicinity || museum.formattedAddress}
            </Text>
          )}
        </View>
      </View>

      <View className="flex-row items-center gap-1.5">
        {isOpen !== undefined && (
          <View
            className={`px-2 py-0.5 rounded-full ${
              isOpen
                ? isDark ? "bg-emerald-500/15" : "bg-emerald-500/10"
                : isDark ? "bg-red-500/15" : "bg-red-500/8"
            }`}
          >
            <Text
              className={`text-[11px] font-semibold ${
                isOpen
                  ? isDark ? "text-emerald-400" : "text-emerald-600"
                  : isDark ? "text-red-400" : "text-red-600"
              }`}
            >
              {isOpen ? "Open" : "Closed"}
            </Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={16} color={isDark ? "#4B5563" : "#D1D5DB"} />
      </View>
    </TouchableOpacity>
  );
};
