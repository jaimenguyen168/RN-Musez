import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, Region } from "@/components/MapView";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocationManager } from "@/hooks/useLocationManager";
import { useMuseumsQuery } from "@/hooks/useMuseumsQuery";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRevenueCat } from "@/provider/RevenueCatProvider";
import { usePaywall } from "@/hooks/usePaywall";
import CitySearchBar from "@/modules/discovery/ui/components/CitySearchBar";
import MuseumMapCard from "@/modules/discovery/ui/components/MuseumMapCard";
import { isOpenNow } from "@/utils/openingHours";
import { useOrganicTheme } from "@/constants/organicTheme";
import { useTheme } from "@/provider/ThemeProvider";
import { Museum } from "../../../../../convex/convexTypes";

const DiscoveryMapView = () => {
  const router = useRouter();
  const { isProUser } = useRevenueCat();
  const { presentPaywall } = usePaywall();
  const c = useOrganicTheme();
  const { isDark } = useTheme();
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  const [selectedMuseum, setSelectedMuseum] = useState<Museum | null>(null);
  const [openOnly, setOpenOnly] = useState(false);
  const mapRef = useRef<MapView>(null);

  const [userSearchedCoordinates, setUserSearchedCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [museumFetchCoordinates, setMuseumFetchCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const {
    coords: userCurrentCoordinates,
    isLoading: isLocationLoading,
    error: locationError,
  } = useLocationManager(true);

  const coordinatesForMuseumQuery =
    museumFetchCoordinates || userCurrentCoordinates;

  const museumsQueryParameters = coordinatesForMuseumQuery
    ? {
        latitude: coordinatesForMuseumQuery.latitude,
        longitude: coordinatesForMuseumQuery.longitude,
      }
    : null;

  const {
    data: nearbyMuseums = [],
    isLoading: museumsLoading,
    error: museumsError,
  } = useMuseumsQuery(museumsQueryParameters);

  const handleMapRegionChangeComplete = (newRegion: Region) => {
    // Only allow map dragging to fetch new museums for Pro users
    if (!isProUser) {
      return;
    }

    setMuseumFetchCoordinates({
      latitude: newRegion.latitude,
      longitude: newRegion.longitude,
    });
  };

  useEffect(() => {
    if (museumsError) {
      Alert.alert("Error", museumsError.message);
    }
  }, [museumsError]);

  useEffect(() => {
    if (locationError) {
      Alert.alert("Location Error", "Unable to get your location");
    }
  }, [locationError]);

  const isLoadingData = isLocationLoading || museumsLoading;

  const visibleMuseums = openOnly
    ? nearbyMuseums.filter((museum) => isOpenNow(museum.openingHours))
    : nearbyMuseums;

  const handleMuseumMarkerPress = (museumId: string) => {
    router.push(`/museums/${encodeURIComponent(museumId)}`);
  };

  const handleToggleOpenOnly = (value: boolean) => {
    setOpenOnly(value);
    setSelectedMuseum(null);
  };

  const handleSearchToggle = async () => {
    if (!isProUser) {
      Alert.alert(
        "Pro Feature",
        "Searching other locations is only available for Pro users. Upgrade to Pro to unlock unlimited museum search worldwide.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Upgrade to Pro",
            style: "destructive",
            onPress: async () => {
              await presentPaywall({
                showSuccessAlert: true,
                onSuccess: () => {
                  console.log("User upgraded to Pro!");
                  // After successful upgrade, show the search bar
                  setIsSearchBarVisible(true);
                },
              });
            },
          },
        ],
      );
      return;
    }

    setIsSearchBarVisible(!isSearchBarVisible);
  };

  const handleLocationSearchSelect = (newCoordinates: {
    latitude: number;
    longitude: number;
  }) => {
    mapRef.current?.animateToRegion(
      {
        latitude: newCoordinates.latitude,
        longitude: newCoordinates.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      200,
    );

    setUserSearchedCoordinates(newCoordinates);
    setMuseumFetchCoordinates(newCoordinates);
    setSelectedMuseum(null);
  };

  const handleSearchBarClose = () => {
    setIsSearchBarVisible(false);
  };

  const handleClearLocationSearch = () => {
    setIsSearchBarVisible(false);
    setUserSearchedCoordinates(null);
    setMuseumFetchCoordinates(null);
    setSelectedMuseum(null);

    if (userCurrentCoordinates) {
      mapRef.current?.animateToRegion(
        {
          latitude: userCurrentCoordinates.latitude,
          longitude: userCurrentCoordinates.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        },
        200,
      );
    }
  };

  return (
    <View className="flex-1 items-center justify-center">
      <SafeAreaView
        edges={["top"]}
        pointerEvents="box-none"
        className="absolute top-0 left-0 right-0 z-10 gap-2.5 px-5 pt-3"
      >
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full items-center justify-center bg-organic-photo-btn"
          >
            <Ionicons name="chevron-back" size={18} color={c.text} />
          </TouchableOpacity>

          <View className="bg-organic-photo-btn rounded-full px-4 py-2">
            <Text className="font-heading text-organic text-[18px]">Explore</Text>
          </View>

          <View className="flex-row bg-organic-photo-btn rounded-full p-[3px] gap-[2px]">
            <TouchableOpacity
              onPress={() => handleToggleOpenOnly(false)}
              className={`px-3 py-1.5 rounded-full ${!openOnly ? "bg-organic-accent" : ""}`}
            >
              <Text className={`font-figtree-bold text-[12.5px] ${!openOnly ? "text-organic-accent-soft" : "text-organic"}`}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleToggleOpenOnly(true)}
              className={`px-3 py-1.5 rounded-full ${openOnly ? "bg-organic-accent" : ""}`}
            >
              <Text className={`font-figtree-bold text-[12.5px] ${openOnly ? "text-organic-accent-soft" : "text-organic"}`}>
                Open
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1 flex-row items-center justify-end gap-2">
            {userSearchedCoordinates && (
              <TouchableOpacity
                onPress={handleClearLocationSearch}
                className="w-9 h-9 rounded-full items-center justify-center bg-organic-photo-btn"
              >
                <Ionicons name="return-up-back" size={17} color={c.text} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleSearchToggle}
              className="w-9 h-9 rounded-full items-center justify-center bg-organic-photo-btn"
            >
              <Ionicons name={isSearchBarVisible ? "close" : "search"} size={17} color={c.text} />
            </TouchableOpacity>
          </View>
        </View>

        {isSearchBarVisible && (
          <CitySearchBar onLocationSelect={handleLocationSearchSelect} onClose={handleSearchBarClose} />
        )}
      </SafeAreaView>

      <MapView
        ref={mapRef}
        initialRegion={{
          latitude: coordinatesForMuseumQuery?.latitude || 39.9526,
          longitude: coordinatesForMuseumQuery?.longitude || -75.1652,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onRegionChangeComplete={handleMapRegionChangeComplete}
        onPress={() => setSelectedMuseum(null)}
        showsUserLocation={true}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        {visibleMuseums.map((museum, index) => {
          const isSelected = selectedMuseum?.osmId === museum.osmId;
          const isOpen = isOpenNow(museum.openingHours);
          const pinSize = isSelected ? 40 : 32;
          return (
            <Marker
              key={museum.osmId || index}
              coordinate={{
                latitude: museum.lat,
                longitude: museum.lng,
              }}
              tracksViewChanges={isSelected}
              onPress={(e) => {
                e.stopPropagation();
                setSelectedMuseum(museum);
              }}
            >
              <View
                accessible
                accessibilityLabel={`${museum.name}, ${isOpen ? "open now" : "closed"}`}
                style={{
                  width: pinSize,
                  height: pinSize,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isOpen ? c.accent : c.textFaint,
                  borderWidth: isSelected ? 3 : 2,
                  borderColor: c.bg,
                  ...(isDark
                    ? {
                        shadowColor: c.shadow,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 5,
                        elevation: 5,
                      }
                    : null),
                }}
              >
                <Ionicons name="business" size={isSelected ? 19 : 15} color={c.accentSoft} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {isLoadingData && (
        <View className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/20 p-4 rounded-full">
          <ActivityIndicator color="white" />
        </View>
      )}

      {selectedMuseum && (
        <View className="absolute left-4 right-4 bottom-[90px]">
          <MuseumMapCard
            museum={selectedMuseum}
            onPress={() => handleMuseumMarkerPress(selectedMuseum.osmId)}
          />
        </View>
      )}
    </View>
  );
};

export default DiscoveryMapView;
