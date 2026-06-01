import { View, Text, Pressable, TouchableOpacity, Image } from "react-native";
import React, { useMemo } from "react";
import { Museum } from "@/types/museum";
import { Ionicons } from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";
import { api } from "../../../../../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useLocationManager } from "@/hooks/useLocationManager";
import { calculateAndFormatDistance, DistanceUnit } from "@/utils/distance";
import { useTheme } from "@/provider/ThemeProvider";

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
  const { isDark } = useTheme();
  const { coords } = useLocationManager(false);

  const isSaved = useQuery(api.function.museums.isMuseumSaved, { museumId: museum.placeId });
  const toggleSavedMuseum = useMutation(api.function.museums.toggleSavedMuseum);

  const formattedDistance = useMemo(() => {
    if (!coords || !museum.geometry?.location) return null;
    return calculateAndFormatDistance(
      coords,
      { latitude: museum.geometry.location.lat, longitude: museum.geometry.location.lng },
      "imperial" as DistanceUnit,
    );
  }, [coords, museum.geometry?.location]);

  const onFavoritePress = async () => {
    await toggleSavedMuseum({ museumId: museum.placeId });
  };

  const photoUrl = museum.imageUrl;
  const isOpen = museum.openingHours?.openNow ?? museum.currentOpeningHours?.openNow;

  // ── Compact ───────────────────────────────────────────────────────────────────
  if (variant === "compact") {
    return (
      <TouchableOpacity
        onPress={onCardPress}
        activeOpacity={0.92}
        className="rounded-[20px] overflow-hidden"
        style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 8 }}
      >
        <View className="h-60 bg-surface">
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              className="absolute inset-0 w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="absolute inset-0 items-center justify-center bg-surface">
              <Ionicons name="image-outline" size={40} color="#6B7280" />
            </View>
          )}

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.18)", "rgba(0,0,0,0.72)"]}
            start={{ x: 0, y: 0.35 }}
            end={{ x: 0, y: 1 }}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Top row */}
          <View className="absolute top-3 left-3 right-3 flex-row justify-between items-center">
            <View className="flex-row items-center gap-0.5 bg-black/40 px-2 py-1 rounded-full">
              <Ionicons name="star" size={11} color="#F59E0B" />
              <Text className="text-white text-xs font-semibold">{museum.rating?.toFixed(1) ?? "0.0"}</Text>
            </View>
            <TouchableOpacity onPress={onFavoritePress} className="bg-black/35 p-1.5 rounded-full">
              <Ionicons name={isSaved ? "heart" : "heart-outline"} size={17} color={isSaved ? "#FB7185" : "white"} />
            </TouchableOpacity>
          </View>

          {/* Bottom */}
          <View className="absolute bottom-0 left-0 right-0 p-3.5">
            <Text className="text-white text-[15px] font-bold mb-1.5 tracking-wide" numberOfLines={1}>
              {museum.name}
            </Text>
            <View className="flex-row items-center justify-between">
              {formattedDistance && (
                <View className="flex-row items-center gap-0.5">
                  <Ionicons name="location-sharp" size={11} color="rgba(255,255,255,0.75)" />
                  <Text className="text-white/75 text-xs">{formattedDistance}</Text>
                </View>
              )}
              {isOpen !== undefined && (
                <View
                  className="flex-row items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: isOpen ? "rgba(16,185,129,0.85)" : "rgba(239,68,68,0.8)" }}
                >
                  <View className="w-1.5 h-1.5 rounded-full bg-white" />
                  <Text className="text-white text-[11px] font-semibold">{isOpen ? "Open" : "Closed"}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // ── Detailed ──────────────────────────────────────────────────────────────────
  return (
    <Pressable
      onPress={onCardPress}
      className="flex-row rounded-2xl overflow-hidden mx-4 mb-3 h-[100px] bg-card"
      style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 }}
    >
      <View className="w-24 h-full bg-surface">
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-surface">
            <Ionicons name="image-outline" size={28} color="#9CA3AF" />
          </View>
        )}
      </View>

      <View className="flex-1 px-3 py-2.5 justify-center">
        <Text className="text-[13px] font-bold mb-0.5 tracking-wide text-main" numberOfLines={2}>
          {museum.name}
        </Text>
        <Text className="text-[11px] mb-1.5 text-secondary" numberOfLines={1}>
          {museum.vicinity || museum.formattedAddress}
        </Text>

        <View className="flex-row items-center gap-0.5">
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text className="text-xs font-semibold ml-0.5 text-main">
            {museum.rating?.toFixed(1) ?? "0.0"}
          </Text>
          <Text className="text-[11px] text-secondary">
            ({museum.userRatingsTotal ?? 0})
          </Text>
          {formattedDistance && (
            <>
              <Text className={`text-xs mx-0.5 ${isDark ? "text-gray-600" : "text-gray-300"}`}>·</Text>
              <Ionicons name="location-outline" size={12} color={isDark ? "#9CA3AF" : "#6B7280"} />
              <Text className="text-[11px] text-secondary">{formattedDistance}</Text>
            </>
          )}
        </View>

        {isOpen !== undefined && (
          <View className="flex-row items-center mt-1 gap-1">
            <View className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-emerald-500" : "bg-red-500"}`} />
            <Text
              className={`text-[11px] font-semibold ${
                isOpen
                  ? isDark ? "text-emerald-400" : "text-emerald-600"
                  : isDark ? "text-red-400" : "text-red-600"
              }`}
            >
              {isOpen ? "Open now" : "Closed"}
            </Text>
          </View>
        )}
      </View>

      <Pressable onPress={onFavoritePress} className="absolute top-2.5 right-2.5" hitSlop={8}>
        <Ionicons
          name={isSaved ? "heart" : "heart-outline"}
          size={18}
          color={isSaved ? "#FB7185" : isDark ? "#6B7280" : "#D1D5DB"}
        />
      </Pressable>
    </Pressable>
  );
};

export default MuseumOverviewCard;
