import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Artwork } from "@/types/artwork";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useTheme } from "@/provider/ThemeProvider";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Colors } from "@/constants/colors";

const { width: SW, height: SH } = Dimensions.get("window");
const IMAGE_HEIGHT = SH * 0.45;
const PRIMARY = Colors.Primary;

interface ArtworkDetailsViewProps {
  artwork: Artwork | null;
  loading: boolean;
  showButton?: boolean;
}

const CONFIDENCE_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  high: { text: "#059669", bg: "rgba(5,150,105,0.1)", border: "rgba(5,150,105,0.25)" },
  medium: { text: "#D97706", bg: "rgba(217,119,6,0.1)", border: "rgba(217,119,6,0.25)" },
  low: { text: "#DC2626", bg: "rgba(220,38,38,0.1)", border: "rgba(220,38,38,0.25)" },
};

const SECTIONS = [
  { key: "description", label: "Description", icon: "document-text-outline", color: PRIMARY },
  { key: "location", label: "Location", icon: "location-outline", color: "#10B981" },
  { key: "significance", label: "Historical Significance", icon: "star-outline", color: "#F59E0B" },
  { key: "culturalContext", label: "Cultural Context", icon: "library-outline", color: "#8B5CF6" },
  { key: "funFact", label: "Fun Fact", icon: "bulb-outline", color: "#F97316" },
] as const;

