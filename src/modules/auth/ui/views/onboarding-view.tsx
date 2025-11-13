import React, { useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { useRouter } from "expo-router";
import AppButton from "@/components/AppButton";
import { Ionicons } from "@expo/vector-icons";
import OnboardingOne from "@/modules/auth/ui/components/OnboardingOne";
import { SafeAreaView } from "react-native-safe-area-context";
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / screenWidth);

    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
    } else {
      router.replace("/sign-in");
    }
  };

  const handleSkip = () => {
    router.replace("/sign-in");
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <SafeAreaView className="flex-1 bg-app">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ height: 500 }}
        className="w-full pt-4"
      >
        {slides.map((slide) => (
          <View
            key={slide.key}
            style={{ width: screenWidth }}
            className="justify-center items-center h-4/5 w-full"
          >
            {slide.component}
          </View>
        ))}
      </ScrollView>

      <View className="flex-row justify-center items-center py-5 absolute bottom-36 left-0 right-0">
        {slides.map((_, index) => (
          <View
            key={index}
            className={`h-3 rounded-full mx-1.5 transition-all duration-200 transform ${
              index === currentIndex ? "bg-orange-500 w-6" : "bg-gray-300 w-3"
            }`}
          />
        ))}
      </View>

      <View className="flex-1 flex-row items-center w-full px-12 gap-3 absolute bottom-16 left-0 right-0">
        <AppButton
          variant="outline"
          onPress={handleSkip}
          className="flex-shrink"
        >
          <Text className="text-base text-secondary font-bold text-center">
            Skip
          </Text>
        </AppButton>

        <AppButton onPress={handleNext} className="flex-1">
          <View className="flex-row items-center justify-center">
            <Text className="text-lg text-white font-bold mr-2">
              {isLastSlide ? "Get Started" : "Next"}
            </Text>
            {!isLastSlide && (
              <Ionicons name="arrow-forward" size={20} color="white" />
            )}
          </View>
        </AppButton>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingView;
