import React, { ReactNode } from "react";
import { Animated, FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeader } from "@/hooks/useHeader";
import BlurNavigationHeader from "./BlurNavigationHeader";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/provider/ThemeProvider";

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
  backgroundColor,
  titleStyle,
  // Blur props
  blurIntensity = 80,
  blurType,
  // Navigation header props
  leftComponent,
  rightComponent,
  secondRightComponent,
}: AnimatedHeaderWrapperProps) => {
  const { isDark } = useTheme();
  const { headerOpacity, titleOpacity, headerTranslateY, onScroll } = useHeader(
    { scrollThreshold },
  );

  // Auto-determine values based on theme if not provided
  const dynamicBackgroundColor =
    backgroundColor || (isDark ? "#111827" : "white");
  const dynamicBlurType = blurType || (isDark ? "dark" : "light");
  const dynamicTitleStyle =
    titleStyle ||
    `text-xl font-bold tracking-wide ${isDark ? "text-white" : "text-black"}`;

  const renderContent = () => <View className="flex-1">{children}</View>;

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: dynamicBackgroundColor }}
    >
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
          blurType={dynamicBlurType}
          titleStyle={dynamicTitleStyle}
          statusBarStyle={isDark ? "light" : "dark"}
        />
        <StatusBar style={isDark ? "light" : "dark"} />
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
