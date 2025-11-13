import React, { useEffect, useRef } from "react";
import { View, TouchableOpacity, Animated } from "react-native";
import { useTheme } from "@/provider/ThemeProvider";

interface TabsPickerProps {
  options: [string, string];
  selectedValue: string;
  onSelectionChange: (value: string) => void;
  width: number;
}

const TabsPicker = ({
  options,
  selectedValue,
  onSelectionChange,
  width,
}: TabsPickerProps) => {
  const { isDark } = useTheme();
  const [leftOption, rightOption] = options;
  const isLeftSelected = selectedValue === leftOption;
  const buttonWidth = width / 2;

  const slideAnimation = useRef(
    new Animated.Value(isLeftSelected ? 0 : buttonWidth),
  ).current;

  const leftTextOpacity = useRef(
    new Animated.Value(isLeftSelected ? 1 : 0.6),
  ).current;

  const rightTextOpacity = useRef(
    new Animated.Value(!isLeftSelected ? 1 : 0.6),
  ).current;

  useEffect(() => {
    const toValue = isLeftSelected ? 0 : buttonWidth;

    Animated.spring(slideAnimation, {
      toValue,
      useNativeDriver: false,
    }).start();

    Animated.parallel([
      Animated.timing(leftTextOpacity, {
        toValue: isLeftSelected ? 1 : 0.6,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(rightTextOpacity, {
        toValue: !isLeftSelected ? 1 : 0.6,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [
    selectedValue,
    slideAnimation,
    leftTextOpacity,
    rightTextOpacity,
    isLeftSelected,
    buttonWidth,
  ]);

  const handleLeftPress = () => {
    if (selectedValue !== leftOption) {
      onSelectionChange(leftOption);
    }
  };

  const handleRightPress = () => {
    if (selectedValue !== rightOption) {
      onSelectionChange(rightOption);
    }
  };

  return (
    <View className="mb-4" style={{ width }}>
      <View className="bg-surface rounded-3xl shadow-sm relative overflow-hidden">
        {/* Sliding Background Indicator */}
        <Animated.View
          style={{
            position: "absolute",
            left: slideAnimation,
            width: buttonWidth - 8,
            height: 32,
            backgroundColor: isDark ? "#111827" : "white",
            borderRadius: 24,
            marginVertical: 4,
            marginHorizontal: 4,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2,
          }}
        />

        {/* Button Container */}
        <View className="flex-row">
          {/* Left Button */}
          <TouchableOpacity
            onPress={handleLeftPress}
            style={{ width: buttonWidth }}
            className="py-3 px-4 justify-center items-center"
            activeOpacity={0.7}
          >
            <Animated.Text
              style={{
                opacity: leftTextOpacity,
                fontSize: 16,
                fontWeight: "600",
                color: isDark ? "#FFFFFF" : "#1F2937",
              }}
            >
              {leftOption}
            </Animated.Text>
          </TouchableOpacity>

          {/* Right Button */}
          <TouchableOpacity
            onPress={handleRightPress}
            style={{ width: buttonWidth }}
            className="py-3 px-4 justify-center items-center"
            activeOpacity={0.7}
          >
            <Animated.Text
              style={{
                opacity: rightTextOpacity,
                fontSize: 16,
                fontWeight: "600",
                color: isDark ? "#FFFFFF" : "#1F2937",
              }}
            >
              {rightOption}
            </Animated.Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default TabsPicker;
