// MapView.web.tsx - for web platform
import React from "react";
import { View, Text, ViewStyle } from "react-native";

interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface MapViewProps {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  initialRegion?: MapRegion;
  region?: MapRegion;
  showsUserLocation?: boolean;
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  rotateEnabled?: boolean;
  pitchEnabled?: boolean;
  [key: string]: any;
}

interface MarkerProps {
  children?: React.ReactNode;
  coordinate?: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  description?: string;
  pinColor?: string;
  [key: string]: any;
}

interface CalloutProps {
  children?: React.ReactNode;
  [key: string]: any;
}

export const MapView = ({
  children,
  style,
  initialRegion,
  region,
  showsUserLocation,
  scrollEnabled = true,
  zoomEnabled = true,
  rotateEnabled = true,
  pitchEnabled = true,
  ...props
}: MapViewProps) => {
  const displayRegion = region || initialRegion;

  return (
    <View
      style={[
        {
          backgroundColor: "#f8f9fa",
          justifyContent: "center",
          alignItems: "center",
          height: 300,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#e9ecef",
          position: "relative",
        },
        style,
      ]}
    >
      <Text style={{ color: "#6c757d", fontSize: 16, marginBottom: 8 }}>
        🗺️ Interactive Map
      </Text>
      {displayRegion && (
        <Text style={{ color: "#868e96", fontSize: 12 }}>
          📍 {displayRegion.latitude.toFixed(4)},{" "}
          {displayRegion.longitude.toFixed(4)}
        </Text>
      )}
      {showsUserLocation && (
        <View
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            backgroundColor: "#007bff",
            borderRadius: 12,
            width: 24,
            height: 24,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 12 }}>📍</Text>
        </View>
      )}
      {children}
    </View>
  );
};

export const Marker = ({
  children,
  coordinate,
  title,
  description,
  pinColor = "#ff4444",
  ...props
}: MarkerProps) => (
  <View
    style={{
      position: "absolute",
      backgroundColor: pinColor,
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: "white",
    }}
  >
    {children}
  </View>
);

export const Polygon = () => null;
export const Polyline = () => null;
export const Circle = () => null;
export const Callout = ({ children }: CalloutProps) => <View>{children}</View>;

export default MapView;
