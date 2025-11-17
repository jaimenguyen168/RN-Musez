import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/provider/ThemeProvider";
import BlurNavigationHeader from "@/components/BlurNavigationHeader";
import BackButton from "@/components/BackButton";

const LanguagesView = () => {
  const router = useRouter();
  const { isDark } = useTheme();

  const handleLanguageSelect = (language: string) => {
    console.log("Selected language:", language);
  };

  const LanguageItem = ({
    title,
    isSelected = true,
    onPress,
  }: {
    title: string;
    isSelected?: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-4 px-6 bg-card"
      activeOpacity={0.7}
    >
      <Text className="text-base font-medium text-main">{title}</Text>
      {isSelected && (
        <Ionicons
          name="checkmark"
          size={20}
          color={isDark ? "#10B981" : "#059669"}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-app">
      <BlurNavigationHeader
        title="Languages"
        leftComponent={<BackButton onPress={router.back} />}
        statusBarStyle={isDark ? "light" : "dark"}
        blurType={isDark ? "dark" : "light"}
      />

      <View className="flex-1 pt-36">
        {/* Language Selection Section */}
        <View className="mx-4 rounded-3xl overflow-hidden">
          <View className="px-6 py-4 bg-card">
            <Text className="text-base font-light tracking-wider text-secondary">
              DEVICE LANGUAGE
            </Text>
          </View>

          <LanguageItem
            title="English"
            isSelected={true}
            onPress={() => handleLanguageSelect("English")}
          />
        </View>

        {/* Footer Note */}
        <View className="mt-6 mx-4">
          <Text className="text-sm text-secondary text-center px-4 leading-5">
            We currently support English only. More languages are coming soon!
          </Text>
        </View>
      </View>
    </View>
  );
};

export default LanguagesView;
