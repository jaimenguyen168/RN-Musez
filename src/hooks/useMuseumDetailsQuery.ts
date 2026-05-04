import { useQuery as useConvexQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MuseumDetails } from "@/types/museum";

export const useMuseumDetailsQuery = (museumId: string | null) => {
  // museumId from the route may be URL-encoded (e.g. "way%2F1234") — decode it
  const osmId = museumId ? decodeURIComponent(museumId) : null;

  const museum = useConvexQuery(
    api.function.museumLocations.getMuseumByOsmId,
    osmId ? { osmId } : "skip",
  );

  if (museum === undefined) {
    return { data: null, isLoading: true, error: null };
  }

  if (museum === null) {
    return { data: null, isLoading: false, error: new Error("Museum not found") };
  }

  // Map DB shape → MuseumDetails type used by the detail view
  const data: MuseumDetails = {
    placeId: museum.osmId,
    name: museum.name,
    formattedAddress: [museum.address, museum.city, museum.country]
      .filter(Boolean)
      .join(", "),
    formattedPhoneNumber: museum.phone,
    website: museum.website,
    openingHours: museum.openingHours
      ? { openNow: false, weekdayText: [museum.openingHours] }
      : undefined,
    geometry: {
      location: { lat: museum.lat, lng: museum.lng },
      viewport: {
        northeast: { lat: museum.lat + 0.01, lng: museum.lng + 0.01 },
        southwest: { lat: museum.lat - 0.01, lng: museum.lng - 0.01 },
      },
    },
    types: ["museum"],
    businessStatus: "OPERATIONAL",
    // Reuse the stored Wikimedia image as the header photo
    photos: museum.imageUrl
      ? [{ photoReference: museum.imageUrl, height: 600, width: 800, htmlAttributions: [] }]
      : undefined,
  };

  return { data, isLoading: false, error: null };
};
