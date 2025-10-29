import React, { ReactNode } from "react";
import {
  Animated,
  FlatList,
  StatusBar,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { useHeader } from "@/hooks/useHeader";

interface AnimatedHeaderWrapperProps {
  children: ReactNode;
  headerComponent?: ReactNode;
  title?: string;
  scrollThreshold?: number;
  backgroundColor?: string;
  titleStyle?: TextStyle;
  headerContainerStyle?: ViewStyle;
  showStatusBar?: boolean;
  statusBarStyle?: "default" | "light-content" | "dark-content";
  // Blur props
  blurIntensity?: number;
  blurType?: "light" | "dark" | "regular";
}

const AnimatedHeaderWrapper = ({
  children,
  headerComponent,
  title = "Musez",
  scrollThreshold = 80,
  backgroundColor = "white",
  titleStyle,
  headerContainerStyle,
  showStatusBar = true,
  statusBarStyle = "dark-content",
  // Blur props
  blurIntensity = 20,
  blurType = "light",
}: AnimatedHeaderWrapperProps) => {
  const { headerOpacity, titleOpacity, headerTranslateY, onScroll } = useHeader(
    { scrollThreshold },
  );

  const defaultTitleStyle: TextStyle = {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    letterSpacing: 0.5,
    ...titleStyle,
  };

  const renderContent = () => <View className="flex-1">{children}</View>;

  return (
    <View className={`flex-1 pt-14 ${backgroundColor}`}>
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
          height: 100,
          zIndex: 1000,
          opacity: titleOpacity,
        }}
      >
        <BlurView
          intensity={blurIntensity}
          tint={blurType}
          style={{
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 8,
            ...headerContainerStyle,
          }}
        >
          <Animated.Text style={defaultTitleStyle}>{title}</Animated.Text>
        </BlurView>
      </Animated.View>

      <FlatList
        data={[1]}
        renderItem={renderContent}
        keyExtractor={(item, index) => index.toString()}
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
    </View>
  );
};

export default AnimatedHeaderWrapper;
