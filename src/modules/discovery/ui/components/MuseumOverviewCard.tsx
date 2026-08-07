import { View, Text, Pressable, TouchableOpacity, Image } from "react-native";
import React, { useMemo } from "react";
import { Museum } from "../../../../../convex/convexTypes";
import { Ionicons } from "@expo/vector-icons";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useLocationManager } from "@/hooks/useLocationManager";
import { calculateAndFormatDistance, DistanceUnit } from "@/utils/distance";
import { getOpenStatus } from "@/utils/openingHours";
import { useOrganicTheme } from "@/constants/organicTheme";
import { useTheme } from "@/provider/ThemeProvider";

interface MuseumOverviewCardProps {
  museum: Museum;
  variant?: "compact" | "detailed";
  onCardPress?: () => void;
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

const STATUS_LABEL: Record<"open" | "closing-soon" | "closed", string> = {
  open: "Open now",
  "closing-soon": "Closing soon",
  closed: "Closed",
};

const MuseumOverviewCard = ({ museum, variant = "compact", onCardPress }: MuseumOverviewCardProps) => {
  const c = useOrganicTheme();
  const { isDark } = useTheme();
  const { coords } = useLocationManager(false);

  const isSaved = useQuery(api.function.museums.isMuseumSaved, { museumId: museum.osmId });
  const toggleSavedMuseum = useMutation(api.function.museums.toggleSavedMuseum);
  const ratingSummary = useQuery(api.function.reviews.getMuseumRatingSummary, {
    museumId: museum.osmId,
  });

  const formattedDistance = useMemo(() => {
    if (!coords) return null;
    return calculateAndFormatDistance(
      coords,
      { latitude: museum.lat, longitude: museum.lng },
      "imperial" as DistanceUnit,
    );
  }, [coords, museum.lat, museum.lng]);

  const onFavoritePress = async () => {
    await toggleSavedMuseum({ museumId: museum.osmId });
  };

  const photoUrl = museum.imageUrl;
  const openStatus = getOpenStatus(museum.openingHours);
  const rating = ratingSummary?.avgRating ?? undefined;
  const totalReviews = ratingSummary?.totalReviews ?? 0;
  const hasReviews = totalReviews > 0;

  const pillColors =
    openStatus === "open"
      ? { bg: c.accent2Soft, fg: c.statusOpen }
      : openStatus === "closing-soon"
        ? { bg: isDark ? "#4a3712" : "#fdecc8", fg: isDark ? "#f6c667" : "#8a5a06" }
        : { bg: c.accentSoft, fg: c.statusClosed };

  // ── Big (photo card, first 3) ────────────────────────────────────────────
  if (variant === "detailed") {
    return (
      <Pressable
        onPress={onCardPress}
        className="rounded-2xl overflow-hidden bg-organic-surface"
        style={{ shadowColor: c.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 5 }}
      >
        <View className="h-[158px] bg-organic-placeholder-a relative">
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="w-full h-full items-center justify-center bg-organic-accent-soft">
              <Text className="font-heading text-organic-accent-strong text-[40px]">{initialsOf(museum.name)}</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={onFavoritePress}
            className="absolute top-2.5 right-2.5 w-[34px] h-[34px] rounded-full items-center justify-center bg-organic-photo-btn"
          >
            <Ionicons name={isSaved ? "heart" : "heart-outline"} size={17} color={isSaved ? c.accent : c.text} />
          </TouchableOpacity>
          {openStatus !== "unknown" && (
            <View className="absolute left-[11px] bottom-[11px] rounded-full px-3 py-1" style={{ backgroundColor: pillColors.bg }}>
              <Text className="font-figtree-bold text-[11px]" style={{ color: pillColors.fg }}>
                {STATUS_LABEL[openStatus]}
              </Text>
            </View>
          )}
        </View>

        <View className="px-[15px] pt-[13px] pb-[15px] gap-1">
          <Text className="font-heading text-organic text-[19px] leading-[23px]">{museum.name}</Text>
          <Text className="font-figtree text-organic-faint text-xs" numberOfLines={1}>
            {museum.address}
          </Text>
          <View className="flex-row gap-1.5 items-center flex-wrap">
            {hasReviews ? (
              <>
                <Text className="font-figtree-bold text-organic text-[12.5px]">★ {rating?.toFixed(1)}</Text>
                <Text className="font-figtree text-organic-muted text-[12.5px]">({totalReviews})</Text>
              </>
            ) : (
              <Text className="font-figtree italic text-organic-accent-strong text-[12.5px]">
                be the first to review
              </Text>
            )}
            {formattedDistance && (
              <Text className="font-figtree text-organic-muted text-[12.5px]">· {formattedDistance}</Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  }

  // ── Small (slim row, after the first 3) ──────────────────────────────────
  return (
    <Pressable
      onPress={onCardPress}
      className="bg-organic-surface rounded-2xl px-3 py-2.5 flex-row gap-3 items-center"
    >
      <View className="w-[46px] h-[46px] rounded-xl overflow-hidden bg-organic-placeholder-a">
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full items-center justify-center bg-organic-accent-soft">
            <Text className="font-heading text-organic-accent-strong text-[15px]">{initialsOf(museum.name)}</Text>
          </View>
        )}
      </View>

      <View className="flex-1 gap-0.5">
        <Text className="font-figtree-bold text-organic text-[13.5px] leading-[17px]" numberOfLines={1}>
          {museum.name}
        </Text>
        <View className="flex-row gap-1.5 items-center flex-wrap">
          {formattedDistance && (
            <Text className="font-figtree text-organic-muted text-xs">{formattedDistance}</Text>
          )}
          {hasReviews ? (
            <Text className="font-figtree-bold text-organic text-xs">★ {rating?.toFixed(1)}</Text>
          ) : (
            <Text className="font-figtree italic text-organic-accent-strong text-xs">no reviews yet</Text>
          )}
        </View>
      </View>

      <TouchableOpacity onPress={onFavoritePress} className="w-8 h-8 items-center justify-center">
        <Ionicons name={isSaved ? "heart" : "heart-outline"} size={17} color={isSaved ? c.accent : c.textFaint} />
      </TouchableOpacity>
    </Pressable>
  );
};

export default MuseumOverviewCard;
