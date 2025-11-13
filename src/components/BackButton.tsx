import { TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/provider/ThemeProvider";

interface BackButtonProps {
  onPress?: () => void;
}

const BackButton = ({ onPress }: BackButtonProps) => {
  const { isDark } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="justify-center items-center p-2"
    >
      <Ionicons
        name="chevron-back"
        size={24}
        color={isDark ? "#FFFFFF" : "#000000"}
      />
    </TouchableOpacity>
  );
};

export default BackButton;
