import { View, Text, Pressable } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

export default function MuseumsScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center items-center">
      <Pressable onPress={() => router.back()}>
        <Text>Back</Text>
      </Pressable>
    </View>
  );
}
