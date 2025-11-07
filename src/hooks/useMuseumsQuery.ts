import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { Museum } from "@/types/museum";

export interface FetchMuseumsParams {
  latitude: number;
  longitude: number;
}

export interface MuseumsResponse {
  success: boolean;
  data: Museum[];
  error?: string;
}

const fetchMuseumsApi = async ({
  latitude,
  longitude,
}: FetchMuseumsParams): Promise<Museum[]> => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_BASE_URL}/api/museums?lat=${latitude}&lng=${longitude}`,
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: MuseumsResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch museums");
  }

  return data.data;
};

export const useMuseumsQuery = (
  params: FetchMuseumsParams | null,
  options?: Omit<UseQueryOptions<Museum[], Error>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: ["museums", params?.latitude, params?.longitude],
    queryFn: () => fetchMuseumsApi(params!),
    enabled: !!params?.latitude && !!params?.longitude,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};
