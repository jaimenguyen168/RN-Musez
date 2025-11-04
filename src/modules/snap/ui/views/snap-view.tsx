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
import {
  CameraOptions,
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
  MediaType,
} from "react-native-image-picker";
import { analyzeArtwork } from "@/services/geminiService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { Artwork } from "@/types/artwork";

interface ImageAsset {
  uri: string;
  type?: string;
  fileName?: string;
}

const SnapView = () => {
  const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setCurrentArtwork } = useArtworkStore();

  const selectImage = () => {
    Alert.alert("Select Image", "Choose how you want to select an image", [
      { text: "📷 Camera", onPress: () => openCamera() },
      { text: "🖼️ Gallery", onPress: () => openGallery() },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const openCamera = () => {
    const options: CameraOptions = {
      mediaType: "photo" as MediaType,
      quality: 0.8,
    };
    launchCamera(options, handleImageResponse).then((r) => console.log(r));
  };

  const openGallery = () => {
    const options: CameraOptions = {
      mediaType: "photo" as MediaType,
      quality: 0.8,
    };
    launchImageLibrary(options, handleImageResponse).then((r) =>
      console.log(r),
    );
  };

  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.assets && response.assets[0]) {
      setSelectedImage({
        uri: response.assets[0].uri!,
        type: response.assets[0].type,
        fileName: response.assets[0].fileName,
      });
    }
  };

  const generateArtworkId = () => {
    return `artwork_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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

  if (!selectedImage) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
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
            <TouchableOpacity
              className="bg-primary py-4 px-8 rounded-2xl shadow flex-row items-center justify-center"
              onPress={selectImage}
            >
              <MaterialCommunityIcons
                name="image-search"
                size={24}
                color="white"
              />
              <Text className="text-white text-lg font-semibold ml-3">
                Choose Image
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center items-center px-6">
        {/* Back Button (disabled) just because the weird navigation error  */}
        <TouchableOpacity
          onPress={() => setSelectedImage(null)}
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
            <TouchableOpacity
              className={`py-4 px-8 w-full rounded-2xl shadow-sm flex-row items-center justify-center ${
                loading ? "bg-primary-600" : "bg-primary"
              }`}
              onPress={handleGenerate}
              disabled={loading}
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
            </TouchableOpacity>

            {/* Secondary actions in a row */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-white border border-gray-300 py-3 px-4 rounded-xl flex-row items-center justify-center"
                onPress={selectImage}
                disabled={loading}
              >
                <Ionicons name="camera" size={20} color="#6B7280" />
                <Text className="text-gray-600 font-medium ml-2">
                  New Photo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-white border border-gray-300 py-3 px-4 rounded-xl flex-row items-center justify-center"
                onPress={() => setSelectedImage(null)}
                disabled={loading}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
export default SnapView;
