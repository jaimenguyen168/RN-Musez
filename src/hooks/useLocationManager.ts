import { useEffect } from "react";
import {
  useLocation,
  useCoords,
  useAddress,
  useLocationLoading,
  useLocationError,
  useGetCurrentLocation,
  useRefreshLocation,
  useClearLocation,
  useIsLocationStale,
  useGetLocationAddress,
} from "@/stores/locationStore";

interface UseLocationResult {
  location: any;
  coords: { latitude: number; longitude: number } | null;
  address: string | null;
  isLoading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<any>;
  refreshLocation: () => Promise<void>;
  clearLocation: () => void;
  isLocationStale: () => boolean;
  getLocationAddress: (coords: {
    latitude: number;
    longitude: number;
  }) => Promise<string | null>;
}

export const useLocationManager = (
  autoFetch: boolean = false,
): UseLocationResult => {
  const location = useLocation();
  const coords = useCoords();
  const address = useAddress();
  const isLoading = useLocationLoading();
  const error = useLocationError();
  const getCurrentLocation = useGetCurrentLocation();
  const refreshLocation = useRefreshLocation();
  const clearLocation = useClearLocation();
  const isLocationStale = useIsLocationStale();
  const getLocationAddress = useGetLocationAddress();

  useEffect(() => {
    if (autoFetch && (!location || isLocationStale())) {
      getCurrentLocation().then((r) => console.log("Location fetched:", r));
    }
  }, [autoFetch, location, isLocationStale, getCurrentLocation]);

  return {
    location,
    coords,
    address,
    isLoading,
    error,
    getCurrentLocation,
    refreshLocation,
    clearLocation,
    isLocationStale,
    getLocationAddress,
  };
};
