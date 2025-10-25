import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";

interface DiscoveryHeaderProps {
  place: string;
  onLocationPress: () => void;
  onChatPress: () => void;
  onBellPress: () => void;
}

const DiscoveryHeader = ({
  place,
  onLocationPress,
  onChatPress,
  onBellPress,
}: DiscoveryHeaderProps) => {
  return (
    <View className="px-6 py-4 flex-row items-center justify-between">
      <TouchableOpacity
        onPress={onLocationPress}
        className="flex-row items-center flex-1 mr-8"
      >
        <LinearGradient
          colors={[Colors.Primary, Colors.Secondary]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Ionicons name="location" size={18} color="white" />
        </LinearGradient>
        <View className="flex-1">
          <Text className="text-gray-400 tracking-wider font-light">
            Discover museums in
          </Text>
          <View className="flex-row items-center">
            <Text className="text-xl font-semibold line-clamp-1 tracking-wide">
              {place}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Right side - Action buttons */}
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={onChatPress}
          className="size-12 rounded-lg flex items-center justify-center mr-3"
        >
          <Ionicons
            name="chatbubble-ellipses"
            size={32}
            color={Colors.DarkGrey}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onBellPress}
          className="size-12 rounded-lg flex items-center justify-center"
        >
          <Ionicons name="notifications" size={32} color={Colors.DarkGrey} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DiscoveryHeader;
