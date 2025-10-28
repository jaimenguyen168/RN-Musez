import {
  View,
  Animated,
  Dimensions,
  StatusBar,
  TextStyle,
  ViewStyle,
} from "react-native";
import React, { useRef } from "react";

interface ParallaxScrollViewProps {
  children: React.ReactNode;
  headerImage?: string;
  headerHeight?: number;
  headerControls?: React.ReactNode;
  headerTitle?: React.ReactNode;
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
}

const { width } = Dimensions.get("window");
const HEADER_HEIGHT = 320;

const ParallaxScrollView = ({
  children,
  headerImage,
  headerHeight = HEADER_HEIGHT,
  headerControls,
  headerTitle,
  // New props for animated header
  animatedTitle = "Musez",
  scrollThreshold = 120,
  backgroundColor = "white",
  titleStyle,
  headerContainerStyle,
  showStatusBar = true,
  statusBarStyle = "dark-content",
  // New props for individual controls
  leftControl,
  rightControl,
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
    color: "#000",
    letterSpacing: 0.5,
    ...titleStyle,
  };

  const defaultHeaderContainerStyle: ViewStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor,
    zIndex: 1000,
    justifyContent: "flex-end",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 4,
    paddingHorizontal: 20,
    ...headerContainerStyle,
  };

  return (
    <View className="flex-1" style={{ backgroundColor }}>
      {showStatusBar && (
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={backgroundColor}
        />
      )}

      {/* Animated Top Title Bar */}
      <Animated.View
        style={{
          ...defaultHeaderContainerStyle,
          opacity: animatedHeaderOpacity,
        }}
      >
        {/* Header content with controls and title */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Left side - Back button */}
          <Animated.View style={{ opacity: animatedControlsOpacity }}>
            {leftControl ? (
              <View
                style={{
                  width: 40,
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {leftControl}
              </View>
            ) : (
              <View style={{ width: 40 }} />
            )}
          </Animated.View>

          {/* Center title */}
          <Animated.Text style={defaultTitleStyle}>
            {animatedTitle}
          </Animated.Text>

          {/* Right side - Favorite button */}
          <Animated.View style={{ opacity: animatedControlsOpacity }}>
            {rightControl ? (
              <View
                style={{
                  width: 40,
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {rightControl}
              </View>
            ) : (
              <View style={{ width: 40 }} />
            )}
          </Animated.View>
        </View>
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

            {/* Gradient overlay */}
            <View className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
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

          {/* Header Title */}
          {headerTitle && (
            <Animated.View
              className="absolute left-0 right-0 z-10 px-6"
              style={{
                bottom: 30,
                opacity: titleOpacity,
              }}
            >
              {headerTitle}
            </Animated.View>
          )}
        </Animated.View>

        {/* Scrollable Content */}
        <Animated.ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingTop: headerHeight,
          }}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false },
          )}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Content Container */}
          <View className="bg-white rounded-t-3xl -mt-5 min-h-[800px]">
            {children}
          </View>
        </Animated.ScrollView>
      </View>
    </View>
  );
};

export default ParallaxScrollView;
