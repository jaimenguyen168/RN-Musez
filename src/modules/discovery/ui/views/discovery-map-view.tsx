import { ActivityIndicator, Alert, TouchableOpacity, View } from "react-native";
import MapView, { Marker, Region } from "@/components/MapView";
import React, { useEffect, useRef, useState } from "react";
import { useLocationManager } from "@/hooks/useLocationManager";
import { useMuseumsQuery } from "@/hooks/useMuseumsQuery";
import BlurNavigationHeader from "@/components/BlurNavigationHeader";
import BackButton from "@/components/BackButton";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/provider/ThemeProvider";
import CitySearchBar from "@/modules/discovery/ui/components/CitySearchBar";

const DiscoveryMapView = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
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
  } = useMuseumsQuery(museumsQueryParameters, {
    retry: 2,
    retryDelay: 1000,
  });

  const handleMapRegionChangeComplete = (newRegion: Region) => {
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

  const handleMuseumMarkerPress = (museumId: string) => {
    router.push(`/museums/${museumId}`);
  };

  const handleSearchToggle = () => {
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
  };

  const handleSearchBarClose = () => {
    setIsSearchBarVisible(false);
  };

  const handleClearLocationSearch = () => {
    setIsSearchBarVisible(false);
    setUserSearchedCoordinates(null);
    setMuseumFetchCoordinates(null);

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

  const searchToggleButton = (
    <TouchableOpacity
      onPress={handleSearchToggle}
      className="justify-center items-center p-2"
    >
      <Ionicons
        name={isSearchBarVisible ? "close" : "search"}
        size={24}
        color={isDark ? "white" : "black"}
      />
    </TouchableOpacity>
  );

  const clearSearchButton = userSearchedCoordinates ? (
    <TouchableOpacity
      onPress={handleClearLocationSearch}
      className="justify-center items-center p-2"
    >
      <Ionicons
        name="return-up-back"
        size={24}
        color={isDark ? "white" : "black"}
      />
    </TouchableOpacity>
  ) : null;

  const citySearchBarComponent = isSearchBarVisible ? (
    <CitySearchBar
      onLocationSelect={handleLocationSearchSelect}
      onClose={handleSearchBarClose}
    />
  ) : null;

  return (
    <View className="flex-1 items-center justify-center">
      <BlurNavigationHeader
        title={"Explore"}
        leftComponent={<BackButton onPress={() => router.back()} />}
        rightComponent={searchToggleButton}
        secondRightComponent={clearSearchButton}
        bottomComponent={citySearchBarComponent}
        blurType={isDark ? "dark" : "light"}
      />
      <MapView
        ref={mapRef}
        initialRegion={{
          latitude: coordinatesForMuseumQuery?.latitude || 39.9526,
          longitude: coordinatesForMuseumQuery?.longitude || -75.1652,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onRegionChangeComplete={handleMapRegionChangeComplete}
        showsUserLocation={true}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        {nearbyMuseums.map((museum, index) => (
          <Marker
            key={museum.placeId || index}
            coordinate={{
              latitude: museum.geometry.location.lat,
              longitude: museum.geometry.location.lng,
            }}
            title={museum.name}
            description={`${museum.vicinity} • Rating: ${museum.rating || "N/A"}`}
            pinColor={
              (museum.openingHours?.openNow ??
              museum.currentOpeningHours?.openNow)
                ? "purple"
                : "gray"
            }
            onPress={() => handleMuseumMarkerPress(museum.placeId)}
          />
        ))}
      </MapView>

      {isLoadingData && (
        <View className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/20 p-4 rounded-full">
          <ActivityIndicator color="white" />
        </View>
      )}
    </View>
  );
};

export default DiscoveryMapView;
