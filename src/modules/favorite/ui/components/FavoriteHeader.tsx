import React from "react";
import {
  Text,
  Pressable,
  StatusBar,
  View,
  TouchableOpacity,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

interface FavoriteHeaderProps {
  onAddPress: () => void;
  title?: string;
  blurIntensity?: number;
  blurType?: "light" | "dark" | "regular";
}

const FavoriteHeader = ({
  onAddPress,
  title = "Favorite",
  blurIntensity = 80,
  blurType = "light",
}: FavoriteHeaderProps) => {
  return (
    <View className="absolute top-0 left-0 right-0 z-10">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <BlurView
        intensity={blurIntensity}
        tint={blurType}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: 24,
          height: 120,
        }}
      >
        <Text className="text-xl font-bold text-black tracking-wide">
          {title}
        </Text>

        <TouchableOpacity
          onPress={onAddPress}
          className="justify-center items-center px-2 absolute right-6 bottom-7"
        >
          <Ionicons name="add" size={28} color="black" />
        </TouchableOpacity>
      </BlurView>
    </View>
  );
};

export default FavoriteHeader;
