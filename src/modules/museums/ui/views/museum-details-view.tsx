import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { Image } from "expo-image";
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

// ─── Design tokens ────────────────────────────────────────────────────────────
const PAD = 20;   // universal horizontal padding inside cards
const CARD_MX = 16; // card margin from screen edges
const CARD_GAP = 10; // vertical gap between cards
const CARD_RADIUS = 18;

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

  const bg = isDark ? "#111827" : "#F3F4F6";
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const textMain = isDark ? "#F9FAFB" : "#111827";
  const textSub = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#374151" : "#F3F4F6";
  const isOpen = museumDetails?.openingHours?.openNow;

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }
  if (error || !museumDetails) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <Text style={{ color: "#EF4444", fontSize: 14 }}>
          {error?.message ?? "Museum not found"}
        </Text>
      </View>
    );
  }

  const hasPhotos = !!museumDetails.photos?.length;
  const currentPhoto = hasPhotos ? museumDetails.photos![selectedImageIndex] : null;
  const resolvePhotoUrl = (ref: string, w = 400) =>
    ref.startsWith("http") ? ref : getPhotoUrl(ref, w);
  const headerImageUrl = currentPhoto ? resolvePhotoUrl(currentPhoto.photoReference) : undefined;

  // ── Header buttons ─────────────────────────────────────────────────────────
  const BackBtn = (
    <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
      <Ionicons name="chevron-back" size={22} color="#fff" />
    </TouchableOpacity>
  );
  const FavBtn = (
    <TouchableOpacity onPress={() => toggleSavedMuseum({ museumId })} style={styles.headerBtn}>
      <Ionicons
        name={isSaved ? "heart" : "heart-outline"}
        size={22}
        color={isSaved ? "#FB7185" : "#fff"}
      />
    </TouchableOpacity>
  );

  return (
    <>
      <ParallaxScrollView
        headerImage={headerImageUrl}
        headerControls={<View style={styles.headerRow}>{BackBtn}{FavBtn}</View>}
        headerTitle={
          <View>
            <Text style={styles.headerName} numberOfLines={2}>{museumDetails.name}</Text>
            {museumDetails.formattedAddress ? (
              <Text style={styles.headerAddr} numberOfLines={1}>
                {museumDetails.formattedAddress}
              </Text>
            ) : null}
          </View>
        }
        animatedTitle={museumDetails.name}
        leftControl={BackBtn}
        rightControl={FavBtn}
        scrollViewClassName={isDark ? "bg-gray-900" : "bg-gray-100"}
        backgroundColor={bg}
        scrollThreshold={120}
        showStatusBar
        blurType="dark"
        statusBarStyle="light"
      >
        <View style={{ backgroundColor: bg, paddingTop: 40, paddingBottom: 48 }}>

          {/* Photo thumbnails (only if multiple photos) */}
          {hasPhotos && museumDetails.photos!.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 8 }}
            >
              <View style={{ width: CARD_MX }} />
              {museumDetails.photos!.map((photo, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedImageIndex(i)}
                  style={[
                    styles.thumb,
                    i === selectedImageIndex && styles.thumbActive,
                    { marginRight: 8 },
                  ]}
                >
                  <Image
                    source={{ uri: resolvePhotoUrl(photo.photoReference, 200) }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                </TouchableOpacity>
              ))}
              <View style={{ width: CARD_MX }} />
            </ScrollView>
          )}

          {/* ── Rating + status chips ─────────────────────────────────────── */}
          <View style={styles.chipsRow}>
            <View style={[styles.chip, { backgroundColor: isDark ? "rgba(245,158,11,0.15)" : "#FFFBEB" }]}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={[styles.chipBold, { color: isDark ? "#FCD34D" : "#B45309" }]}>
                {avgRating?.toFixed(1) ?? "0.0"}
              </Text>
              <Text style={[styles.chipLight, { color: textSub }]}>({totalReviews})</Text>
            </View>

            {museumDetails.openingHours && (
              <View style={[styles.chip, {
                backgroundColor: isOpen
                  ? isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)"
                  : isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.08)",
              }]}>
                <View style={[styles.dot, { backgroundColor: isOpen ? "#10B981" : "#EF4444" }]} />
                <Text style={[styles.chipBold, {
                  color: isOpen
                    ? isDark ? "#34D399" : "#059669"
                    : isDark ? "#F87171" : "#DC2626",
                }]}>
                  {isOpen ? "Open Now" : "Closed"}
                </Text>
              </View>
            )}
          </View>

          {/* ── About ──────────────────────────────────────────────────────── */}
          {museumDetails.editorialSummary && (
            <Card bg={cardBg} style={{ marginTop: CARD_GAP }}>
              <CardHeader icon="information-circle-outline" label="About" isDark={isDark} textColor={textMain} />
              <Text style={[styles.body, { color: textSub, paddingHorizontal: PAD, paddingBottom: PAD }]}>
                {museumDetails.editorialSummary.overview}
              </Text>
            </Card>
          )}

          {/* ── Opening Hours ───────────────────────────────────────────────── */}
          {museumDetails.openingHours?.weekdayText && (
            <Card bg={cardBg} style={{ marginTop: CARD_GAP }}>
              {/* OpeningHours renders its own header + content with p-5 (20px) */}
              <OpeningHours
                weekdayText={museumDetails.openingHours.weekdayText}
                showTitle
                iconColor="#6366F1"
              />
            </Card>
          )}

          {/* ── Reviews ────────────────────────────────────────────────────── */}
          <Card bg={cardBg} style={{ marginTop: CARD_GAP }}>
            {/* Header row — same PAD as Reviews component's inner padding */}
            <View style={[styles.reviewsHeader, { paddingHorizontal: PAD, paddingTop: PAD, paddingBottom: 14 }]}>
              <View style={styles.reviewsTitle}>
                <View style={[styles.iconTile, { backgroundColor: isDark ? "#374151" : "#EEF2FF" }]}>
                  <Ionicons name="chatbubbles-outline" size={15} color="#6366F1" />
                </View>
                <Text style={[styles.cardLabel, { color: textMain }]}>Reviews</Text>
              </View>
              <TouchableOpacity
                onPress={() => setReviewModalVisible(true)}
                style={[styles.reviewBtn, { backgroundColor: isDark ? "#312E81" : "#EEF2FF" }]}
              >
                <Ionicons
                  name={userReview ? "create-outline" : "add-circle-outline"}
                  size={14}
                  color="#6366F1"
                />
                <Text style={styles.reviewBtnText}>{userReview ? "Edit" : "Review"}</Text>
              </TouchableOpacity>
            </View>
            {/* compact=true removes the top padding so it butts up against our header */}
            <Reviews reviews={mappedReviews} maxReviews={5} showTitle={false} compact />
          </Card>

          {/* ── Location ────────────────────────────────────────────────────── */}
          <Card bg={cardBg} style={{ marginTop: CARD_GAP, overflow: "hidden" }}>
            <CardHeader icon="map-outline" label="Location" isDark={isDark} textColor={textMain} />
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

          {/* ── Contact ─────────────────────────────────────────────────────── */}
          {(museumDetails.formattedPhoneNumber || museumDetails.website) && (
            <Card bg={cardBg} style={{ marginTop: CARD_GAP }}>
              <CardHeader icon="call-outline" label="Contact" isDark={isDark} textColor={textMain} />
              <View style={[styles.contactList, { borderColor, marginHorizontal: PAD, marginBottom: PAD }]}>
                {museumDetails.formattedPhoneNumber && (
                  <TouchableOpacity
                    style={[
                      styles.contactRow,
                      museumDetails.website ? { borderBottomWidth: 1, borderColor } : undefined,
                    ]}
                    onPress={() => Linking.openURL(`tel:${museumDetails.formattedPhoneNumber}`)}
                  >
                    <View style={[styles.contactIcon, { backgroundColor: isDark ? "#374151" : "#F0FDF4" }]}>
                      <Ionicons name="call-outline" size={16} color="#10B981" />
                    </View>
                    <Text style={[styles.contactText, { color: textMain }]}>
                      {museumDetails.formattedPhoneNumber}
                    </Text>
                    <Ionicons name="chevron-forward" size={15} color={isDark ? "#4B5563" : "#D1D5DB"} />
                  </TouchableOpacity>
                )}
                {museumDetails.website && (
                  <TouchableOpacity
                    style={styles.contactRow}
                    onPress={() => Linking.openURL(museumDetails.website!)}
                  >
                    <View style={[styles.contactIcon, { backgroundColor: isDark ? "#374151" : "#EEF2FF" }]}>
                      <Ionicons name="globe-outline" size={16} color="#6366F1" />
                    </View>
                    <Text style={[styles.contactText, { color: textMain }]}>Visit Website</Text>
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

// ─── Shared card wrapper ──────────────────────────────────────────────────────
const Card = ({
  children,
  bg,
  style,
}: {
  children: React.ReactNode;
  bg: string;
  style?: object;
}) => (
  <View style={[styles.card, { backgroundColor: bg }, style]}>
    {children}
  </View>
);

// ─── Shared section header ────────────────────────────────────────────────────
const CardHeader = ({
  icon,
  label,
  isDark,
  textColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  isDark: boolean;
  textColor: string;
}) => (
  <View style={styles.cardHeaderRow}>
    <View style={[styles.iconTile, { backgroundColor: isDark ? "#374151" : "#EEF2FF" }]}>
      <Ionicons name={icon} size={15} color="#6366F1" />
    </View>
    <Text style={[styles.cardLabel, { color: textColor }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Header
  headerBtn: {
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 24,
    padding: 8,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between" },
  headerName: { color: "#fff", fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
  headerAddr: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 3 },

  // Thumbnails
  thumb: { width: 68, height: 68, borderRadius: 12, overflow: "hidden" },
  thumbActive: { borderWidth: 2.5, borderColor: "#6366F1" },

  // Chips row (first thing after image)
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: CARD_MX,
    paddingBottom: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chipBold: { fontSize: 13, fontWeight: "700" },
  chipLight: { fontSize: 12 },
  dot: { width: 7, height: 7, borderRadius: 4 },

  // Card
  card: {
    marginHorizontal: CARD_MX,
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  // Card header row — same horizontal padding as card content (PAD = 20)
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: PAD,
    paddingTop: PAD,
    paddingBottom: 14,
  },
  iconTile: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: { fontSize: 15, fontWeight: "700" },

  // About
  body: { fontSize: 14, lineHeight: 22 },

  // Reviews header
  reviewsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reviewsTitle: { flexDirection: "row", alignItems: "center", gap: 10 },
  reviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  reviewBtnText: { color: "#6366F1", fontSize: 12, fontWeight: "600" },

  // Contact
  contactList: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  contactIcon: { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  contactText: { flex: 1, fontSize: 14, fontWeight: "500" },
});

export default MuseumDetailsView;
