import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Museum } from "@/types/museum";
import { isOpenNow } from "@/utils/openingHours";

export interface FetchMuseumsByIdsParams {
  museumIds: string[];
}

export const useMuseumsFavorites = (
  params: FetchMuseumsByIdsParams | null,
) => {
  const osmIds = params?.museumIds ?? [];

  const results = useQuery(
    api.function.museumLocations.getMuseumsByOsmIds,
    osmIds.length > 0 ? { osmIds } : "skip",
  );

  if (osmIds.length === 0) {
    return { data: [] as Museum[], isLoading: false, error: null };
  }

  if (results === undefined) {
    return { data: [] as Museum[], isLoading: true, error: null };
  }

  const museums: Museum[] = (results as NonNullable<typeof results>).map((m) => ({
    placeId: m.osmId,
    name: m.name,
    formattedAddress: [m.address, m.city, m.country].filter(Boolean).join(", "),
    formattedPhoneNumber: m.phone,
    website: m.website,
    imageUrl: m.imageUrl,
    openingHours: m.openingHours
      ? { openNow: isOpenNow(m.openingHours), weekdayText: [m.openingHours] }
      : undefined,
    geometry: {
      location: { lat: m.lat, lng: m.lng },
      viewport: {
        northeast: { lat: m.lat + 0.01, lng: m.lng + 0.01 },
        southwest: { lat: m.lat - 0.01, lng: m.lng - 0.01 },
      },
    },
    types: ["museum"],
    businessStatus: "OPERATIONAL",
    photos: m.imageUrl
      ? [{ photoReference: m.imageUrl, height: 600, width: 800, htmlAttributions: [] }]
      : undefined,
  }));

  return { data: museums, isLoading: false, error: null };
};
