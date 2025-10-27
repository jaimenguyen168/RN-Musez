import { useEffect } from "react";
import {
  useLocation,
  useCoords,
  useLocationLoading,
  useLocationError,
  useGetCurrentLocation,
  useRefreshLocation,
  useClearLocation,
  useIsLocationStale,
} from "@/stores/locationStore";

interface UseLocationResult {
  location: any;
  coords: { latitude: number; longitude: number } | null;
  isLoading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<any>;
  refreshLocation: () => Promise<void>;
  clearLocation: () => void;
  isLocationStale: () => boolean;
}

export const useLocationManager = (
  autoFetch: boolean = false,
): UseLocationResult => {
  const location = useLocation();
  const coords = useCoords();
  const isLoading = useLocationLoading();
  const error = useLocationError();
  const getCurrentLocation = useGetCurrentLocation();
  const refreshLocation = useRefreshLocation();
  const clearLocation = useClearLocation();
  const isLocationStale = useIsLocationStale();

  useEffect(() => {
    if (autoFetch && (!location || isLocationStale())) {
      getCurrentLocation().then((r) => console.log(r));
    }
  }, [autoFetch, location, isLocationStale, getCurrentLocation]);

  return {
    location,
    coords,
    isLoading,
    error,
    getCurrentLocation,
    refreshLocation,
    clearLocation,
    isLocationStale,
  };
};
