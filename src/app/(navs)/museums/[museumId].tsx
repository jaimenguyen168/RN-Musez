import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMuseumDetailsQuery } from "@/hooks/useMuseumDetailsQuery";
import ParallaxScrollView from "@/components/ParallaxScrollView";

export default function MuseumDetailScreen() {
  const router = useRouter();
  const { museumId } = useLocalSearchParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const {
    data: museumDetails,
    isLoading: loading,
    error,
  } = useMuseumDetailsQuery(museumId as string);

  const getPhotoUrl = (photoReference: string, maxWidth: number = 800) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality (save to storage, API call, etc.)
  };

  const handleImagePress = (index: number) => {
    setSelectedImageIndex(index);
  };

  // Show error if no museumId is provided
  if (!museumId) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-red-500 text-center">No museum ID provided</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <ActivityIndicator size="large" color="#0066cc" />
        <Text className="mt-2">Loading museum details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-red-500 text-center">Error: {error.message}</Text>
      </View>
    );
  }

  if (!museumDetails) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text>No museum details found</Text>
      </View>
    );
  }

  const hasPhotos = museumDetails.photos && museumDetails.photos.length > 0;
  const currentPhoto =
    hasPhotos && museumDetails.photos
      ? museumDetails.photos[selectedImageIndex]
      : null;

  // Get the header image URL for the parallax effect
  const headerImageUrl = currentPhoto
    ? getPhotoUrl(currentPhoto.photoReference)
    : undefined;

  // Individual button components
  const BackButton = (
    <TouchableOpacity
      onPress={() => router.back()}
      className="bg-white/80 rounded-full p-2"
      style={{ width: 40, height: 40 }}
    >
      <Ionicons name="chevron-back" size={24} color="#374151" />
    </TouchableOpacity>
  );

  const FavoriteButton = (
    <TouchableOpacity
      onPress={toggleFavorite}
      className="bg-white/80 rounded-full p-2"
      style={{ width: 40, height: 40 }}
    >
      <Ionicons
        name={isFavorite ? "heart" : "heart-outline"}
        size={24}
        color={isFavorite ? "#EF4444" : "#374151"}
      />
    </TouchableOpacity>
  );

  // Header Controls Component for the original header
  const HeaderControls = (
    <View className="flex-row justify-between items-center">
      {BackButton}
      {FavoriteButton}
    </View>
  );

  // Header Title Component
  const HeaderTitle = (
    <View>
      <Text className="text-white text-2xl font-bold drop-shadow-lg">
        {museumDetails.name}
      </Text>
      <Text className="text-white/90 text-base mt-1 drop-shadow-lg">
        {museumDetails.formattedAddress}
      </Text>
    </View>
  );

  return (
    <ParallaxScrollView
      headerImage={headerImageUrl}
      headerControls={HeaderControls}
      headerTitle={HeaderTitle}
      animatedTitle={museumDetails.name}
      leftControl={BackButton}
      rightControl={FavoriteButton}
      scrollThreshold={120}
      backgroundColor="white"
      showStatusBar={true}
      statusBarStyle="dark-content"
    >
      {/* Content starts here - this will slide up over the image */}
      <View className="bg-white pt-6">
        {/* Image Gallery Thumbnails */}
        {hasPhotos &&
          museumDetails.photos &&
          museumDetails.photos.length > 1 && (
            <View className="py-4">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="pl-6" />
                {museumDetails.photos.map((photo, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleImagePress(index)}
                    className={`mr-3 rounded-lg overflow-hidden ${
                      index === selectedImageIndex
                        ? "border-2 border-blue-500"
                        : ""
                    }`}
                  >
                    <Image
                      source={{ uri: getPhotoUrl(photo.photoReference, 200) }}
                      className="w-20 h-20"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
                <View className="pr-6" />
              </ScrollView>
            </View>
          )}

        <View className="px-6 pb-8">
          {/* Type Tags */}
          {museumDetails.types && (
            <View className="mb-4">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {museumDetails.types
                  .filter(
                    (type) =>
                      !["establishment", "point_of_interest"].includes(type),
                  )
                  .map((type, index) => (
                    <View
                      key={index}
                      className="bg-blue-100 px-3 py-1 rounded-full mr-2"
                    >
                      <Text className="text-blue-800 text-sm capitalize">
                        {type.replace(/_/g, " ")}
                      </Text>
                    </View>
                  ))}
              </ScrollView>
            </View>
          )}

          {/* Rating and Basic Info */}
          <View className="flex-row items-center justify-between mb-6">
            {museumDetails.rating && (
              <View className="flex-row items-center">
                <Ionicons name="star" size={20} color="#F59E0B" />
                <Text className="text-lg font-semibold ml-1">
                  {museumDetails.rating}
                </Text>
                <Text className="text-gray-600 ml-1">
                  ({museumDetails.userRatingsTotal} reviews)
                </Text>
              </View>
            )}

            {museumDetails.openingHours && (
              <View className="flex-row items-center">
                <View
                  className={`w-2 h-2 rounded-full mr-2 ${
                    museumDetails.openingHours.openNow
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                />
                <Text
                  className={`font-medium ${
                    museumDetails.openingHours.openNow
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {museumDetails.openingHours.openNow ? "Open Now" : "Closed"}
                </Text>
              </View>
            )}
          </View>

          {/* Contact Info */}
          {(museumDetails.formattedPhoneNumber || museumDetails.website) && (
            <View className="mb-6">
              {museumDetails.formattedPhoneNumber && (
                <TouchableOpacity className="flex-row items-center mb-3">
                  <Ionicons name="call-outline" size={20} color="#3B82F6" />
                  <Text className="text-blue-600 ml-3 text-base">
                    {museumDetails.formattedPhoneNumber}
                  </Text>
                </TouchableOpacity>
              )}

              {museumDetails.website && (
                <TouchableOpacity className="flex-row items-center">
                  <Ionicons name="globe-outline" size={20} color="#3B82F6" />
                  <Text
                    className="text-blue-600 ml-3 text-base"
                    numberOfLines={1}
                  >
                    {museumDetails.website}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Opening Hours */}
          {museumDetails.openingHours?.weekdayText && (
            <View className="mb-6">
              <Text className="text-lg font-semibold mb-3">Opening Hours</Text>
              <View className="space-y-2">
                {museumDetails.openingHours.weekdayText.map((day, index) => {
                  // Split the day text to separate day name from hours
                  const [dayName, ...timeParts] = day.split(": ");
                  const timeText = timeParts.join(": "); // In case there are multiple colons

                  return (
                    <View
                      key={index}
                      className="flex-row justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <Text className="text-base font-medium text-gray-900">
                        {dayName}
                      </Text>
                      <Text className="text-base text-gray-600">
                        {timeText || "Hours not available"}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* About Section */}
          {museumDetails.editorialSummary && (
            <View className="mb-6">
              <Text className="text-lg font-semibold mb-3">About</Text>
              <Text className="text-base leading-6 text-gray-700">
                {museumDetails.editorialSummary.overview}
              </Text>
            </View>
          )}

          {/* Reviews */}
          {museumDetails.reviews && museumDetails.reviews.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-semibold mb-3">Recent Reviews</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {museumDetails.reviews.slice(0, 5).map((review, index) => (
                  <View
                    key={index}
                    className="bg-gray-50 p-4 rounded-xl mr-3 w-80"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text
                        className="text-base font-medium flex-1"
                        numberOfLines={1}
                      >
                        {review.authorName}
                      </Text>
                      <View className="flex-row items-center ml-2">
                        <Ionicons name="star" size={14} color="#F59E0B" />
                        <Text className="text-sm text-gray-600 ml-1">
                          {review.rating}
                        </Text>
                      </View>
                    </View>
                    <Text
                      className="text-sm leading-5 text-gray-700 mb-2"
                      numberOfLines={4}
                    >
                      {review.text}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {review.relativeTimeDescription}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </ParallaxScrollView>
  );
}
