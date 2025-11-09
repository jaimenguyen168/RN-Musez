import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMuseumDetailsQuery } from "@/hooks/useMuseumDetailsQuery";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import FixedMapLinking from "@/modules/museums/ui/components/FixedMapLinking";
import OpeningHours from "@/modules/museums/ui/components/OpeningHours";
import AboutMuseum from "@/modules/museums/ui/components/AboutMuseum";
import Reviews from "@/modules/museums/ui/components/Reviews";
import Divider from "@/components/Divider";
import ContactMuseum from "@/modules/museums/ui/components/ContactMuseum";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

interface MuseumDetailsViewProps {
  museumId: string;
}

const MuseumDetailsView = ({ museumId }: MuseumDetailsViewProps) => {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const {
    data: museumDetails,
    isLoading: loading,
    error,
  } = useMuseumDetailsQuery(museumId);

  const isSaved = useQuery(api.function.museums.isMuseumSaved, {
    museumId: museumId,
  });

  const toggleSavedMuseum = useMutation(api.function.museums.toggleSavedMuseum);

  const onFavoritePress = async () => {
    await toggleSavedMuseum({
      museumId: museumId,
    });
  };

  const getPhotoUrl = (photoReference: string, maxWidth: number = 800) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;
  };

  const handleImagePress = (index: number) => {
    setSelectedImageIndex(index);
  };

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

  const headerImageUrl = currentPhoto
    ? getPhotoUrl(currentPhoto.photoReference)
    : undefined;

  const BackButton = (
    <TouchableOpacity
      onPress={() => router.back()}
      className="bg-white/80 rounded-full p-2"
    >
      <Ionicons name="chevron-back" size={24} color="#374151" />
    </TouchableOpacity>
  );

  const FavoriteButton = (
    <TouchableOpacity
      onPress={onFavoritePress}
      className="bg-white/80 rounded-full p-2"
    >
      <Ionicons
        name={isSaved ? "heart" : "heart-outline"}
        size={24}
        color={isSaved ? "#EF4444" : "#374151"}
      />
    </TouchableOpacity>
  );

  const HeaderControls = (
    <View className="flex-row justify-between items-center">
      {BackButton}
      {FavoriteButton}
    </View>
  );

  const HeaderTitle = (
    <View>
      <Text className="text-white text-2xl font-bold drop-shadow-lg">
        {museumDetails.name}
      </Text>
      <Text className="text-white/90 text-base mt-1 drop-shadow-lg line-clamp-1">
        {museumDetails.formattedAddress}
      </Text>
    </View>
  );

  return (
    <ParallaxScrollView
      headerImage={headerImageUrl}
      headerControls={HeaderControls}
      headerTitle={HeaderTitle}
      animatedTitle="Details"
      scrollViewClassName="bg-secondary"
      leftControl={BackButton}
      rightControl={FavoriteButton}
      scrollThreshold={120}
      backgroundColor="white"
      showStatusBar={true}
      blurType="dark"
    >
      <View className="bg-secondary pt-12">
        {/* Image Gallery Thumbnails */}
        {hasPhotos &&
          museumDetails.photos &&
          museumDetails.photos.length > 1 && (
            <View className="mb-6">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="pl-6" />
                {museumDetails.photos.map((photo, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleImagePress(index)}
                    className={`mr-3 rounded-2xl overflow-hidden shadow-sm ${
                      index === selectedImageIndex
                        ? "border-2 border-orange-500"
                        : ""
                    }`}
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Image
                      source={{ uri: getPhotoUrl(photo.photoReference, 200) }}
                      className="w-24 h-24"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
                <View className="pr-6" />
              </ScrollView>
            </View>
          )}

        {/* Main Content Card */}
        <View className="mx-4 gap-0 bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Museum Title & Rating Section */}
          <View className="p-6">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              {museumDetails.name}
            </Text>

            <View className="flex-row items-center justify-between mb-4">
              {museumDetails.rating && (
                <View className="flex-row items-center bg-amber-50 py-2 rounded-full">
                  <Ionicons name="star" size={18} color="#F59E0B" />
                  <Text className="text-lg font-bold ml-1 text-amber-700">
                    {museumDetails.rating}
                  </Text>
                  <Text className="text-gray-600 ml-1 text-sm">
                    ({museumDetails.userRatingsTotal})
                  </Text>
                </View>
              )}

              {museumDetails.openingHours && (
                <View className="flex-row items-center">
                  <View
                    className={`w-3 h-3 rounded-full mr-2 ${
                      museumDetails.openingHours.openNow
                        ? "bg-emerald-500"
                        : "bg-red-500"
                    }`}
                  />
                  <Text
                    className={`font-semibold ${
                      museumDetails.openingHours.openNow
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {museumDetails.openingHours.openNow ? "Open Now" : "Closed"}
                  </Text>
                </View>
              )}
            </View>

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
                        className="bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-full mr-2"
                      >
                        <Text className="text-indigo-700 text-sm font-medium capitalize">
                          {type.replace(/_/g, " ")}
                        </Text>
                      </View>
                    ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* About Section - Using the new About component */}
          {museumDetails.editorialSummary && (
            <>
              <Divider />
              <AboutMuseum content={museumDetails.editorialSummary.overview} />
            </>
          )}

          {/* Opening Hours */}
          {museumDetails.openingHours?.weekdayText && (
            <>
              <Divider />
              <OpeningHours
                weekdayText={museumDetails.openingHours.weekdayText}
              />
            </>
          )}

          {/* Reviews */}
          {museumDetails.reviews && museumDetails.reviews.length > 0 && (
            <>
              <Divider />
              <Reviews reviews={museumDetails.reviews} maxReviews={5} />
            </>
          )}

          <Divider />

          {/* Location & Map Section */}
          <FixedMapLinking
            latitude={museumDetails.geometry.location.lat}
            longitude={museumDetails.geometry.location.lng}
            name={museumDetails.name}
            address={museumDetails.formattedAddress}
            markerColor="#6366F1"
            height={192}
          />

          {/* Contact Info */}
          {(museumDetails.formattedPhoneNumber || museumDetails.website) && (
            <ContactMuseum
              phoneNumber={museumDetails.formattedPhoneNumber}
              website={museumDetails.website}
              showTitle={true}
              title="Contact"
              iconColor="#6366F1"
              backgroundColor="#F9FAFB"
            />
          )}
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </View>
    </ParallaxScrollView>
  );
};

export default MuseumDetailsView;
