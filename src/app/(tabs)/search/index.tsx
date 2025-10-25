import { Text, ScrollView } from "react-native";
import React from "react";

export default function SearchScreen() {
  return (
    <ScrollView className="flex-1">
      {Array.from({ length: 100 }, (_, i) => i + 1).map((number) => (
        <Text
          key={number}
          className="text-center py-2 text-lg border-b border-gray-300"
        >
          {number}
        </Text>
      ))}
    </ScrollView>
  );
}
