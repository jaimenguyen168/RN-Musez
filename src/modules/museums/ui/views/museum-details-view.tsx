import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMuseumDetailsQuery } from "@/hooks/useMuseumDetailsQuery";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import FixedMapLinking from "@/modules/museums/ui/components/FixedMapLinking";
import OpeningHours from "@/modules/museums/ui/components/OpeningHours";
import Reviews from "@/modules/museums/ui/components/Reviews";
import ReviewModal from "@/modules/museums/ui/components/ReviewModal";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useTheme } from "@/provider/ThemeProvider";
import { getPhotoUrl } from "@/utils";

interface MuseumDetailsViewProps {
  museumId: string;
}

const MuseumDetailsView = ({ museumId }: MuseumDetailsViewProps) => {
  const router = useRouter();
  const { isDark } = useTheme();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  const { data: museumDetails, isLoading: loading, error } = useMuseumDetailsQuery(museumId);
  const isSaved = useQuery(api.function.museums.isMuseumSaved, { museumId });
  const toggleSavedMuseum = useMutation(api.function.museums.toggleSavedMuseum);

  const osmId = museumId ? decodeURIComponent(museumId) : null;
  const convexReviews = useQuery(
    api.function.reviews.getMuseumReviews,
    osmId ? { museumId: osmId } : "skip",
  );
  const userReview = useQuery(
    api.function.reviews.getUserReviewForMuseum,
    osmId ? { museumId: osmId } : "skip",
  );

  const totalReviews = convexReviews?.length ?? 0;
  const avgRating =
    totalReviews > 0
      ? Math.round((convexReviews!.reduce((s, r) => s + r.rating, 0) / totalReviews) * 10) / 10
      : null;

  const mappedReviews = (convexReviews ?? []).map((r) => ({
    authorName: r.userName,
    rating: r.rating,
    text: r.comment ?? "",
    relativeTimeDescription: r.dateVisited
      ? `Visited ${r.dateVisited}`
      : new Date(r._creationTime).toLocaleDateString(undefined, { month: "short", year: "numeric" }),
    userAvatar: r.userAvatar,
  }));

  // Kept as JS value — passed as a prop to ParallaxScrollView, can't use className
  const bg = isDark ? "#111827" : "#FAFAFA";
  const isOpen = museumDetails?.openingHours?.openNow;

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-app">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }
  if (error || !museumDetails) {
    return (
      <View className="flex-1 justify-center items-center bg-app">
        <Text className="text-red-500 text-sm">{error?.message ?? "Museum not found"}</Text>
      </View>
    );
  }

  const hasPhotos = !!museumDetails.photos?.length;
  const currentPhoto = hasPhotos ? museumDetails.photos![selectedImageIndex] : null;
  const resolvePhotoUrl = (ref: string, w = 400) =>
    ref.startsWith("http") ? ref : getPhotoUrl(ref, w);
  const headerImageUrl = currentPhoto ? resolvePhotoUrl(currentPhoto.photoReference) : undefined;

  const HeaderBtn = ({ onPress, children }: { onPress: () => void; children: React.ReactNode }) => (
    <TouchableOpacity
      onPress={onPress}
      className="rounded-full p-2"
      style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
    >
      {children}
    </TouchableOpacity>
  );

  const BackBtn = (
    <HeaderBtn onPress={() => router.back()}>
      <Ionicons name="chevron-back" size={22} color="#fff" />
    </HeaderBtn>
  );
  const FavBtn = (
    <HeaderBtn onPress={() => toggleSavedMuseum({ museumId })}>
      <Ionicons name={isSaved ? "heart" : "heart-outline"} size={22} color={isSaved ? "#FB7185" : "#fff"} />
    </HeaderBtn>
  );

  return (
    <>
      <ParallaxScrollView
        headerImage={headerImageUrl}
        headerControls={<View className="flex-row justify-between">{BackBtn}{FavBtn}</View>}
        headerTitle={
          <View>
            <Text className="text-white text-[22px] font-bold -tracking-[0.3px]" numberOfLines={2}>
              {museumDetails.name}
            </Text>
            {museumDetails.formattedAddress ? (
              <Text className="text-white/80 text-[13px] mt-0.5" numberOfLines={1}>
                {museumDetails.formattedAddress}
              </Text>
            ) : null}
          </View>
        }
        animatedTitle={museumDetails.name}
        leftControl={BackBtn}
        rightControl={FavBtn}
        scrollViewClassName="bg-app"
        backgroundColor={bg}
        scrollThreshold={120}
        showStatusBar
        blurType="dark"
        statusBarStyle="light"
      >
        <View className="pt-10 pb-12 bg-app">

          {/* Photo thumbnails */}
          {hasPhotos && museumDetails.photos!.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
              <View className="w-4" />
              {museumDetails.photos!.map((photo, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedImageIndex(i)}
                  className={`w-[68px] h-[68px] rounded-xl overflow-hidden mr-2 ${i === selectedImageIndex ? "border-[2.5px] border-indigo-500" : ""}`}
                >
                  <Image
                    source={{ uri: resolvePhotoUrl(photo.photoReference, 200) }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
              <View className="w-4" />
            </ScrollView>
          )}

          {/* Rating + status chips */}
          <View className="flex-row gap-2 px-4 pb-2">
            <View
              className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-full"
              style={{ backgroundColor: isDark ? "rgba(245,158,11,0.15)" : "#FFFBEB" }}
            >
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text className={`text-[13px] font-bold ${isDark ? "text-yellow-300" : "text-amber-700"}`}>
                {avgRating?.toFixed(1) ?? "0.0"}
              </Text>
              <Text className="text-xs text-secondary">({totalReviews})</Text>
            </View>

            {museumDetails.openingHours && (
              <View
                className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-full"
                style={{
                  backgroundColor: isOpen
                    ? isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)"
                    : isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.08)",
                }}
              >
                <View className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-emerald-500" : "bg-red-500"}`} />
                <Text className={`text-[13px] font-bold ${isOpen ? isDark ? "text-emerald-400" : "text-emerald-600" : isDark ? "text-red-400" : "text-red-600"}`}>
                  {isOpen ? "Open Now" : "Closed"}
                </Text>
              </View>
            )}
          </View>

          {/* About */}
          {museumDetails.editorialSummary && (
            <Card>
              <CardHeader icon="information-circle-outline" label="About" isDark={isDark} />
              <Text className="text-sm leading-[22px] px-5 pb-5 text-secondary">
                {museumDetails.editorialSummary.overview}
              </Text>
            </Card>
          )}

          {/* Opening Hours */}
          {museumDetails.openingHours?.weekdayText && (
            <Card>
              <OpeningHours weekdayText={museumDetails.openingHours.weekdayText} showTitle iconColor="#6366F1" />
            </Card>
          )}

          {/* Reviews */}
          <Card>
            <View className="flex-row items-center justify-between px-5 pt-5 pb-3.5">
              <View className="flex-row items-center gap-2.5">
                <View className={`w-[30px] h-[30px] rounded-lg items-center justify-center ${isDark ? "bg-gray-700" : "bg-indigo-50"}`}>
                  <Ionicons name="chatbubbles-outline" size={15} color="#6366F1" />
                </View>
                <Text className="text-[15px] font-bold text-main">Reviews</Text>
              </View>
              <TouchableOpacity
                onPress={() => setReviewModalVisible(true)}
                className={`flex-row items-center gap-1 px-2.5 py-1.5 rounded-full ${isDark ? "bg-indigo-900/50" : "bg-indigo-50"}`}
              >
                <Ionicons name={userReview ? "create-outline" : "add-circle-outline"} size={14} color="#6366F1" />
                <Text className="text-indigo-500 text-xs font-semibold">{userReview ? "Edit" : "Review"}</Text>
              </TouchableOpacity>
            </View>
            <Reviews reviews={mappedReviews} maxReviews={5} showTitle={false} compact />
          </Card>

          {/* Location */}
          <Card overflow>
            <CardHeader icon="map-outline" label="Location" isDark={isDark} />
            <FixedMapLinking
              latitude={museumDetails.geometry.location.lat}
              longitude={museumDetails.geometry.location.lng}
              name={museumDetails.name}
              address={museumDetails.formattedAddress}
              markerColor="#6366F1"
              height={180}
              showTitle={false}
              compact
            />
          </Card>

          {/* Contact */}
          {(museumDetails.formattedPhoneNumber || museumDetails.website) && (
            <Card>
              <CardHeader icon="call-outline" label="Contact" isDark={isDark} />
              <View className="mx-5 mb-5 rounded-xl border border-soft overflow-hidden">
                {museumDetails.formattedPhoneNumber && (
                  <TouchableOpacity
                    className={`flex-row items-center gap-3 p-3.5 ${museumDetails.website ? "border-b border-soft" : ""}`}
                    onPress={() => Linking.openURL(`tel:${museumDetails.formattedPhoneNumber}`)}
                  >
                    <View className={`w-8 h-8 rounded-[9px] items-center justify-center ${isDark ? "bg-gray-700" : "bg-green-50"}`}>
                      <Ionicons name="call-outline" size={16} color="#10B981" />
                    </View>
                    <Text className="flex-1 text-sm font-medium text-main">
                      {museumDetails.formattedPhoneNumber}
                    </Text>
                    <Ionicons name="chevron-forward" size={15} color={isDark ? "#4B5563" : "#D1D5DB"} />
                  </TouchableOpacity>
                )}
                {museumDetails.website && (
                  <TouchableOpacity
                    className="flex-row items-center gap-3 p-3.5"
                    onPress={() => Linking.openURL(museumDetails.website!)}
                  >
                    <View className={`w-8 h-8 rounded-[9px] items-center justify-center ${isDark ? "bg-gray-700" : "bg-indigo-50"}`}>
                      <Ionicons name="globe-outline" size={16} color="#6366F1" />
                    </View>
                    <Text className="flex-1 text-sm font-medium text-main">Visit Website</Text>
                    <Ionicons name="open-outline" size={15} color={isDark ? "#4B5563" : "#D1D5DB"} />
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          )}

        </View>
      </ParallaxScrollView>

      {osmId && (
        <ReviewModal
          visible={reviewModalVisible}
          onClose={() => setReviewModalVisible(false)}
          museumId={osmId}
          museumName={museumDetails.name}
        />
      )}
    </>
  );
};

const Card = ({ children, overflow }: { children: React.ReactNode; overflow?: boolean }) => (
  <View
    className={`mx-4 mt-2.5 rounded-[18px] bg-card ${overflow ? "overflow-hidden" : ""}`}
    style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 }}
  >
    {children}
  </View>
);

const CardHeader = ({ icon, label, isDark }: { icon: keyof typeof Ionicons.glyphMap; label: string; isDark: boolean }) => (
  <View className="flex-row items-center gap-2.5 px-5 pt-5 pb-3.5">
    <View className={`w-[30px] h-[30px] rounded-lg items-center justify-center ${isDark ? "bg-gray-700" : "bg-indigo-50"}`}>
      <Ionicons name={icon} size={15} color="#6366F1" />
    </View>
    <Text className="text-[15px] font-bold text-main">{label}</Text>
  </View>
);

export default MuseumDetailsView;
