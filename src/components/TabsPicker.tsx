import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useTheme } from "@/provider/ThemeProvider";

interface TabsPickerProps {
  options: [string, string];
  selectedValue: string;
  onSelectionChange: (value: string) => void;
}

const TabsPicker = ({ options, selectedValue, onSelectionChange }: TabsPickerProps) => {
  const [leftOption, rightOption] = options;
  const isLeftSelected = selectedValue === leftOption;
  const [containerWidth, setContainerWidth] = useState(0);
  const { isDark } = useTheme();

  const selectedColor = isDark ? "#F9FAFB" : "#111827";
  const unselectedColor = "#9CA3AF";

  const slideAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (containerWidth > 0) {
      const buttonWidth = (containerWidth - 8) / 2;
      Animated.spring(slideAnimation, {
        toValue: isLeftSelected ? 0 : buttonWidth,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedValue, isLeftSelected, containerWidth]);

  return (
    <View className="w-full">
      <View
        className="bg-surface rounded-full overflow-hidden"
        style={{ position: "relative", padding: 4 }}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        {/* Sliding indicator */}
        <Animated.View
          className="absolute bg-app rounded-3xl"
          style={{
            top: 4,
            bottom: 4,
            left: 4,
            width: containerWidth > 0 ? (containerWidth - 8) / 2 : "50%",
            transform: [{ translateX: slideAnimation }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
            elevation: 2,
          }}
        />

        <View className="flex-row relative z-10">
          <TouchableOpacity
            onPress={() => selectedValue !== leftOption && onSelectionChange(leftOption)}
            className="flex-1 py-2 px-4 justify-center items-center"
            activeOpacity={0.7}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: isLeftSelected ? selectedColor : unselectedColor,
              }}
            >
              {leftOption}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => selectedValue !== rightOption && onSelectionChange(rightOption)}
            className="flex-1 py-2 px-4 justify-center items-center"
            activeOpacity={0.7}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: isLeftSelected ? unselectedColor : selectedColor,
              }}
            >
              {rightOption}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default TabsPicker;
