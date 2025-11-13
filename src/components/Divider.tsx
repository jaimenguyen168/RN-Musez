import { View } from "react-native";
import React from "react";

const Divider = ({ className = "mx-6" }: { className?: string }) => {
  return <View className={`flex-1 h-px bg-divider ${className}`} />;
};
export default Divider;
