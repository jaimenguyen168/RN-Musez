import React from "react";
import { Stack } from "expo-router";

export default function ArtworkLayout() {
  return (
    <Stack>
      <Stack.Screen name="[artworkId]" options={{ headerShown: false }} />
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
