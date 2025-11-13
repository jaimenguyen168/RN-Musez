import React from "react";
import { Stack } from "expo-router";

export default function MuseumsLayout() {
  return (
    <Stack>
      <Stack.Screen name="[museumId]" options={{ headerShown: false }} />
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
