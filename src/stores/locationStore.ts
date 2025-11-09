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
  address: string | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;

  // Actions
  setLocation: (location: Location.LocationObject) => void;
  setAddress: (address: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getCurrentLocation: () => Promise<Location.LocationObject | null>;
  getLocationAddress: (coords: LocationCoords) => Promise<string | null>;
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
      address: null,
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

      setAddress: (address: string | null) => {
        set({ address });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      getLocationAddress: async (
        coords: LocationCoords,
      ): Promise<string | null> => {
        try {
          const addressResponse = await Location.reverseGeocodeAsync({
            latitude: coords.latitude,
            longitude: coords.longitude,
          });

          if (addressResponse && addressResponse.length > 0) {
            const address = addressResponse[0];

            // Format the address - prioritize city and country/state
            let formattedAddress = "";

            if (address.city) {
              formattedAddress += address.city;
            } else if (address.district) {
              formattedAddress += address.district;
            } else if (address.subregion) {
              formattedAddress += address.subregion;
            }

            if (address.country) {
              if (formattedAddress) formattedAddress += ", ";

              // For US, show state instead of country if available
              if (address.country === "United States" && address.region) {
                formattedAddress += address.region;
              } else {
                formattedAddress += address.country;
              }
            }

            const finalAddress = formattedAddress || "Unknown Location";
            set({ address: finalAddress });
            return finalAddress;
          }

          return null;
        } catch (error) {
          console.error("Error getting address:", error);
          return null;
        }
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

          // Update store with location
          state.setLocation(location);

          // Get address for the location
          const coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          await state.getLocationAddress(coords);

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
          address: null,
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
      // Persist location data including address
      partialize: (state) => ({
        location: state.location,
        coords: state.coords,
        address: state.address,
        lastUpdated: state.lastUpdated,
      }),
    },
  ),
);

export const useLocation = () => useLocationStore((state) => state.location);
export const useCoords = () => useLocationStore((state) => state.coords);
export const useAddress = () => useLocationStore((state) => state.address);
export const useLocationLoading = () =>
  useLocationStore((state) => state.isLoading);
export const useLocationError = () => useLocationStore((state) => state.error);

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
export const useGetLocationAddress = () =>
  useLocationStore((state) => state.getLocationAddress);
