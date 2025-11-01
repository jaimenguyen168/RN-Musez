import React, { ReactNode } from "react";
import { Text, StatusBar, View } from "react-native";
import { BlurView } from "expo-blur";

interface BlurNavigationHeaderProps {
  title?: string;
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  secondRightComponent?: ReactNode;
  blurIntensity?: number;
  blurType?: "light" | "dark" | "regular";
  height?: number;
  titleStyle?: string;
  containerStyle?: string;
}

const BlurNavigationHeader = ({
  title = "",
  leftComponent,
  rightComponent,
  secondRightComponent,
  blurIntensity = 80,
  blurType = "light",
  height = 120,
  titleStyle = "text-xl font-bold text-black tracking-wide",
  containerStyle = "",
}: BlurNavigationHeaderProps) => {
  return (
    <View className={`absolute top-0 left-0 right-0 z-10 ${containerStyle}`}>
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
          justifyContent: "space-between",
          paddingBottom: 18,
          paddingHorizontal: 16,
          height: height,
        }}
      >
        {/* Left Component */}
        <View className="flex-1 justify-center items-start">
          {leftComponent}
        </View>

        {/* Title (Center) */}
        <View className="flex-1 justify-center items-center p-2">
          {title && <Text className={titleStyle}>{title}</Text>}
        </View>

        {/* Right Components */}
        <View className="flex-1 justify-end items-end flex-row gap-2">
          {secondRightComponent && <View>{secondRightComponent}</View>}
          {rightComponent && <View>{rightComponent}</View>}
        </View>
      </BlurView>
    </View>
  );
};
export default BlurNavigationHeader;
