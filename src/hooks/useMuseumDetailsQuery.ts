import { useQuery as useConvexQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Museum } from "../../convex/convexTypes";
import { useMuseumDescriptionBackfill } from "./useMuseumDescriptionBackfill";

export type MuseumDetails = Museum & { formattedAddress: string };

export const useMuseumDetailsQuery = (museumId: string | null) => {
  // museumId from the route may be URL-encoded (e.g. "way%2F1234") — decode it
  const osmId = museumId ? decodeURIComponent(museumId) : null;

  const museum = useConvexQuery(
    api.function.museumLocations.getMuseumByOsmId,
    osmId ? { osmId } : "skip",
  );

  const isBackfilling = useMuseumDescriptionBackfill(museum);

  if (museum === undefined) {
    return { data: null, isLoading: true, error: null };
  }

  if (museum === null) {
    return { data: null, isLoading: false, error: new Error("Museum not found") };
  }

  const cityState = [museum.city, museum.state].filter(Boolean).join(", ");
  const cityStateZip = [cityState, museum.postcode].filter(Boolean).join(" ");
  const formattedAddress = [museum.address, cityStateZip, museum.country]
    .filter(Boolean)
    .join(", ");

  const data: MuseumDetails = { ...museum, formattedAddress };

  return { data, isLoading: isBackfilling, error: null };
};
