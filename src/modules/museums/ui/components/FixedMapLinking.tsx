import React from "react";
import { View, Text, TouchableOpacity, Platform, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "@/components/MapView";
import * as Linking from "expo-linking";

interface FixedMapLinkingProps {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
  markerColor?: string;
  height?: number;
  showTitle?: boolean;
}

const FixedMapLinking = ({
  latitude,
  longitude,
  name,
  address,
  markerColor = "#6366F1",
  height = 192,
  showTitle = true,
}: FixedMapLinkingProps) => {
  const openInMaps = (lat: number, lng: number, placeName: string) => {
    const label = encodeURIComponent(placeName);

    if (Platform.OS === "ios") {
      Alert.alert("Open in Maps", "Choose which map app to use:", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Apple Maps",
          onPress: async () => {
            try {
              const appleUrl = `maps://?q=${label}&ll=${lat},${lng}`;
              await Linking.openURL(appleUrl);
            } catch (error) {
              console.error("Error opening Apple Maps:", error);
            }
          },
        },
        {
          text: "Google Maps",
          onPress: async () => {
            try {
              const googleUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
              await Linking.openURL(googleUrl);
            } catch (error) {
              console.error("Error opening Google Maps:", error);
            }
          },
        },
      ]);
    } else {
      Alert.alert("Open in Google Maps", `Open ${placeName} in Google Maps?`, [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Open",
          onPress: async () => {
            try {
              const androidUrl = `geo:${lat},${lng}?q=${lat},${lng}(${label})`;
              await Linking.openURL(androidUrl);
            } catch (error) {
              console.error("Error opening Google Maps:", error);
            }
          },
        },
      ]);
    }
  };

  return (
    <View className="p-6">
      {showTitle && (
        <View className="flex-row items-center mb-4">
          <Ionicons name="location" size={20} color="#6366F1" />
          <Text className="text-lg font-semibold ml-2 text-gray-900">
            Location
          </Text>
        </View>
      )}

      <Text className="text-gray-600 mb-4 leading-relaxed">{address}</Text>

      {/* Map View */}
      <TouchableOpacity
        onPress={() => openInMaps(latitude, longitude, name)}
        className="rounded-2xl overflow-hidden shadow-lg"
        style={{ height }}
      >
        <MapView
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          style={{
            width: "100%",
            height: "100%",
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          <Marker
            coordinate={{
              latitude,
              longitude,
            }}
            title={name}
            description={address}
            pinColor={markerColor}
          />
        </MapView>
      </TouchableOpacity>
    </View>
  );
};

export default FixedMapLinking;
