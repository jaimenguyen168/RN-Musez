import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AboutMuseumProps {
  content: string;
  title?: string;
  showTitle?: boolean;
  iconColor?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
}

const AboutMuseum = ({
  content,
  title = "About",
  showTitle = true,
  iconColor = "#6366F1",
  iconName = "information-circle",
}: AboutMuseumProps) => {
  if (!content) {
    return null;
  }

  return (
    <View className="p-6">
      {showTitle && (
        <View className="flex-row items-center mb-4">
          <Ionicons name={iconName} size={20} color={iconColor} />
          <Text className="text-lg font-semibold ml-2 text-gray-900">
            {title}
          </Text>
        </View>
      )}
      <Text className="text-base leading-7 text-gray-700">{content}</Text>
    </View>
  );
};
export default AboutMuseum;
