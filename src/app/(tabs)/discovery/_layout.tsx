import React from "react";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function DiscoveryLayout() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="map"
        options={{
          title: "Explore",
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              className="justify-center items-center px-2"
            >
              <Ionicons name="chevron-back" size={20} color="black" />
            </Pressable>
          ),
          headerSearchBarOptions: {
            onChangeText: (event) => {
              console.log(event.nativeEvent.text);
            },
          },
        }}
      />
    </Stack>
  );
}
