import React, { useMemo } from "react";
import { Animated } from "react-native";

interface ParallaxPhotoHeaderProps {
  height: number;
  scrollY: Animated.Value;
  renderPhoto: () => React.ReactNode;
  children?: React.ReactNode;
}

// Shared parallax mechanics behind the museum and artwork detail headers: the
// header pins to the top and slides away as the user scrolls down (translateY
// clamped to -height), while the photo itself stretches on overscroll above
// the top (imageHeight extending past `height` for negative scrollY).
const ParallaxPhotoHeader = ({ height, scrollY, renderPhoto, children }: ParallaxPhotoHeaderProps) => {
  const headerTranslateY = useMemo(
    () =>
      scrollY.interpolate({
        inputRange: [0, height],
        outputRange: [0, -height],
        extrapolate: "clamp",
      }),
    [scrollY, height],
  );
  const imageHeight = useMemo(
    () =>
      scrollY.interpolate({
        inputRange: [-height, 0],
        outputRange: [height * 2, height],
        extrapolateLeft: "extend",
        extrapolateRight: "clamp",
      }),
    [scrollY, height],
  );

  return (
    <Animated.View
      className="absolute top-0 left-0 right-0 z-10"
      style={{ transform: [{ translateY: headerTranslateY }] }}
    >
      <Animated.View className="bg-organic-placeholder-a overflow-hidden" style={{ height: imageHeight }}>
        {renderPhoto()}
      </Animated.View>
      {children}
    </Animated.View>
  );
};

export default ParallaxPhotoHeader;
