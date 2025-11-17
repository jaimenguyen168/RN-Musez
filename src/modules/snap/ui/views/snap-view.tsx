import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useArtworkStore } from "@/stores/artworkStore";
import { analyzeArtwork } from "@/services/geminiService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { Artwork } from "@/types/artwork";
import AppButton from "@/components/AppButton";
import ImagePicker, { ImageAsset } from "@/components/ImagePicker";
import BlurNavigationHeader from "@/components/BlurNavigationHeader";
import { useTheme } from "@/provider/ThemeProvider";
import { useRevenueCat } from "@/provider/RevenueCatProvider";
import RevenueCatUI from "react-native-purchases-ui";
import { useCredits } from "@/modules/snap/hooks/useCredits";
import { usePaywall } from "@/hooks/usePaywall";

const SnapView = () => {
  const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setCurrentArtwork } = useArtworkStore();
  const { isDark } = useTheme();
  const { isProUser } = useRevenueCat();
  const { presentUpgradePrompt, presentPaywall } = usePaywall();

  const {
    credits,
    loading: creditsLoading,
    consumeCredit,
    hasCredits,
    getTimeUntilReset,
  } = useCredits(isProUser || false);

  const handleImageSelected = (image: ImageAsset) => {
    setSelectedImage(image);
  };

  const handleImageError = (error: string) => {
    Alert.alert("Error", `Failed to select image: ${error}`);
  };

  const showUpgradePrompt = () => {
    const resetTime = getTimeUntilReset();
    const hoursUntilReset = Math.ceil(
      (resetTime.getTime() - Date.now()) / (1000 * 60 * 60),
    );

    presentUpgradePrompt({
      title: "No Credits Remaining",
      message: `You've used all your daily credits. They'll reset in ${hoursUntilReset} hours, or upgrade to Pro for unlimited access.`,
      cancelText: "Cancel",
      upgradeText: "Upgrade to Pro",
    });
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;

    // Check credits before proceeding
    if (!hasCredits()) {
      showUpgradePrompt();
      return;
    }

    setLoading(true);
    try {
      const creditUsed = await consumeCredit();
      if (!creditUsed) {
        showUpgradePrompt();
        return;
      }

      const result = await analyzeArtwork(selectedImage.uri);

      const artworkData: Artwork = {
        ...result,
        imageUri: selectedImage.uri,
      };

      setCurrentArtwork(artworkData);
      router.push(`/artworks/new`);
    } catch (error) {
      Alert.alert("Error", "Failed to analyze artwork. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetImage = () => {
    setSelectedImage(null);
  };

  if (creditsLoading) {
    return (
      <View className="flex-1 bg-app justify-center items-center">
        <ActivityIndicator size="large" color={Colors.Primary} />
      </View>
    );
  }

  const CreditsDisplay = () => {
    if (isProUser) return null;

    return (
      <View className="bg-card border border-soft rounded-2xl p-4 mb-6 w-full">
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row items-center">
            <Ionicons name="diamond" size={20} color={Colors.Primary} />
            <Text className="text-main font-semibold ml-2">Daily Credits</Text>
          </View>
          <Text className="text-primary font-bold text-lg">{credits}/5</Text>
        </View>

        {credits === 0 ? (
          <View className="mt-3 pt-3 border-t border-soft">
            <Text className="text-secondary text-sm mb-2">
              Credits reset at midnight
            </Text>
            <TouchableOpacity
              onPress={async () => {
                await RevenueCatUI.presentPaywall({
                  displayCloseButton: true,
                });
              }}
              className="bg-primary-600/10 border border-primary-600/20 rounded-lg p-3"
            >
              <Text className="text-primary text-center font-medium">
                Upgrade to Pro for unlimited credits
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          credits <= 2 && (
            <View className="mt-3 pt-3 border-t border-soft">
              <TouchableOpacity
                onPress={() => presentPaywall({ showSuccessAlert: true })}
                className="bg-primary-600/10 border border-primary-600/20 rounded-lg p-3"
              >
                <Text className="text-primary text-center font-medium">
                  Running low? Upgrade to Pro for unlimited credits
                </Text>
              </TouchableOpacity>
            </View>
          )
        )}
      </View>
    );
  };

  if (!selectedImage) {
    return (
      <View className="flex-1 bg-app">
        <BlurNavigationHeader
          title=""
          statusBarStyle={isDark ? "light" : "dark"}
          blurType={isDark ? "dark" : "light"}
        />

        <View className="flex-1 justify-center items-center px-6">
          {/* Header */}
          <View className="items-center mb-9">
            <View className="w-32 h-32 bg-primary-600/40 rounded-full items-center justify-center mb-6">
              <Ionicons name="camera" size={64} color={Colors.Primary} />
            </View>
            <Text className="text-2xl font-bold text-main mb-3 text-center">
              Art Overview
            </Text>
            <Text className="text-secondary text-center text-lg leading-7 max-w-sm">
              Upload an artwork and get insights{"\n"}powered by AI
            </Text>
          </View>

          <View className="w-full px-6 gap-6">
            <ImagePicker
              onImageSelected={handleImageSelected}
              onError={handleImageError}
              quality={0.8}
            >
              {({ selectImage }) => (
                <AppButton
                  onPress={selectImage}
                  className="flex-row items-center justify-center"
                  disabled={!hasCredits()}
                >
                  <MaterialCommunityIcons
                    name="image-search"
                    size={24}
                    color="white"
                  />
                  <Text className="text-white text-lg font-semibold ml-3">
                    {hasCredits() ? "Choose Image" : "No Credits"}
                  </Text>
                </AppButton>
              )}
            </ImagePicker>

            <CreditsDisplay />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-app">
      {/*<BlurNavigationHeader*/}
      {/*  title=""*/}
      {/*  statusBarStyle={isDark ? "light" : "dark"}*/}
      {/*  blurType={isDark ? "dark" : "light"}*/}
      {/*/>*/}

      <View className="flex-1 justify-center items-center px-6">
        {/* Back Button (disabled) just because the weird navigation error  */}
        <TouchableOpacity
          onPress={resetImage}
          disabled
          className="absolute top-12 left-4 rounded-full p-3"
        />

        {/* Selected Image */}
        <View className="items-center mb-8 w-full px-8">
          <View className="bg-card p-4 rounded-3xl shadow-lg mb-6 border border-soft">
            <Image
              source={{ uri: selectedImage.uri }}
              className="w-80 h-80 rounded-2xl"
              resizeMode="cover"
            />
          </View>

          <Text className="text-2xl font-bold text-main mb-2">Great shot!</Text>
          <Text className="text-secondary text-center mb-6 max-w-sm">
            Get detailed insights about this artwork
          </Text>

          {/* Buttons */}
          <View className="w-full gap-4 mb-4">
            <AppButton
              onPress={handleGenerate}
              disabled={loading || !hasCredits()}
              loading={loading}
              className="flex-row items-center justify-center"
            >
              {loading ? (
                <>
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white text-lg font-semibold ml-3">
                    Generating...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="sparkles-sharp" size={24} color="white" />
                  <Text className="text-white text-lg font-semibold ml-3">
                    {hasCredits() ? "Generate" : "No Credits"}
                  </Text>
                </>
              )}
            </AppButton>

            {/* Secondary actions in a row */}
            <View className="flex-row gap-3">
              <ImagePicker
                onImageSelected={handleImageSelected}
                onError={handleImageError}
                quality={0.8}
              >
                {({ selectImage }) => (
                  <AppButton
                    variant="outline"
                    className="flex-row flex-1 items-center justify-center"
                    onPress={selectImage}
                    disabled={loading}
                  >
                    <Ionicons
                      name="camera"
                      size={20}
                      color={isDark ? "#9CA3AF" : "#6B7280"}
                    />
                    <Text className="text-secondary font-medium ml-2">
                      New Photo
                    </Text>
                  </AppButton>
                )}
              </ImagePicker>

              <AppButton
                variant="outline"
                onPress={resetImage}
                disabled={loading}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={isDark ? "#9CA3AF" : "#6B7280"}
                />
              </AppButton>
            </View>
          </View>

          <CreditsDisplay />
        </View>
      </View>
    </View>
  );
};

export default SnapView;
