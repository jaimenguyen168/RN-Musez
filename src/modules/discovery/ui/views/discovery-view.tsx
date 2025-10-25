import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

const DiscoveryView = () => {
  const router = useRouter();
  console.log("In discovery");

  return (
    <View className="flex-1 items-center justify-center">
      <TouchableOpacity onPress={() => router.push("/discovery/map")}>
        <Text>Discovery</Text>
      </TouchableOpacity>
    </View>
  );
};
export default DiscoveryView;
