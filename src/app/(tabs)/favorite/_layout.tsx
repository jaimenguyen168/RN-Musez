import React from "react";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function FavoriteLayout() {
  return (
    <Stack
      screenOptions={{
        headerRight: () => <View className="size-4 bg-red-600" />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Musez",
          headerShadowVisible: false,
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
