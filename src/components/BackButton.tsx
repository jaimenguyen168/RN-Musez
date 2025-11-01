import { TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

interface BackButtonProps {
  onPress?: () => void;
}

const BackButton = ({ onPress }: BackButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="justify-center items-center p-2"
    >
      <Ionicons name="chevron-back" size={24} color="black" />
    </TouchableOpacity>
  );
};
export default BackButton;
