import React, { useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/provider/ThemeProvider";
import { useOrganicTheme } from "@/constants/organicTheme";
import OnboardingOne from "@/modules/auth/ui/components/OnboardingOne";
import OnboardingTwo from "@/modules/auth/ui/components/OnboardingTwo";
import OnboardingThree from "@/modules/auth/ui/components/OnboardingThree";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

const { width: screenWidth } = Dimensions.get("window");

interface OnboardingSlide {
  key: string;
  component: React.ReactNode;
}

interface OnboardingViewProps {
  slides?: OnboardingSlide[];
}

const defaultSlides: OnboardingSlide[] = [
  { key: "slide1", component: <OnboardingOne /> },
  { key: "slide2", component: <OnboardingTwo /> },
  { key: "slide3", component: <OnboardingThree /> },
];

const OnboardingView = ({ slides = defaultSlides }: OnboardingViewProps) => {
  const router = useRouter();
  const { isDark } = useTheme();
  const c = useOrganicTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const lastIndex = slides.length - 1;
  const isLastSlide = currentIndex === lastIndex;

  const goToIndex = (index: number) => {
    scrollViewRef.current?.scrollTo({ x: index * screenWidth, animated: true });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / screenWidth);

    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const handleNext = () => goToIndex(Math.min(currentIndex + 1, lastIndex));
  const handleBack = () => goToIndex(Math.max(currentIndex - 1, 0));
  const handleSkip = () => goToIndex(lastIndex);
  const handleGetStarted = () => router.replace("/sign-up");
  const handleHaveAccount = () => router.replace("/sign-in");

  return (
    <SafeAreaView className="flex-1 bg-organic">
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="px-5 flex-row justify-between items-center">
        <Text className="font-heading text-organic text-[21px]">Musez</Text>
        <TouchableOpacity onPress={handleSkip} className="py-1.5">
          <Text className="font-figtree-bold text-organic-muted text-[13.5px]">Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {slides.map((slide) => (
          <View key={slide.key} style={{ width: screenWidth }} className="flex-1 justify-center gap-[26px] pt-3.5">
            {slide.component}
          </View>
        ))}
      </ScrollView>

      <View className="px-5 gap-[18px] pb-2">
        <View className="flex-row gap-1.5 items-center">
          {slides.map((slide, index) => (
            <TouchableOpacity key={slide.key} onPress={() => goToIndex(index)} hitSlop={8}>
              <View
                className="h-2 rounded-full"
                style={{
                  width: index === currentIndex ? 24 : 8,
                  backgroundColor: index === currentIndex ? c.accentStrong : c.divider,
                }}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ minHeight: 100 }} className="justify-center">
          {isLastSlide ? (
            <View className="gap-2">
              <TouchableOpacity onPress={handleGetStarted} className="py-[17px] rounded-full items-center bg-organic-accent">
                <Text className="font-heading text-organic-accent-soft text-base">Get started</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleHaveAccount} className="py-3 items-center">
                <Text className="font-figtree-bold text-organic-muted text-[13.5px]">I already have an account</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row justify-between items-center gap-3">
              {currentIndex > 0 ? (
                <TouchableOpacity onPress={handleBack} className="py-2">
                  <Text className="font-figtree-bold text-organic-muted text-[13.5px]">Back</Text>
                </TouchableOpacity>
              ) : (
                <View />
              )}
              <TouchableOpacity onPress={handleNext} className="rounded-full px-8 py-[15px] bg-organic-accent">
                <Text className="font-heading text-organic-accent-soft text-[15px]">Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingView;
