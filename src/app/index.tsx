import { View } from "react-native";
import MapView from "react-native-maps";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center">
      <MapView
        initialRegion={{
          latitude: 39.9526,
          longitude: -75.1652,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </View>
  );
}
