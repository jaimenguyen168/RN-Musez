import React from "react";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMuseumListStore } from "@/stores/museumListStore";

export default function MuseumsLayout() {
  const router = useRouter();
  const { title, clearMuseumList } = useMuseumListStore();

  const handleBackPress = () => {
    clearMuseumList();
    router.back();
  };

  return (
    <Stack>
      <Stack.Screen name="[museumId]" options={{ headerShown: false }} />
      <Stack.Screen
        name="index"
        options={{
          title,
          headerShadowVisible: false,
          headerBlurEffect: "regular",
          headerTransparent: true,
          headerLeft: () => (
            <Pressable
              onPress={handleBackPress}
              className="justify-center items-center px-2"
            >
              <Ionicons name="chevron-back" size={24} color="black" />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}
