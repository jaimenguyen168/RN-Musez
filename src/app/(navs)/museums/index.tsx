import { View, Text, Pressable } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import MuseumListView from "@/modules/museums/ui/views/museum-list-view";
import { useMuseumListStore } from "@/stores/museumListStore";

export default function MuseumsScreen() {
  const router = useRouter();
  const { museums } = useMuseumListStore();

  const handleCardPress = (museumId: string) => {
    router.push(`/museums/${museumId}`);
  };

  if (museums.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-lg text-gray-500 text-center mb-4">
          No museums to display
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return <MuseumListView museums={museums} onCardPress={handleCardPress} />;
}
