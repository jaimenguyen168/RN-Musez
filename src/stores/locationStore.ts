import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { Alert } from "react-native";

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface LocationState {
  // State
  location: Location.LocationObject | null;
  coords: LocationCoords | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;

  // Actions
  setLocation: (location: Location.LocationObject) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getCurrentLocation: () => Promise<Location.LocationObject | null>;
  refreshLocation: () => Promise<void>;
  clearLocation: () => void;

  // Computed
  isLocationStale: () => boolean;
}

const LOCATION_STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      // Initial state
      location: null,
      coords: null,
      isLoading: false,
      error: null,
      lastUpdated: null,

      // Actions
      setLocation: (location: Location.LocationObject) => {
        set({
          location,
          coords: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          error: null,
          lastUpdated: Date.now(),
        });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      getCurrentLocation: async (): Promise<Location.LocationObject | null> => {
        const state = get();

        try {
          set({ isLoading: true, error: null });

          // Request permissions
          const { status } = await Location.requestForegroundPermissionsAsync();

          if (status !== "granted") {
            const errorMsg = "Location permission denied";
            set({ error: errorMsg, isLoading: false });
            Alert.alert("Error", errorMsg);
            return null;
          }

          // Get current position
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          console.log("Location obtained:", location);

          // Update store
          state.setLocation(location);
          set({ isLoading: false });

          return location;
        } catch (error) {
          console.error("Error getting location:", error);
          const errorMsg = "Failed to get current location";
          set({ error: errorMsg, isLoading: false });
          Alert.alert("Error", errorMsg);
          return null;
        }
      },

      refreshLocation: async (): Promise<void> => {
        await get().getCurrentLocation();
      },

      clearLocation: () => {
        set({
          location: null,
          coords: null,
          error: null,
          lastUpdated: null,
        });
      },

      // Computed
      isLocationStale: (): boolean => {
        const { lastUpdated } = get();
        if (!lastUpdated) return true;
        return Date.now() - lastUpdated > LOCATION_STALE_TIME;
      },
    }),
    {
      name: "location-store",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the location data, not loading states
      partialize: (state) => ({
        location: state.location,
        coords: state.coords,
        lastUpdated: state.lastUpdated,
      }),
    },
  ),
);

// Selector hooks for better performance
export const useLocation = () => useLocationStore((state) => state.location);
export const useCoords = () => useLocationStore((state) => state.coords);
export const useLocationLoading = () =>
  useLocationStore((state) => state.isLoading);
export const useLocationError = () => useLocationStore((state) => state.error);

// Remove useLocationActions entirely and add these individual hooks:
export const useGetCurrentLocation = () =>
  useLocationStore((state) => state.getCurrentLocation);
export const useRefreshLocation = () =>
  useLocationStore((state) => state.refreshLocation);
export const useClearLocation = () =>
  useLocationStore((state) => state.clearLocation);
export const useSetLocation = () =>
  useLocationStore((state) => state.setLocation);
export const useIsLocationStale = () =>
  useLocationStore((state) => state.isLocationStale);
