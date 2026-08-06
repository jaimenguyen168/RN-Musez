import { useEffect, useState } from "react";
import { useAction, useQuery as useConvexQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Museum } from "../../convex/convexTypes";
import { useMuseumImageBackfill } from "./useMuseumImageBackfill";

export interface FetchMuseumsParams {
  latitude: number;
  longitude: number;
}

export const useMuseumsQuery = (params: FetchMuseumsParams | null) => {
  const [error, setError] = useState<Error | null>(null);
  const fetchAndCache = useAction(
    api.function.museumLocations.fetchMuseumsNearLocation,
  );

  // Trigger the Convex action: fetches from Overpass + Wikimedia, saves to DB.
  // No-ops if cached data is still fresh (7 day TTL).
  useEffect(() => {
    if (!params) return;
    setError(null);
    fetchAndCache({ lat: params.latitude, lng: params.longitude }).catch(
      (err) => {
        console.error("[useMuseumsQuery] fetch action failed:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      },
    );
  }, [params?.latitude, params?.longitude]);

  // Reactively read from DB — updates automatically when the action writes
  const rawMuseums = useConvexQuery(
    api.function.museumLocations.getMuseumsNearLocation,
    params ? { lat: params.latitude, lng: params.longitude } : "skip",
  );

  const museums: Museum[] = rawMuseums ?? [];

  // Backfill: fetch Wikimedia images client-side for any museums missing one,
  // and save them back to Convex. UI updates reactively as images are saved.
  useMuseumImageBackfill(museums);

  return {
    data: museums,
    isLoading: rawMuseums === undefined,
    error,
  };
};
