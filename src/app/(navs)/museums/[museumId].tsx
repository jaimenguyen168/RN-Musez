import { View, Text } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";

export default function MuseumDetailScreen() {
  const { museumId } = useLocalSearchParams();

  console.log("Museum ID:", museumId); // Debug log

  return (
    <View className="flex-1 items-center justify-center">
      <Text>Museum ID: {museumId}</Text>
    </View>
  );
}
