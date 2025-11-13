import {
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import MapView, { Marker } from "@/components/MapView";
import React, { useEffect, useState, useMemo } from "react";
import { useLocationManager } from "@/hooks/useLocationManager";
import { useMuseumsQuery } from "@/hooks/useMuseumsQuery";
import BlurNavigationHeader from "@/components/BlurNavigationHeader";
import BackButton from "@/components/BackButton";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/provider/ThemeProvider";

const DiscoveryMapView = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    coords,
    isLoading: isLocationLoading,
    error: locationError,
  } = useLocationManager(true);

  const museumsParams = coords
    ? {
        latitude: coords.latitude,
        longitude: coords.longitude,
      }
    : null;

  const {
    data: museums = [],
    isLoading: museumsLoading,
    error: museumsError,
  } = useMuseumsQuery(museumsParams, {
    retry: 2,
    retryDelay: 1000,
  });

  // Filter museums based on search query
  const filteredMuseums = useMemo(() => {
    if (!searchQuery.trim()) return museums;

    return museums.filter((museum) =>
      museum.name.toLowerCase().includes(searchQuery.toLowerCase().trim()),
    );
  }, [museums, searchQuery]);

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

  const loading = isLocationLoading || museumsLoading;

  const handleMarkerPress = (museumId: string) => {
    router.push(`/museums/${museumId}`);
  };

  const handleSearchToggle = () => {
    setShowSearchBar(!showSearchBar);
    if (showSearchBar) {
      setSearchQuery("");
    }
  };

  const rightComponent = (
    <TouchableOpacity
      onPress={handleSearchToggle}
      className="justify-center items-center p-2"
    >
      <Ionicons
        name={showSearchBar ? "close" : "search"}
        size={24}
        color={isDark ? "white" : "black"}
      />
    </TouchableOpacity>
  );

  const searchBarComponent = showSearchBar ? (
    <View className="pb-6">
      <View className="rounded-2xl px-4 py-3 flex-row items-center bg-card border border-soft">
        <Ionicons name="search" size={20} color="#6B7280" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search museums..."
          placeholderTextColor="#9CA3AF"
          className="flex-1 ml-3 text-gray-900 text-base"
          autoFocus={true}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")} className="ml-2">
            <Ionicons name="close-circle" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  ) : null;

  return (
    <View className="flex-1 items-center justify-center">
      <BlurNavigationHeader
        title={"Explore"}
        leftComponent={<BackButton onPress={() => router.back()} />}
        rightComponent={rightComponent}
        bottomComponent={searchBarComponent}
        height={showSearchBar ? 165 : 100}
        blurType={isDark ? "dark" : "light"}
      />
      <MapView
        initialRegion={{
          latitude: coords?.latitude || 39.9526,
          longitude: coords?.longitude || -75.1652,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        region={
          coords
            ? {
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }
            : undefined
        }
        showsUserLocation={true}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        {filteredMuseums.map((museum, index) => (
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
            onPress={() => handleMarkerPress(museum.placeId)}
          />
        ))}
      </MapView>

      {loading && (
        <View className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/20 p-4 rounded-full">
          <ActivityIndicator color="white" />
        </View>
      )}
    </View>
  );
};

export default DiscoveryMapView;
