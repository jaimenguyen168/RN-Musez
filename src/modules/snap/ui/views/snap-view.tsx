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
import { StatusBar } from "expo-status-bar";
import ImagePicker, { ImageAsset } from "@/components/ImagePicker";
import BlurNavigationHeader from "@/components/BlurNavigationHeader";

const SnapView = () => {
  const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setCurrentArtwork } = useArtworkStore();

  const handleImageSelected = (image: ImageAsset) => {
    setSelectedImage(image);
  };

  const handleImageError = (error: string) => {
    Alert.alert("Error", `Failed to select image: ${error}`);
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;

    setLoading(true);
    try {
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

  if (!selectedImage) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <BlurNavigationHeader title="" statusBarStyle="dark" />
          {/* Header */}
          <View className="items-center mb-9">
            <View className="w-32 h-32 bg-primary-600/40 rounded-full items-center justify-center mb-6">
              <Ionicons name="camera" size={64} color={Colors.Primary} />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
              Art Overview
            </Text>
            <Text className="text-gray-600 text-center text-lg leading-7 max-w-sm">
              Upload an artwork and get insights{"\n"}powered by AI
            </Text>
          </View>

          <View className="w-full max-w-sm">
            <ImagePicker
              onImageSelected={handleImageSelected}
              onError={handleImageError}
              quality={0.8}
            >
              {({ selectImage }) => (
                <AppButton
                  onPress={selectImage}
                  className="flex-row items-center justify-center"
                >
                  <MaterialCommunityIcons
                    name="image-search"
                    size={24}
                    color="white"
                  />
                  <Text className="text-white text-lg font-semibold ml-3">
                    Choose Image
                  </Text>
                </AppButton>
              )}
            </ImagePicker>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <BlurNavigationHeader title="Snap Art" statusBarStyle="dark" />
      <View className="flex-1 justify-center items-center px-6">
        {/* Back Button (disabled) just because the weird navigation error  */}
        <TouchableOpacity
          onPress={resetImage}
          disabled
          className="absolute top-12 left-4 rounded-full p-3"
        />

        {/* Selected Image */}
        <View className="items-center mb-8 w-full px-8">
          <View className="bg-white p-4 rounded-3xl shadow-lg mb-12">
            <Image
              source={{ uri: selectedImage.uri }}
              className="w-80 h-80 rounded-2xl"
              resizeMode="cover"
            />
          </View>

          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Great shot!
          </Text>
          <Text className="text-gray-600 text-center mb-12 max-w-sm">
            Get detailed insights about this artwork
          </Text>

          {/* Buttons */}
          <View className="w-full gap-4">
            <AppButton
              onPress={handleGenerate}
              disabled={loading}
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
                    Generate
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
                    <Ionicons name="camera" size={20} color="#6B7280" />
                    <Text className="text-gray-600 font-medium ml-2">
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
                <Ionicons name="close" size={20} color="#6B7280" />
              </AppButton>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default SnapView;
