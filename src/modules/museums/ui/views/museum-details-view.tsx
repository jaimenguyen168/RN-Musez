import React, { useMemo, useRef, useState } from "react";
import { View, Text, Animated, ActivityIndicator, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMuseumDetailsQuery } from "@/hooks/useMuseumDetailsQuery";
import { useLocationManager } from "@/hooks/useLocationManager";
import { calculateAndFormatDistance, DistanceUnit } from "@/utils/distance";
import { parseWeekdayRows, todayDayCode } from "@/utils/parseOpeningHours";
import { isOpenNow } from "@/utils/openingHours";
import { openInMaps } from "@/utils/maps";
import MuseumPhotoHeader, { MUSEUM_HEADER_HEIGHT } from "@/modules/museums/ui/components/MuseumPhotoHeader";
import MuseumReviewComposer from "@/modules/museums/ui/components/MuseumReviewComposer";
import MuseumReviewListItem from "@/modules/museums/ui/components/MuseumReviewListItem";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useOrganicTheme } from "@/constants/organicTheme";

interface MuseumDetailsViewProps {
  museumId: string;
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

const MuseumDetailsView = ({ museumId }: MuseumDetailsViewProps) => {
  const c = useOrganicTheme();
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [hoursOpen, setHoursOpen] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false,
  });

  const { data: museumDetails, isLoading: loading, error } = useMuseumDetailsQuery(museumId);
  const { coords } = useLocationManager(false);

  const osmId = museumId ? decodeURIComponent(museumId) : null;
  const convexReviews = useQuery(
    api.function.reviews.getMuseumReviews,
    osmId ? { museumId: osmId } : "skip",
  );
  const userReview = useQuery(
    api.function.reviews.getUserReviewForMuseum,
    osmId ? { museumId: osmId } : "skip",
  );

  const totalReviews = convexReviews?.length ?? 0;
  const avgRating =
    totalReviews > 0
      ? Math.round((convexReviews!.reduce((s, r) => s + r.rating, 0) / totalReviews) * 10) / 10
      : null;
  const otherReviews = (convexReviews ?? []).filter((r) => r._id !== userReview?._id);

  const distanceText = useMemo(() => {
    if (!coords || museumDetails?.lat === undefined || museumDetails?.lng === undefined) return null;
    return calculateAndFormatDistance(
      coords,
      { latitude: museumDetails.lat, longitude: museumDetails.lng },
      "imperial" as DistanceUnit,
    );
  }, [coords, museumDetails?.lat, museumDetails?.lng]);

  const hoursRows = useMemo(() => {
    if (!museumDetails?.openingHours) return null;
    return parseWeekdayRows([museumDetails.openingHours]);
  }, [museumDetails?.openingHours]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-organic">
        <ActivityIndicator size="large" color={c.accent} />
      </View>
    );
  }
  if (error || !museumDetails) {
    return (
      <View className="flex-1 items-center justify-center bg-organic">
        <Text className="font-figtree text-organic-status-closed text-sm">
          {error?.message ?? "Museum not found"}
        </Text>
      </View>
    );
  }

  const photoUrls = museumDetails.imageUrl ? [museumDetails.imageUrl] : [];
  const isOpen = isOpenNow(museumDetails.openingHours);
  const todayCode = todayDayCode();
  const todayHours = hoursRows?.find((r) => r.day === todayCode)?.hours;

  return (
    <View className="flex-1 bg-organic">
      <MuseumPhotoHeader
        museumId={museumId}
        photoUrls={photoUrls}
        selectedIndex={selectedPhoto}
        onSelectIndex={setSelectedPhoto}
        scrollY={scrollY}
        initials={initialsOf(museumDetails.name)}
      />

      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: MUSEUM_HEADER_HEIGHT, paddingBottom: 90 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-4 gap-1.5">
          <Text className="font-heading text-organic text-2xl leading-[29px]">{museumDetails.name}</Text>

          <View className="flex-row gap-2 items-center flex-wrap">
            {totalReviews > 0 ? (
              <>
                <Text className="font-figtree-bold text-organic text-[13.5px]">★ {avgRating?.toFixed(1)}</Text>
                <Text className="font-figtree text-organic-muted text-[13.5px]">{totalReviews} reviews</Text>
              </>
            ) : (
              <Text className="font-figtree italic text-organic-accent-strong text-[13.5px]">
                Be the first to review
              </Text>
            )}
            {distanceText && (
              <>
                <Text className="text-organic-muted">·</Text>
                <Text className="font-figtree text-organic-muted text-[13.5px]">{distanceText} away</Text>
              </>
            )}
          </View>

          {(museumDetails.category || museumDetails.fee || museumDetails.wheelchair) && (
            <View className="flex-row gap-1.5 flex-wrap mt-0.5">
              {museumDetails.category && (
                <Badge label={museumDetails.category[0].toUpperCase() + museumDetails.category.slice(1)} />
              )}
              {museumDetails.fee && (
                <Badge
                  label={
                    museumDetails.fee === "no"
                      ? "Free admission"
                      : museumDetails.fee === "yes"
                        ? "Paid admission"
                        : museumDetails.fee[0].toUpperCase() + museumDetails.fee.slice(1)
                  }
                />
              )}
              {museumDetails.wheelchair && (
                <Badge
                  label={
                    museumDetails.wheelchair === "yes"
                      ? "Wheelchair accessible"
                      : museumDetails.wheelchair === "limited"
                        ? "Limited accessibility"
                        : "Not wheelchair accessible"
                  }
                />
              )}
            </View>
          )}

          {museumDetails.openingHours && (
            <TouchableOpacity onPress={() => setHoursOpen((v) => !v)} activeOpacity={0.7}>
              <Text className="text-[13px]">
                <Text className={`font-figtree-bold ${isOpen ? "text-organic-status-open" : "text-organic-status-closed"}`}>
                  {isOpen ? "Open now" : "Closed"}
                </Text>
                {todayHours && (
                  <Text className="font-figtree text-organic-muted"> · Today {todayHours} {hoursOpen ? "▴" : "▾"}</Text>
                )}
              </Text>
            </TouchableOpacity>
          )}

          {hoursOpen && hoursRows && (
            <View className="bg-organic-surface rounded-2xl p-3 px-3.5 gap-1.5 mt-0.5">
              {hoursRows.map((row) => (
                <View key={row.day} className="flex-row justify-between">
                  <Text className={`text-[12.5px] text-organic ${row.day === todayCode ? "font-figtree-bold" : "font-figtree"}`}>
                    {row.label}
                  </Text>
                  <Text
                    className={`text-[12.5px] ${row.day === todayCode ? "font-figtree-bold" : "font-figtree"} ${row.hours === "Closed" ? "text-organic-faint" : "text-organic"}`}
                  >
                    {row.hours}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {museumDetails.description && (
          <View className="mx-5 mt-3.5 bg-organic-surface rounded-2xl p-3.5 gap-1.5">
            <Text className="font-heading text-organic text-base">About</Text>
            <Text className="font-figtree text-organic-muted text-[13.5px] leading-[19px]">
              {museumDetails.description}
            </Text>
          </View>
        )}

        <View className="flex-row gap-2 px-5 mt-3.5">
          <TouchableOpacity
            onPress={() =>
              openInMaps(museumDetails.lat, museumDetails.lng, museumDetails.name)
            }
            className="flex-[1.2] py-3 rounded-full items-center bg-organic-accent"
          >
            <Text className="font-heading text-organic-accent-soft text-sm">Directions</Text>
          </TouchableOpacity>
          {museumDetails.website && (
            <TouchableOpacity
              onPress={() => Linking.openURL(museumDetails.website!)}
              className="flex-1 py-3 rounded-full items-center border border-organic-divider"
            >
              <Text className="font-heading text-organic text-sm">Website ↗</Text>
            </TouchableOpacity>
          )}
          {museumDetails.phone && (
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${museumDetails.phone}`)}
              className="flex-1 py-3 rounded-full items-center border border-organic-divider"
            >
              <Text className="font-heading text-organic text-sm">Call</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() =>
            openInMaps(museumDetails.lat, museumDetails.lng, museumDetails.name)
          }
          className="mx-5 mt-3.5 bg-organic-surface rounded-2xl p-3 px-3.5 flex-row gap-3 items-center"
        >
          <View className="w-14 h-14 rounded-lg items-center justify-center bg-organic-accent2-soft">
            <Ionicons name="location-outline" size={22} color={c.accent2} />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="font-figtree-bold text-organic text-[13.5px]">Open in Maps</Text>
            <Text className="font-figtree text-organic-muted text-[12.5px]">{museumDetails.formattedAddress}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={c.textFaint} />
        </TouchableOpacity>

        <View className="px-5 mt-[18px] gap-2.5">
          <View className="flex-row justify-between items-center">
            <Text className="font-heading text-organic text-[19px]">Reviews</Text>
            {totalReviews > 0 && (
              <View className="bg-organic-surface rounded-full px-3 py-1">
                <Text className="font-figtree-bold text-organic text-[12.5px]">
                  ★ {avgRating?.toFixed(1)} · {totalReviews}
                </Text>
              </View>
            )}
          </View>

          {osmId && <MuseumReviewComposer museumId={osmId} />}

          {otherReviews.map((r) => (
            <MuseumReviewListItem
              key={r._id}
              name={r.userName}
              avatarUrl={r.userAvatar}
              rating={r.rating}
              comment={r.comment}
              time={
                r.dateVisited
                  ? `Visited ${r.dateVisited}`
                  : new Date(r._creationTime).toLocaleDateString(undefined, { month: "short", year: "numeric" })
              }
            />
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const Badge = ({ label }: { label: string }) => (
  <View className="bg-organic-accent2-soft rounded-full px-2.5 py-1">
    <Text className="font-figtree-bold text-organic-accent2 text-[11px]">{label}</Text>
  </View>
);

export default MuseumDetailsView;
