import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

interface SettingsItemProps {
  icon: string;
  title: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightComponent?: React.ReactNode;
}

const SettingsItem = ({
  icon,
  title,
  onPress,
  showArrow = true,
  rightComponent,
}: SettingsItemProps) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center justify-between py-4 px-6"
    activeOpacity={0.7}
  >
    <View className="flex-row items-center flex-1">
      <Ionicons name={icon as any} size={24} color="#6B7280" />
      <Text className="ml-4 text-base font-medium text-gray-900">{title}</Text>
    </View>
    {rightComponent ? (
      rightComponent
    ) : showArrow ? (
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    ) : null}
  </TouchableOpacity>
);

export default SettingsItem;
