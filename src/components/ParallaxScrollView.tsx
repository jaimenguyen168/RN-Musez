import {
  View,
  Animated,
  Dimensions,
  StatusBar,
  TextStyle,
  ViewStyle,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import React, { useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

interface ParallaxScrollViewProps {
  children: React.ReactNode;
  headerImage?: string;
  headerHeight?: number;
  headerControls?: React.ReactNode;
  headerTitle?: React.ReactNode;
  scrollViewClassName?: string;
  // New props for animated header
  animatedTitle?: string;
  scrollThreshold?: number;
  backgroundColor?: string;
  titleStyle?: TextStyle;
  headerContainerStyle?: ViewStyle;
  showStatusBar?: boolean;
  statusBarStyle?: "default" | "light-content" | "dark-content";
  // New props for individual controls in animated header
  leftControl?: React.ReactNode;
  rightControl?: React.ReactNode;
  // Blur props
  blurType?: "light" | "dark" | "regular";

  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollEventThrottle?: number;
}

const { width } = Dimensions.get("window");
const HEADER_HEIGHT = 360;

const ParallaxScrollView = ({
  children,
  headerImage,
  headerHeight = HEADER_HEIGHT,
  headerControls,
  headerTitle,
  scrollViewClassName = "bg-white",
  // New props for animated header
  animatedTitle = "Musez",
  scrollThreshold = 120,
  backgroundColor = "white",
  titleStyle,
  headerContainerStyle,
  showStatusBar = true,
  statusBarStyle = "light-content",
  // New props for individual controls
  leftControl,
  rightControl,
  // Blur props
  blurType = "dark",

  onScroll,
  scrollEventThrottle = 16,
}: ParallaxScrollViewProps) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  // Header container position - moves up as user scrolls down
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Image stretch animation - only when pulling down (negative scroll)
  const imageHeight = scrollY.interpolate({
    inputRange: [-200, 0],
    outputRange: [headerHeight + 200, headerHeight],
    extrapolateLeft: "extend",
    extrapolateRight: "clamp",
  });

  // Image scale for stretch effect
  const imageScale = scrollY.interpolate({
    inputRange: [-200, 0],
    outputRange: [1.5, 1],
    extrapolateLeft: "extend",
    extrapolateRight: "clamp",
  });

  // Controls opacity - fade out as header scrolls up
  const controlsOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight * 0.5],
    outputRange: [1, 0],
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Title opacity - fade out as header scrolls up
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight * 0.3],
    outputRange: [1, 0],
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animated header opacity and title opacity
  const animatedHeaderOpacity = scrollY.interpolate({
    inputRange: [0, scrollThreshold],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Controls for animated header - appear when scrolled up
  const animatedControlsOpacity = scrollY.interpolate({
    inputRange: [0, scrollThreshold],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const defaultTitleStyle: TextStyle = {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    ...titleStyle,
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: onScroll,
    },
  );

  return (
    <View className="flex-1" style={{ backgroundColor }}>
      {showStatusBar && (
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={backgroundColor}
        />
      )}

      {/* Animated Top Title Bar with Blur */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 120,
          zIndex: 1000,
          opacity: animatedHeaderOpacity,
        }}
      >
        <BlurView
          tint={blurType}
          style={{
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 16,
            paddingHorizontal: 20,
            ...headerContainerStyle,
          }}
        >
          {/* Header content with controls and title */}
          <View className="flex-row items-center justify-between w-full">
            {/* Left side - Back button */}
            <Animated.View style={{ opacity: animatedControlsOpacity }}>
              {leftControl ? (
                <View className="items-center justify-center">
                  {leftControl}
                </View>
              ) : (
                <View className="w-12" />
              )}
            </Animated.View>

            {/* Center title */}
            <Animated.Text style={defaultTitleStyle}>
              {animatedTitle}
            </Animated.Text>

            {/* Right side - Favorite button */}
            <Animated.View style={{ opacity: animatedControlsOpacity }}>
              {rightControl ? (
                <View className="items-center justify-center">
                  {rightControl}
                </View>
              ) : (
                <View className="w-12" />
              )}
            </Animated.View>
          </View>
        </BlurView>
      </Animated.View>

      <View className="flex-1 bg-white">
        {/* Header Container - moves with scroll */}
        <Animated.View
          className="absolute top-0 left-0 right-0 z-10"
          style={{
            transform: [{ translateY: headerTranslateY }],
          }}
        >
          {/* Header Image */}
          <Animated.View
            className="overflow-hidden"
            style={{
              height: imageHeight,
            }}
          >
            {headerImage && (
              <Animated.Image
                source={{ uri: headerImage }}
                className="absolute top-0 left-0"
                style={{
                  width: width,
                  height: imageScale.interpolate({
                    inputRange: [1, 1.5],
                    outputRange: [headerHeight, headerHeight * 1.5],
                  }),
                  transform: [{ scale: imageScale }],
                }}
                resizeMode="cover"
              />
            )}

            {/* Enhanced Gradient overlay for better text readability */}
            <LinearGradient
              colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.5)"]}
              locations={[0, 0.6, 1]}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "100%",
              }}
            />
          </Animated.View>

          {/* Header Controls */}
          {headerControls && (
            <Animated.View
              className="absolute top-16 left-0 right-0 z-20 px-6"
              style={{
                opacity: controlsOpacity,
              }}
            >
              {headerControls}
            </Animated.View>
          )}

          {/* Header Title with enhanced background gradient */}
          {headerTitle && (
            <Animated.View
              className="absolute left-0 right-0 z-10"
              style={{
                bottom: 30,
                opacity: titleOpacity,
              }}
            >
              <View className="px-6 relative">{headerTitle}</View>
            </Animated.View>
          )}

          {/* Additional gradient specifically for title area */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.4)"]}
            locations={[0, 1]}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        </Animated.View>

        {/* Scrollable Content */}
        <Animated.ScrollView
          className={`flex-1 ${scrollViewClassName}`}
          contentContainerStyle={{
            paddingTop: headerHeight,
          }}
          scrollEventThrottle={scrollEventThrottle}
          onScroll={handleScroll}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Content Container */}
          <View className="rounded-t-3xl -mt-5 min-h-[800px]">{children}</View>
        </Animated.ScrollView>
      </View>
    </View>
  );
};

export default ParallaxScrollView;
