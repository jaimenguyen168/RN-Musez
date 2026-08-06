import { Alert, Platform } from "react-native";
import * as Linking from "expo-linking";

/** Opens the given coordinates in the platform's map app(s), prompting the
 * user to choose Apple Maps vs. Google Maps on iOS. */
export const openInMaps = (lat: number, lng: number, placeName: string) => {
  const label = encodeURIComponent(placeName);

  if (Platform.OS === "ios") {
    Alert.alert("Open in Maps", "Choose which map app to use:", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Apple Maps",
        onPress: async () => {
          try {
            await Linking.openURL(`maps://?q=${label}&ll=${lat},${lng}`);
          } catch (error) {
            console.error("Error opening Apple Maps:", error);
          }
        },
      },
      {
        text: "Google Maps",
        onPress: async () => {
          try {
            await Linking.openURL(
              `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
            );
          } catch (error) {
            console.error("Error opening Google Maps:", error);
          }
        },
      },
    ]);
  } else {
    Alert.alert("Open in Google Maps", `Open ${placeName} in Google Maps?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Open",
        onPress: async () => {
          try {
            await Linking.openURL(`geo:${lat},${lng}?q=${lat},${lng}(${label})`);
          } catch (error) {
            console.error("Error opening Google Maps:", error);
          }
        },
      },
    ]);
  }
};
