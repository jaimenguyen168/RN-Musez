import React, { ReactNode } from "react";
import { Animated, FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeader } from "@/hooks/useHeader";
import BlurNavigationHeader from "./BlurNavigationHeader";
import { StatusBar } from "expo-status-bar";

interface AnimatedHeaderWrapperProps {
  children: ReactNode;
  headerComponent?: ReactNode;
  title?: string;
  scrollThreshold?: number;
  backgroundColor?: string;
  titleStyle?: string;
  // Blur props
  blurIntensity?: number;
  blurType?: "light" | "dark" | "regular";
  // Navigation header props
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  secondRightComponent?: ReactNode;
}

const AnimatedHeaderWrapper = ({
  children,
  headerComponent,
  title = "Musez",
  scrollThreshold = 80,
  backgroundColor = "white",
  titleStyle = "text-xl font-bold text-black tracking-wide",
  // Blur props
  blurIntensity = 80,
  blurType = "light",
  // Navigation header props
  leftComponent,
  rightComponent,
  secondRightComponent,
}: AnimatedHeaderWrapperProps) => {
  const { headerOpacity, titleOpacity, headerTranslateY, onScroll } = useHeader(
    { scrollThreshold },
  );

  const renderContent = () => <View className="flex-1">{children}</View>;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      {/* Animated Blur Navigation Header */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          opacity: titleOpacity,
        }}
      >
        <BlurNavigationHeader
          title={title}
          leftComponent={leftComponent}
          rightComponent={rightComponent}
          secondRightComponent={secondRightComponent}
          blurIntensity={blurIntensity}
          blurType={blurType}
          titleStyle={titleStyle}
        />
        <StatusBar style="dark" />
      </Animated.View>

      <FlatList
        data={[1]}
        renderItem={renderContent}
        keyExtractor={(_, index) => index.toString()}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          headerComponent ? (
            <Animated.View
              style={{
                opacity: headerOpacity,
                transform: [{ translateY: headerTranslateY }],
              }}
            >
              {headerComponent}
            </Animated.View>
          ) : undefined
        }
      />
    </SafeAreaView>
  );
};

export default AnimatedHeaderWrapper;
