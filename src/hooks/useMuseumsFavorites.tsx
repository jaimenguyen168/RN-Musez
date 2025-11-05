import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { Museum } from "@/types/museum";

export interface FetchMuseumsByIdsParams {
  museumIds: string[];
}

export interface MuseumsByIdsResponse {
  success: boolean;
  data: Museum[];
  total: number;
  error?: string;
}

const fetchMuseumsByIdsApi = async ({
  museumIds,
}: FetchMuseumsByIdsParams): Promise<Museum[]> => {
  if (!museumIds || museumIds.length === 0) {
    return [];
  }

  const response = await fetch("/api/museum-ids", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ placeIds: museumIds }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: MuseumsByIdsResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch museums");
  }

  return data.data;
};

export const useMuseumsFavorites = (
  params: FetchMuseumsByIdsParams | null,
  options?: Omit<UseQueryOptions<Museum[], Error>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: ["museums", "favorites", params?.museumIds],
    queryFn: () => fetchMuseumsByIdsApi(params!),
    enabled: !!params?.museumIds && params.museumIds.length > 0,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};
