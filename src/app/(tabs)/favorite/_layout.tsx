import React from "react";
import { Stack } from "expo-router";

export default function FavoriteLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Favorites",
          headerShadowVisible: false,
          headerBlurEffect: "regular",
          headerTransparent: true,
        }}
      />
    </Stack>
  );
}
