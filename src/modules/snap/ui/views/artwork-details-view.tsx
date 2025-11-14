import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import Divider from "@/components/Divider";
import { Artwork } from "@/types/artwork";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useTheme } from "@/provider/ThemeProvider";
import { useImageUpload } from "@/hooks/useImageUpload";

interface ArtworkDetailsViewProps {
  artwork: Artwork | null;
  loading: boolean;
  showButton?: boolean;
}

const ArtworkDetailsView = ({
  artwork,
  loading,
  showButton = false,
}: ArtworkDetailsViewProps) => {
  const router = useRouter();
  const { isDark } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const createArtwork = useMutation(api.function.artworks.createArtwork);
  const { uploadImageToConvex } = useImageUpload();

  const getConfidenceColor = (confidence?: string) => {
    switch (confidence?.toLowerCase()) {
      case "high":
        return "text-emerald-600 dark:text-emerald-400";
      case "medium":
        return "text-amber-600 dark:text-amber-400";
      case "low":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-secondary";
    }
  };

  const getConfidenceBgColor = (confidence?: string) => {
    switch (confidence?.toLowerCase()) {
      case "high":
        return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700";
      case "medium":
        return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700";
      case "low":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700";
      default:
        return "bg-surface border-soft";
    }
  };

  const handleSaveArtwork = async () => {
    if (!artwork) return;

    setIsSaving(true);
    try {
      const convexImageUrl = await uploadImageToConvex(artwork.imageUri);

      await createArtwork({
        artwork: {
          ...artwork,
          imageUri: convexImageUrl,
        },
      });

      Alert.alert(
        "Artwork Saved!",
        "Your artwork has been successfully saved to your collection.",
        [
          {
            text: "Snap New One",
            onPress: () => router.push("/snap"),
          },
          {
            text: "View Collection",
            onPress: () =>
              router.push({
                pathname: "/favorite",
                params: {
                  artwork: "true",
                },
              }),
            style: "default",
          },
        ],
      );
    } catch (error) {
      console.error("Error saving artwork:", error);
      Alert.alert(
        "Save Failed",
        "There was an error saving your artwork. Please try again.",
        [{ text: "OK" }],
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-app">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-4 text-secondary">Loading artwork details...</Text>
      </View>
    );
  }

  if (!artwork) {
    return (
      <View className="flex-1 justify-center items-center bg-app px-6">
        <Ionicons
          name="image-outline"
          size={64}
          color={isDark ? "#6B7280" : "#9CA3AF"}
        />
        <Text className="text-xl font-bold text-main mt-4 mb-2">
          Artwork Not Found
        </Text>
        <Text className="text-secondary text-center mb-8">
          The artwork you&apos;re looking for could not be found.
        </Text>
        <TouchableOpacity
          className="bg-indigo-600 py-3 px-6 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const HeaderControls = (
    <View className="flex-row justify-between items-center">
      <TouchableOpacity
        onPress={() => router.back()}
        className="bg-surface rounded-full p-2"
      >
        <Ionicons
          name="chevron-back"
          size={24}
          color={isDark ? "#F3F4F6" : "#374151"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/snap")}
        className="bg-surface rounded-full p-2"
      >
        <Ionicons
          name="camera"
          size={24}
          color={isDark ? "#F3F4F6" : "#374151"}
        />
      </TouchableOpacity>
    </View>
  );

  const HeaderTitle = (
    <View>
      <Text className="text-white text-2xl font-bold drop-shadow-lg">
        {artwork.title || "Unidentified Artwork"}
      </Text>
      <Text className="text-white/90 text-base mt-1 drop-shadow-lg">
        {artwork.artist || "Unknown Artist"}
      </Text>
    </View>
  );

  return (
    <ParallaxScrollView
      headerImage={artwork.imageUri}
      headerControls={HeaderControls}
      headerTitle={HeaderTitle}
      animatedTitle="Artwork"
      scrollViewClassName={isDark ? "bg-gray-900" : "bg-secondary"}
      leftControl={
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-surface rounded-full p-2"
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={isDark ? "#F3F4F6" : "#374151"}
          />
        </TouchableOpacity>
      }
      rightControl={
        <TouchableOpacity
          onPress={() => router.push("/snap")}
          className="bg-surface rounded-full p-2"
        >
          <Ionicons
            name="camera"
            size={24}
            color={isDark ? "#F3F4F6" : "#374151"}
          />
        </TouchableOpacity>
      }
      scrollThreshold={120}
      backgroundColor={isDark ? "#111827" : "white"}
      showStatusBar={true}
      statusBarStyle="light"
      blurType="dark"
    >
      <View className={`pt-12 ${isDark ? "bg-gray-900" : "bg-secondary"}`}>
        {/* Main Content Card */}
        <View className="mx-4 pb-4 gap-0 bg-card rounded-3xl shadow-lg overflow-hidden border border-soft">
          {/* Artwork Title & Info Section */}
          <View className="p-6">
            <Text className="text-2xl font-bold text-main mb-2">
              {artwork.title || "Unidentified Artwork"}
            </Text>

            {artwork.artist && (
              <Text className="text-lg text-secondary mb-4">
                by {artwork.artist}
              </Text>
            )}

            {/* Artwork Details */}
            {(artwork.period ||
              artwork.style ||
              artwork.medium ||
              artwork.dateCreated) && (
              <View className="bg-surface rounded-2xl p-4 mb-4 gap-3">
                {artwork.period && (
                  <View className="flex-row items-center">
                    <Text className="text-secondary font-medium text-sm w-20">
                      Period:
                    </Text>
                    <Text className="text-main text-sm flex-1">
                      {artwork.period}
                    </Text>
                  </View>
                )}
                {artwork.style && (
                  <View className="flex-row items-center">
                    <Text className="text-secondary font-medium text-sm w-20">
                      Style:
                    </Text>
                    <Text className="text-main text-sm flex-1">
                      {artwork.style}
                    </Text>
                  </View>
                )}
                {artwork.medium && (
                  <View className="flex-row items-center">
                    <Text className="text-secondary font-medium text-sm w-20">
                      Medium:
                    </Text>
                    <Text className="text-main text-sm flex-1">
                      {artwork.medium}
                    </Text>
                  </View>
                )}
                {artwork.dateCreated && (
                  <View className="flex-row items-center">
                    <Text className="text-secondary font-medium text-sm w-20">
                      Created:
                    </Text>
                    <Text className="text-main text-sm flex-1">
                      {artwork.dateCreated}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Confidence Badge */}
            {artwork.confidence && (
              <View
                className={`border rounded-2xl px-4 py-2 ${getConfidenceBgColor(artwork.confidence)}`}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="analytics"
                    size={20}
                    color={
                      artwork.confidence === "high"
                        ? "#059669"
                        : artwork.confidence === "medium"
                          ? "#D97706"
                          : "#DC2626"
                    }
                  />
                  <Text className="text-secondary font-medium ml-2">
                    Analysis Confidence:
                  </Text>
                  <Text
                    className={`ml-2 font-bold ${getConfidenceColor(artwork.confidence)}`}
                  >
                    {artwork.confidence.toUpperCase()}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Error Display */}
          {artwork.error && (
            <>
              <Divider />
              <View className="p-6">
                <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-4">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="warning" size={20} color="#DC2626" />
                    <Text className="text-red-700 dark:text-red-400 font-semibold ml-2">
                      Analysis Error
                    </Text>
                  </View>
                  <Text className="text-red-600 dark:text-red-300">
                    {artwork.error}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Location Section */}
          {artwork.location && !artwork.error && (
            <>
              <Divider />
              <View className="p-6">
                <View className="flex-row items-center mb-4">
                  <Ionicons name="location" size={24} color="#10B981" />
                  <Text className="text-xl font-bold text-main ml-2">
                    Location
                  </Text>
                </View>
                <Text className="text-secondary leading-6 text-base">
                  {artwork.location}
                </Text>
              </View>
            </>
          )}

          {/* Description Section */}
          {artwork.description && !artwork.error && (
            <>
              <Divider />
              <View className="p-6">
                <View className="flex-row items-center mb-4">
                  <Ionicons name="document-text" size={24} color="#6366F1" />
                  <Text className="text-xl font-bold text-main ml-2">
                    Description
                  </Text>
                </View>
                <Text className="text-secondary leading-6 text-base">
                  {artwork.description}
                </Text>
              </View>
            </>
          )}

          {/* Significance Section */}
          {artwork.significance && !artwork.error && (
            <>
              <Divider />
              <View className="p-6">
                <View className="flex-row items-center mb-4">
                  <Ionicons name="star" size={24} color="#F59E0B" />
                  <Text className="text-xl font-bold text-main ml-2">
                    Historical Significance
                  </Text>
                </View>
                <Text className="text-secondary leading-6 text-base">
                  {artwork.significance}
                </Text>
              </View>
            </>
          )}

          {/* Cultural Context Section */}
          {artwork.culturalContext && !artwork.error && (
            <>
              <Divider />
              <View className="p-6">
                <View className="flex-row items-center mb-4">
                  <Ionicons name="library" size={24} color="#8B5CF6" />
                  <Text className="text-xl font-bold text-main ml-2">
                    Cultural Context
                  </Text>
                </View>
                <Text className="text-secondary leading-6 text-base">
                  {artwork.culturalContext}
                </Text>
              </View>
            </>
          )}

          {/* Fun Fact Section */}
          {artwork.funFact && !artwork.error && (
            <>
              <Divider />
              <View className="p-6">
                <View className="flex-row items-center mb-4">
                  <Ionicons name="bulb" size={24} color="#F97316" />
                  <Text className="text-xl font-bold text-main ml-2">
                    Fun Fact
                  </Text>
                </View>
                <Text className="text-secondary leading-6 text-base">
                  {artwork.funFact}
                </Text>
              </View>
            </>
          )}

          {/* Action Buttons */}
          {showButton && (
            <>
              <Divider />
              <View className="p-6">
                <TouchableOpacity
                  className={`py-4 px-6 rounded-2xl flex-row items-center justify-center ${
                    isSaving ? "bg-gray-400 dark:bg-gray-600" : "bg-primary"
                  }`}
                  onPress={handleSaveArtwork}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="heart" size={24} color="white" />
                  )}
                  <Text className="text-white text-lg font-semibold ml-3">
                    {isSaving ? "Saving..." : "Save Artwork"}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </View>
    </ParallaxScrollView>
  );
};

export default ArtworkDetailsView;
