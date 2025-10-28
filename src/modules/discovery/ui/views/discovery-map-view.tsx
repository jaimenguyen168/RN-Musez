import { ActivityIndicator, Alert, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useEffect } from "react";
import { useLocationManager } from "@/hooks/useLocationManager";
import { useMuseumsQuery } from "@/hooks/useMuseumsQuery";

const DiscoveryMapView = () => {
  const {
    location,
    coords,
    isLoading: isLocationLoading,
    error: locationError,
    getCurrentLocation,
  } = useLocationManager(true);

  // Prepare params for the museum query
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
    refetch: refetchMuseums,
  } = useMuseumsQuery(museumsParams, {
    retry: 2,
    retryDelay: 1000,
  });

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

  return (
    <View className="flex-1 items-center justify-center">
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
        {museums.map((museum, index) => (
          <Marker
            key={museum.placeId || index}
            coordinate={{
              latitude: museum.geometry.location.lat,
              longitude: museum.geometry.location.lng,
            }}
            title={museum.name}
            description={`${museum.vicinity} • Rating: ${museum.rating || "N/A"}`}
            pinColor={"teal"}
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
