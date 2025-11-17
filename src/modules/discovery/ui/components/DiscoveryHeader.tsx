import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/provider/ThemeProvider";

interface DiscoveryHeaderProps {
  place: string;
  onLocationPress: () => void;
  rightComponent?: React.ReactNode;
  secondRightComponent?: React.ReactNode;
}

const DiscoveryHeader = ({
  place,
  onLocationPress,
  rightComponent,
  secondRightComponent,
}: DiscoveryHeaderProps) => {
  const { isDark } = useTheme();

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
          <Text className="text-secondary tracking-wider font-light">
            Discover museums in
          </Text>
          <View className="flex-row items-center">
            <Text className="text-2xl font-semibold line-clamp-1 tracking-wide text-main">
              {place}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Right side - Custom components only */}
      <View className="flex-row items-center gap-2">
        {secondRightComponent && <View>{secondRightComponent}</View>}
        {rightComponent && <View>{rightComponent}</View>}
      </View>
    </View>
  );
};

export default DiscoveryHeader;
