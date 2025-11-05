import React, { useEffect, useRef } from "react";
import { View, TouchableOpacity, Animated, Dimensions } from "react-native";

type ViewMode = "museum" | "artwork";

interface ViewModePickerProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const { width: screenWidth } = Dimensions.get("window");
const PICKER_HORIZONTAL_MARGIN = 16; // mx-4 = 16px on each side
const PICKER_WIDTH = screenWidth - PICKER_HORIZONTAL_MARGIN * 2;
const BUTTON_WIDTH = PICKER_WIDTH / 2;

const ViewModePicker: React.FC<ViewModePickerProps> = ({
  viewMode,
  onViewModeChange,
}) => {
  // Animated value for the sliding indicator
  const slideAnimation = useRef(
    new Animated.Value(viewMode === "museum" ? 0 : BUTTON_WIDTH),
  ).current;

  // Animated value for text color transitions
  const museumTextOpacity = useRef(
    new Animated.Value(viewMode === "museum" ? 1 : 0.6),
  ).current;

  const artworkTextOpacity = useRef(
    new Animated.Value(viewMode === "artwork" ? 1 : 0.6),
  ).current;

  useEffect(() => {
    const toValue = viewMode === "museum" ? 0 : BUTTON_WIDTH;

    // Animate the sliding indicator
    Animated.spring(slideAnimation, {
      toValue,
      useNativeDriver: false,
    }).start();

    // Animate text opacity changes
    Animated.parallel([
      Animated.timing(museumTextOpacity, {
        toValue: viewMode === "museum" ? 1 : 0.6,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(artworkTextOpacity, {
        toValue: viewMode === "artwork" ? 1 : 0.6,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [viewMode, slideAnimation, museumTextOpacity, artworkTextOpacity]);

  const handleMuseumPress = () => {
    if (viewMode !== "museum") {
      onViewModeChange("museum");
    }
  };

  const handleArtworkPress = () => {
    if (viewMode !== "artwork") {
      onViewModeChange("artwork");
    }
  };

  return (
    <View className="mx-4 mb-4">
      <View className="bg-gray-100 rounded-3xl shadow-sm relative overflow-hidden">
        {/* Sliding Background Indicator */}
        <Animated.View
          style={{
            position: "absolute",
            left: slideAnimation,
            width: BUTTON_WIDTH - 8,
            height: 32,
            backgroundColor: "white",
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
          {/* Museum Button */}
          <TouchableOpacity
            onPress={handleMuseumPress}
            style={{ width: BUTTON_WIDTH }}
            className="py-3 px-4 justify-center items-center"
            activeOpacity={0.7}
          >
            <Animated.Text
              style={{
                opacity: museumTextOpacity,
                fontSize: 16,
                fontWeight: "600",
                color: "#1F2937",
              }}
            >
              Museums
            </Animated.Text>
          </TouchableOpacity>

          {/* Artwork Button */}
          <TouchableOpacity
            onPress={handleArtworkPress}
            style={{ width: BUTTON_WIDTH }}
            className="py-3 px-4 justify-center items-center"
            activeOpacity={0.7}
          >
            <Animated.Text
              style={{
                opacity: artworkTextOpacity,
                fontSize: 16,
                fontWeight: "600",
                color: "#1F2937",
              }}
            >
              Artworks
            </Animated.Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ViewModePicker;
