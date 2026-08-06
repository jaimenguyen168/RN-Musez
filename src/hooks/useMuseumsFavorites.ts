import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Museum } from "../../convex/convexTypes";

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
    return { data: [] as Museum[], isLoading: false, error: null as Error | null };
  }

  if (results === undefined) {
    return { data: [] as Museum[], isLoading: true, error: null as Error | null };
  }

  const museums: Museum[] = results.filter((m): m is Museum => m !== null);

  return { data: museums, isLoading: false, error: null as Error | null };
};
