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

  const defaultHeaderContainerStyle: ViewStyle = {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor,
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    ...headerContainerStyle,
  };

  const renderContent = () => <View className="flex-1">{children}</View>;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      {showStatusBar && (
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={backgroundColor}
        />
      )}

      {/* Fixed Top Title Bar */}
      <Animated.View
        style={{
          ...defaultHeaderContainerStyle,
          opacity: titleOpacity,
        }}
      >
        <Animated.Text style={defaultTitleStyle}>{title}</Animated.Text>
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
    </SafeAreaView>
  );
};

export default AnimatedHeaderWrapper;
