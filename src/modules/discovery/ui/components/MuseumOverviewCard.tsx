import { View, Text, Pressable, TouchableOpacity, StyleSheet } from "react-native";
import React, { useMemo } from "react";
import { Museum } from "@/types/museum";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
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

const SHADOW = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.12,
  shadowRadius: 16,
  elevation: 8,
};

const SHADOW_SM = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 8,
  elevation: 3,
};

const MuseumOverviewCard = ({
  museum,
  variant = "compact",
  onCardPress,
}: MuseumOverviewCardProps) => {
  const { isDark } = useTheme();
  const { coords } = useLocationManager(false);

  const isSaved = useQuery(api.function.museums.isMuseumSaved, {
    museumId: museum.placeId,
  });
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

  // ── Compact: full-bleed hero card ────────────────────────────────────────────
  if (variant === "compact") {
    return (
      <TouchableOpacity
        onPress={onCardPress}
        activeOpacity={0.92}
        style={[styles.compactCard, SHADOW]}
      >
        {/* Image */}
        <View style={styles.compactImageContainer}>
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, styles.imagePlaceholder]}>
              <Ionicons name="image-outline" size={40} color="#6B7280" />
            </View>
          )}

          {/* Gradient overlay */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.18)", "rgba(0,0,0,0.72)"]}
            start={{ x: 0, y: 0.35 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Top row: rating + favorite */}
          <View style={styles.compactTopRow}>
            <View style={styles.ratingChip}>
              <Ionicons name="star" size={11} color="#F59E0B" />
              <Text style={styles.ratingChipText}>
                {museum.rating?.toFixed(1) ?? "0.0"}
              </Text>
            </View>

            <TouchableOpacity onPress={onFavoritePress} style={styles.favoriteChip}>
              <Ionicons
                name={isSaved ? "heart" : "heart-outline"}
                size={17}
                color={isSaved ? "#FB7185" : "white"}
              />
            </TouchableOpacity>
          </View>

          {/* Bottom: name + meta */}
          <View style={styles.compactBottom}>
            <Text style={styles.compactName} numberOfLines={1}>
              {museum.name}
            </Text>
            <View style={styles.compactMeta}>
              {formattedDistance && (
                <View style={styles.metaRow}>
                  <Ionicons name="location-sharp" size={11} color="rgba(255,255,255,0.75)" />
                  <Text style={styles.metaText}>{formattedDistance}</Text>
                </View>
              )}
              {isOpen !== undefined && (
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: isOpen ? "rgba(16,185,129,0.85)" : "rgba(239,68,68,0.8)" },
                  ]}
                >
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>{isOpen ? "Open" : "Closed"}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // ── Detailed: horizontal list card ───────────────────────────────────────────
  return (
    <Pressable
      onPress={onCardPress}
      style={[styles.detailedCard, SHADOW_SM, { backgroundColor: isDark ? "#1F2937" : "#FFFFFF" }]}
    >
      {/* Image */}
      <View style={styles.detailedImageContainer}>
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={[{ width: "100%", height: "100%" }, styles.imagePlaceholder]}>
            <Ionicons name="image-outline" size={28} color="#9CA3AF" />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.detailedContent}>
        <Text
          style={[styles.detailedName, { color: isDark ? "#F9FAFB" : "#111827" }]}
          numberOfLines={2}
        >
          {museum.name}
        </Text>
        <Text
          style={[styles.detailedAddress, { color: isDark ? "#9CA3AF" : "#6B7280" }]}
          numberOfLines={1}
        >
          {museum.vicinity || museum.formattedAddress}
        </Text>

        <View style={styles.detailedMeta}>
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text style={[styles.detailedRating, { color: isDark ? "#F9FAFB" : "#111827" }]}>
            {museum.rating?.toFixed(1) ?? "0.0"}
          </Text>
          <Text style={[styles.detailedReviews, { color: isDark ? "#9CA3AF" : "#6B7280" }]}>
            ({museum.userRatingsTotal ?? 0})
          </Text>
          {formattedDistance && (
            <>
              <Text style={[styles.dot, { color: isDark ? "#6B7280" : "#D1D5DB" }]}>·</Text>
              <Ionicons name="location-outline" size={12} color={isDark ? "#9CA3AF" : "#6B7280"} />
              <Text style={[styles.detailedReviews, { color: isDark ? "#9CA3AF" : "#6B7280" }]}>
                {formattedDistance}
              </Text>
            </>
          )}
        </View>

        {isOpen !== undefined && (
          <View style={styles.detailedStatusRow}>
            <View
              style={[
                styles.detailedStatusDot,
                { backgroundColor: isOpen ? "#10B981" : "#EF4444" },
              ]}
            />
            <Text
              style={[
                styles.detailedStatusText,
                { color: isOpen ? (isDark ? "#34D399" : "#059669") : (isDark ? "#F87171" : "#DC2626") },
              ]}
            >
              {isOpen ? "Open now" : "Closed"}
            </Text>
          </View>
        )}
      </View>

      {/* Favorite */}
      <Pressable onPress={onFavoritePress} style={styles.detailedFavorite} hitSlop={8}>
        <Ionicons
          name={isSaved ? "heart" : "heart-outline"}
          size={18}
          color={isSaved ? "#FB7185" : isDark ? "#6B7280" : "#D1D5DB"}
        />
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // Compact
  compactCard: {
    borderRadius: 20,
    overflow: "hidden",
  },
  compactImageContainer: {
    height: 240,
    backgroundColor: "#E5E7EB",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  compactTopRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.38)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 3,
  },
  ratingChipText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  favoriteChip: {
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 7,
    borderRadius: 20,
  },
  compactBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  compactName: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  compactMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "white",
  },
  statusText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
  },
  // Detailed
  detailedCard: {
    flexDirection: "row",
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 16,
    marginBottom: 12,
    height: 100,
  },
  detailedImageContainer: {
    width: 96,
    height: "100%",
    backgroundColor: "#E5E7EB",
  },
  detailedContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "center",
  },
  detailedName: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  detailedAddress: {
    fontSize: 11,
    marginBottom: 6,
  },
  detailedMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  detailedRating: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 2,
  },
  detailedReviews: {
    fontSize: 11,
  },
  dot: {
    fontSize: 12,
    marginHorizontal: 1,
  },
  detailedStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    gap: 4,
  },
  detailedStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  detailedStatusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  detailedFavorite: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});

export default MuseumOverviewCard;
