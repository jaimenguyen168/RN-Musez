import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Museum } from "../../../../../convex/convexTypes";
import { useLocationManager } from "@/hooks/useLocationManager";
import { calculateAndFormatDistance, DistanceUnit } from "@/utils/distance";
import { isOpenNow } from "@/utils/openingHours";

export interface MuseumCardInfo {
  distanceText: string | null;
  initials: string;
  hasPhoto: boolean;
  hasRating: boolean;
  ratingText: string;
  reviewCountText: string;
  isOpen: boolean | undefined;
  statusLabel: string;
  addr: string | undefined;
}

const formatReviewCount = (count: number) =>
  count >= 1000 ? `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(count);

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

export const useMuseumCardInfo = (museum: Museum): MuseumCardInfo => {
  const { coords } = useLocationManager(false);
  const ratingSummary = useQuery(api.function.reviews.getMuseumRatingSummary, {
    museumId: museum.osmId,
  });

  return useMemo(() => {
    const distanceText = coords
      ? calculateAndFormatDistance(
          coords,
          { latitude: museum.lat, longitude: museum.lng },
          "imperial" as DistanceUnit,
        ) ?? null
      : null;

    const isOpen = museum.openingHours ? isOpenNow(museum.openingHours) : undefined;
    const rating = ratingSummary?.avgRating ?? undefined;
    const reviewCount = ratingSummary?.totalReviews ?? 0;

    return {
      distanceText,
      initials: initialsOf(museum.name),
      hasPhoto: !!museum.imageUrl,
      hasRating: !!rating,
      ratingText: rating ? rating.toFixed(1) : "",
      reviewCountText: formatReviewCount(reviewCount),
      isOpen,
      statusLabel: isOpen === undefined ? "" : isOpen ? "Open now" : "Closed",
      addr: museum.address,
    };
  }, [coords, museum, ratingSummary]);
};