const ArtworkDetailsView = ({
  artwork,
  loading,
  showButton = false,
}: ArtworkDetailsViewProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const createArtwork = useMutation(api.function.artworks.createArtwork);
  const { uploadImageToConvex } = useImageUpload();

  const bg = isDark ? "#111827" : "#FAFAFA";
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const textMain = isDark ? "#F9FAFB" : "#111827";
  const textSub = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#374151" : "#E5E7EB";
  const chipBg = isDark ? "#374151" : "#F3F4F6";

  const handleSaveArtwork = async () => {
    if (!artwork) return;
    setIsSaving(true);
    try {
      const convexImageUrl = await uploadImageToConvex(artwork.imageUri);
      await createArtwork({ artwork: { ...artwork, imageUri: convexImageUrl } });
      Alert.alert(
        "Artwork Saved!",
        "Your artwork has been successfully saved to your collection.",
        [
          { text: "Snap New One", onPress: () => router.push("/snap") },
          {
            text: "View Collection",
            onPress: () => router.push({ pathname: "/favorite", params: { artwork: "true" } }),
            style: "default",
          },
        ],
      );
    } catch {
      Alert.alert("Save Failed", "There was an error saving your artwork. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={[styles.loadingText, { color: textSub }]}>Loading artwork details...</Text>
      </View>
    );
  }

  if (!artwork) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Ionicons name="image-outline" size={64} color={textSub} />
        <Text style={[styles.notFoundTitle, { color: textMain }]}>Artwork Not Found</Text>
        <Text style={[styles.notFoundSub, { color: textSub }]}>
          The artwork you're looking for could not be found.
        </Text>
        <TouchableOpacity
          style={[styles.goBackBtn, { backgroundColor: PRIMARY }]}
          onPress={() => router.back()}
        >
          <Text style={styles.goBackBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const confidence = artwork.confidence;
  const confColors = confidence ? CONFIDENCE_COLORS[confidence] : null;

  const metaFields = [
    artwork.period,
    artwork.style,
    artwork.medium,
    artwork.dateCreated,
  ].filter(Boolean) as string[];

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false} bounces>

        {/* ── Hero image ─────────────────────────────────────────────────── */}
        <View style={{ width: SW, height: IMAGE_HEIGHT }}>
          <Image
            source={{ uri: artwork.imageUri }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.55)", "transparent"]}
            style={{ position: "absolute", top: 0, left: 0, right: 0, height: 130 }}
          />
          <LinearGradient
            colors={["transparent", bg]}
            start={{ x: 0, y: 0.3 }}
            end={{ x: 0, y: 1 }}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: IMAGE_HEIGHT * 0.5 }}
          />
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.heroBtn, { top: insets.top + 10, left: 16 }]}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/snap")}
            style={[styles.heroBtn, { top: insets.top + 10, right: 16 }]}
          >
            <Ionicons name="camera-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <View style={[styles.content, { backgroundColor: bg }]}>

          {/* Title + artist */}
          <View style={styles.titleBlock}>
            <Text style={[styles.title, { color: textMain }]}>
              {artwork.title || "Unidentified Artwork"}
            </Text>
            {artwork.artist && (
              <Text style={[styles.artist, { color: textSub }]}>by {artwork.artist}</Text>
            )}
          </View>

          {/* Metadata chips */}
          {metaFields.length > 0 && (
            <View style={styles.chips}>
              {metaFields.map((label, i) => (
                <View key={i} style={[styles.chip, { backgroundColor: chipBg }]}>
                  <Text style={[styles.chipText, { color: textSub }]}>{label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Confidence badge */}
          {confidence && confColors && (
            <View style={[styles.confidenceBadge, { backgroundColor: confColors.bg, borderColor: confColors.border }]}>
              <Ionicons name="analytics-outline" size={16} color={confColors.text} />
              <Text style={[styles.confidenceLabel, { color: textSub }]}>Analysis Confidence</Text>
              <Text style={[styles.confidenceValue, { color: confColors.text }]}>
                {confidence.toUpperCase()}
              </Text>
            </View>
          )}

          {/* Error card */}
          {artwork.error && (
            <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor }]}>
              <View style={styles.sectionRow}>
                <View style={[styles.iconBg, { backgroundColor: "rgba(220,38,38,0.12)" }]}>
                  <Ionicons name="warning-outline" size={18} color="#DC2626" />
                </View>
                <Text style={[styles.sectionTitle, { color: textMain }]}>Analysis Error</Text>
              </View>
              <Text style={[styles.sectionBody, { color: "#DC2626" }]}>{artwork.error}</Text>
            </View>
          )}

          {/* Content sections */}
          {!artwork.error && SECTIONS.map(({ key, label, icon, color }) => {
            const value = artwork[key as keyof Artwork] as string | undefined;
            if (!value) return null;
            return (
              <View key={key} style={[styles.sectionCard, { backgroundColor: cardBg, borderColor }]}>
                <View style={styles.sectionRow}>
                  <View style={[styles.iconBg, { backgroundColor: `${color}1A` }]}>
                    <Ionicons name={icon as any} size={18} color={color} />
                  </View>
                  <Text style={[styles.sectionTitle, { color: textMain }]}>{label}</Text>
                </View>
                <Text style={[styles.sectionBody, { color: textSub }]}>{value}</Text>
              </View>
            );
          })}

          {/* Save button */}
          {showButton && (
            <TouchableOpacity
              onPress={handleSaveArtwork}
              disabled={isSaving}
              activeOpacity={0.85}
              style={[styles.saveBtn, { backgroundColor: PRIMARY, opacity: isSaving ? 0.65 : 1 }]}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="heart" size={20} color="#fff" />
              )}
              <Text style={styles.saveBtnText}>{isSaving ? "Saving..." : "Save Artwork"}</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  loadingText: { marginTop: 4, fontSize: 14 },
  notFoundTitle: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  notFoundSub: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  goBackBtn: { marginTop: 4, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  goBackBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },

  heroBtn: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 22,
    padding: 9,
  },

  content: { paddingHorizontal: 20, paddingTop: 8, gap: 12 },

  titleBlock: { gap: 4 },
  title: { fontSize: 26, fontWeight: "800", letterSpacing: -0.4, lineHeight: 32 },
  artist: { fontSize: 16, fontWeight: "500" },

  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  chipText: { fontSize: 12, fontWeight: "500" },

  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  confidenceLabel: { flex: 1, fontSize: 13 },
  confidenceValue: { fontSize: 13, fontWeight: "700" },

  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  sectionRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  sectionBody: { fontSize: 14, lineHeight: 22 },

  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 4,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

export default ArtworkDetailsView;
