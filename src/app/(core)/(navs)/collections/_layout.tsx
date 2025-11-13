import React from "react";
import { Stack } from "expo-router";

export default function CollectionLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
