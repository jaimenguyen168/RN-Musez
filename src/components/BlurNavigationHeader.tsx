import React, { ReactNode } from "react";
import { Text, StatusBar, View } from "react-native";
import { BlurView } from "expo-blur";

interface BlurNavigationHeaderProps {
  title?: string;
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  secondRightComponent?: ReactNode;
  bottomComponent?: ReactNode;
  blurIntensity?: number;
  blurType?: "light" | "dark" | "regular";
  height?: number;
  titleStyle?: string;
  containerStyle?: string;
  bottomComponentStyle?: string;
}

const BlurNavigationHeader = ({
  title = "",
  leftComponent,
  rightComponent,
  secondRightComponent,
  bottomComponent,
  blurIntensity = 80,
  blurType = "light",
  height = 100,
  titleStyle = "text-xl font-bold text-black tracking-wide",
  containerStyle = "",
  bottomComponentStyle = "",
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
          flexDirection: "column",
          height: height,
        }}
      >
        {/* Main Header Row */}
        <View className="flex-row items-end justify-between px-4 flex-1 mb-2">
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
        </View>

        {/* Bottom Component */}
        {bottomComponent && <View className="px-6">{bottomComponent}</View>}
      </BlurView>
    </View>
  );
};

export default BlurNavigationHeader;
