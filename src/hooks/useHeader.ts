import { useRef } from "react";
import { Animated } from "react-native";

interface UseHeaderProps {
  scrollThreshold?: number;
}

interface UseHeaderReturn {
  scrollY: Animated.Value;
  headerOpacity: Animated.AnimatedInterpolation<number>;
  titleOpacity: Animated.AnimatedInterpolation<number>;
  headerTranslateY: Animated.AnimatedInterpolation<number>;
  onScroll: (...args: any[]) => void;
}

export const useHeader = ({
  scrollThreshold = 80,
}: UseHeaderProps = {}): UseHeaderReturn => {
  const scrollY = useRef(new Animated.Value(0)).current;

  // Animated values for header transitions
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, scrollThreshold],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, scrollThreshold],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, scrollThreshold],
    outputRange: [0, -scrollThreshold],
    extrapolate: "clamp",
  });

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false },
  );

  return {
    scrollY,
    headerOpacity,
    titleOpacity,
    headerTranslateY,
    onScroll,
  };
};
