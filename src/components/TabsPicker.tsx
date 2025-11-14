import React, { useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, Animated } from "react-native";

interface TabsPickerProps {
  options: [string, string];
  selectedValue: string;
  onSelectionChange: (value: string) => void;
}

const TabsPicker = ({
  options,
  selectedValue,
  onSelectionChange,
}: TabsPickerProps) => {
  const [leftOption, rightOption] = options;
  const isLeftSelected = selectedValue === leftOption;
  const [containerWidth, setContainerWidth] = useState(0);

  const slideAnimation = useRef(new Animated.Value(0)).current;

  const leftTextOpacity = useRef(
    new Animated.Value(isLeftSelected ? 1 : 0.6),
  ).current;

  const rightTextOpacity = useRef(
    new Animated.Value(!isLeftSelected ? 1 : 0.6),
  ).current;

  useEffect(() => {
    if (containerWidth > 0) {
      const buttonWidth = (containerWidth - 8) / 2;
      const toValue = isLeftSelected ? 0 : buttonWidth;

      Animated.spring(slideAnimation, {
        toValue,
        useNativeDriver: true,
      }).start();
    }

    Animated.parallel([
      Animated.timing(leftTextOpacity, {
        toValue: isLeftSelected ? 1 : 0.6,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(rightTextOpacity, {
        toValue: !isLeftSelected ? 1 : 0.6,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    selectedValue,
    slideAnimation,
    leftTextOpacity,
    rightTextOpacity,
    isLeftSelected,
    containerWidth,
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

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  return (
    <View className="w-full">
      <View
        className="bg-surface rounded-full shadow-sm overflow-hidden"
        style={{ position: "relative", padding: 4 }}
        onLayout={handleLayout}
      >
        {/* Sliding Background Indicator */}
        <Animated.View
          className="absolute bg-app rounded-3xl shadow-sm"
          style={{
            top: 4,
            bottom: 4,
            left: 4,
            width: containerWidth > 0 ? (containerWidth - 8) / 2 : "50%",
            transform: [{ translateX: slideAnimation }],
          }}
        />

        {/* Button Container */}
        <View className="flex-row relative z-10">
          <TouchableOpacity
            onPress={handleLeftPress}
            className="flex-1 py-2 px-4 justify-center items-center"
            activeOpacity={0.7}
          >
            <Animated.Text
              className="text-base font-semibold text-main"
              style={{ opacity: leftTextOpacity }}
            >
              {leftOption}
            </Animated.Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRightPress}
            className="flex-1 py-2 px-4 justify-center items-center"
            activeOpacity={0.7}
          >
            <Animated.Text
              className="text-base font-semibold text-main"
              style={{ opacity: rightTextOpacity }}
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
