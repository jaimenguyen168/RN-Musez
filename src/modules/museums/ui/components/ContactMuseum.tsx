import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as Linking from "expo-linking";
import { Ionicons } from "@expo/vector-icons";

interface ContactMuseumProps {
  phoneNumber?: string;
  website?: string;
  showTitle?: boolean;
  title?: string;
  iconColor?: string;
}

const ContactMuseum = ({
  phoneNumber,
  website,
  showTitle = true,
  title = "Contact",
  iconColor = "#6366F1",
}: ContactMuseumProps) => {
  const handlePhonePress = async () => {
    if (phoneNumber) {
      try {
        await Linking.openURL(`tel:${phoneNumber}`);
      } catch (error) {
        console.error("Error making phone call:", error);
      }
    }
  };

  const handleWebsitePress = async () => {
    if (website) {
      try {
        await Linking.openURL(website);
      } catch (error) {
        console.error("Error opening website:", error);
      }
    }
  };

  // Don't render if no contact info is provided
  if (!phoneNumber && !website) {
    return null;
  }

  return (
    <View className="p-6">
      {showTitle && (
        <View className="flex-row items-center mb-4">
          <Ionicons name="accessibility" size={20} color={iconColor} />
          <Text className="text-lg font-semibold ml-2 text-main">{title}</Text>
        </View>
      )}

      {phoneNumber && (
        <TouchableOpacity
          className="flex-row items-center p-4 rounded-xl mb-3 bg-surface"
          onPress={handlePhonePress}
        >
          <Ionicons name="call-outline" size={20} color={iconColor} />
          <Text className="ml-3 text-base font-medium text-main">
            {phoneNumber}
          </Text>
        </TouchableOpacity>
      )}

      {website && (
        <TouchableOpacity
          className="flex-row items-center p-4 rounded-xl bg-surface"
          onPress={handleWebsitePress}
        >
          <Ionicons name="globe-outline" size={20} color={iconColor} />
          <Text
            className="ml-3 text-base font-medium flex-1 text-main"
            numberOfLines={1}
          >
            Visit Website
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ContactMuseum;
