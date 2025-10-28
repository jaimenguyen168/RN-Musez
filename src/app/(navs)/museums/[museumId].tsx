import React from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import MuseumDetailsView from "@/modules/museums/ui/views/museum-details-view";

export default function MuseumDetailScreen() {
  const { museumId } = useLocalSearchParams();

  if (!museumId) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-red-500 text-center">No museum ID provided</Text>
      </View>
    );
  }

  return <MuseumDetailsView museumId={museumId as string} />;
}
