import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { MuseumDetails } from "@/types";

export interface FetchMuseumDetailsParams {
  museumId: string;
}

export interface MuseumDetailsResponse {
  success: boolean;
  data: MuseumDetails;
  error?: string;
}

const fetchMuseumDetailsApi = async ({
  museumId,
}: FetchMuseumDetailsParams): Promise<MuseumDetails> => {
  const response = await fetch(`/api/museum-details?place_id=${museumId}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: MuseumDetailsResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch museum details");
  }

  return data.data;
};

export const useMuseumDetailsQuery = (
  museumId: string | null,
  options?: Omit<UseQueryOptions<MuseumDetails, Error>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: ["museum-details", museumId],
    queryFn: () => fetchMuseumDetailsApi({ museumId: museumId! }),
    enabled: !!museumId,
    staleTime: 10 * 60 * 1000, // 10 minutes - museum details change less frequently
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
    ...options,
  });
};
