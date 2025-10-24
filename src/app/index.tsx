import { ActivityIndicator, Alert, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { Museum } from "@/types";

export default function Index() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [museums, setMuseums] = useState<Museum[]>([]);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Error", "Location permission denied");
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      return location;
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get current location");
      return null;
    }
  };

  const fetchMuseums = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `/api/museums?lat=${latitude}&lng=${longitude}`,
      );
      const data = await response.json();

      if (data.success) {
        setMuseums(data.data);
      } else {
        Alert.alert("Error", data.error || "Failed to fetch museums");
      }
    } catch (error) {
      console.error("Error fetching museums:", error);
      Alert.alert("Error", "Failed to fetch museums");
    }
  };

  const loadLocationAndMuseums = async () => {
    setLoading(true);

    try {
      const currentLocation = await getCurrentLocation();

      if (currentLocation?.coords) {
        await fetchMuseums(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
        );
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocationAndMuseums();
  }, []);

  return (
    <View className="flex-1 items-center justify-center">
      <MapView
        initialRegion={{
          latitude: location?.coords.latitude || 39.9526,
          longitude: location?.coords.longitude || -75.1652,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        {museums.map((museum, index) => (
          <Marker
            key={museum.place_id || index}
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
}
