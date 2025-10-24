import { View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useEffect, useState } from "react";
import * as Location from "expo-location";

export default function Index() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
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
        <Marker
          coordinate={{ latitude: 39.9526, longitude: -75.1652 }}
          title={"City hall"}
          pinColor={"teal"}
        />
      </MapView>
    </View>
  );
}
