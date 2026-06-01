import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";

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

const SECTIONS = [
  { key: "location", label: "Location", icon: "location-outline", iconBg: "bg-emerald-50", iconColor: "#10B981" },
  { key: "description", label: "Description", icon: "document-text-outline", iconBg: "bg-orange-50", iconColor: PRIMARY },
  { key: "culturalContext", label: "Cultural Context", icon: "library-outline", iconBg: "bg-purple-50", iconColor: "#8B5CF6" },
  { key: "funFact", label: "Fun Fact", icon: "bulb-outline", iconBg: "bg-orange-50", iconColor: "#F97316" },
] as const;

const ArtworkDetailsView = ({ artwork, loading, showButton = false }: ArtworkDetailsViewProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const createArtwork = useMutation(api.function.artworks.createArtwork);
  const { uploadImageToConvex } = useImageUpload();

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
          { text: "View Collection", onPress: () => router.push({ pathname: "/favorite", params: { artwork: "true" } }), style: "default" },
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
      <View className="flex-1 justify-center items-center gap-3 bg-app">
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text className="text-secondary text-sm">Loading artwork details...</Text>
      </View>
    );
  }

  if (!artwork) {
    return (
      <View className="flex-1 justify-center items-center px-8 gap-3 bg-app">
        <StatusBar style={isDark ? "light" : "dark"} />
        <Ionicons name="image-outline" size={64} color={isDark ? "#6B7280" : "#9CA3AF"} />
        <Text className="text-xl font-bold text-center text-main">Artwork Not Found</Text>
        <Text className="text-sm text-center leading-6 text-secondary">
          The artwork you're looking for could not be found.
        </Text>
        <TouchableOpacity className="bg-primary mt-1 px-6 py-3 rounded-xl" onPress={() => router.back()}>
          <Text className="text-white font-semibold text-[15px]">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const metaFields = [artwork.period, artwork.style, artwork.medium, artwork.dateCreated].filter(Boolean) as string[];

  return (
    <View className="flex-1 bg-app">
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false} bounces>

        {/* ── Hero image ─────────────────────────────────────────────────── */}
        <View style={{ width: SW, height: IMAGE_HEIGHT }}>
          <Image source={{ uri: artwork.imageUri }} className="w-full h-full" resizeMode="cover" />
          <LinearGradient
            colors={["rgba(0,0,0,0.55)", "transparent"]}
            style={{ position: "absolute", top: 0, left: 0, right: 0, height: 130 }}
          />
          <LinearGradient
            colors={["transparent", isDark ? "#111827" : "#FAFAFA"]}
            start={{ x: 0, y: 0.3 }}
            end={{ x: 0, y: 1 }}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: IMAGE_HEIGHT * 0.5 }}
          />
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute left-4 rounded-full p-2.5"
            style={{ top: insets.top + 10, backgroundColor: "rgba(0,0,0,0.35)" }}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/snap")}
            className="absolute right-4 rounded-full p-2.5"
            style={{ top: insets.top + 10, backgroundColor: "rgba(0,0,0,0.35)" }}
          >
            <Ionicons name="camera-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <View className="px-5 pt-2 gap-3">

          {/* Title + artist */}
          <View className="gap-1">
            <Text className="text-[26px] font-extrabold leading-8 -tracking-[0.4px] text-main">
              {artwork.title || "Unknown Artwork"}
            </Text>
            <Text className="text-base font-medium text-secondary">
              by {artwork.artist || "Unknown Artist"}
            </Text>
          </View>

          {/* Metadata chips */}
          {metaFields.length > 0 && (
            <View className="flex-row flex-wrap gap-2">
              {metaFields.map((label, i) => (
                <View key={i} className="px-3 py-1.5 rounded-full bg-surface">
                  <Text className="text-xs font-medium text-secondary">{label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Error card */}
          {artwork.error && (
            <View className="rounded-2xl border bg-card border-soft p-4 gap-2.5">
              <View className="flex-row items-center gap-2.5">
                <View className="w-[34px] h-[34px] rounded-[10px] bg-red-50 items-center justify-center">
                  <Ionicons name="warning-outline" size={18} color="#DC2626" />
                </View>
                <Text className="text-[15px] font-bold text-main">Analysis Error</Text>
              </View>
              <Text className="text-sm text-red-500 leading-[22px]">{artwork.error}</Text>
            </View>
          )}

          {/* Content sections */}
          {!artwork.error && SECTIONS.map(({ key, label, icon, iconBg, iconColor }) => {
            const value = artwork[key as keyof Artwork] as string | undefined;
            if (!value) return null;
            return (
              <View key={key} className="rounded-2xl border bg-card border-soft p-4 gap-2.5">
                <View className="flex-row items-center gap-2.5">
                  <View className={`w-[34px] h-[34px] rounded-[10px] items-center justify-center ${iconBg}`}>
                    <Ionicons name={icon as any} size={18} color={iconColor} />
                  </View>
                  <Text className="text-[15px] font-bold text-main">{label}</Text>
                </View>
                <Text className="text-sm leading-[22px] text-secondary">{value}</Text>
              </View>
            );
          })}

          {/* Related artworks */}
          {!artwork.error && artwork.relatedArtworks && artwork.relatedArtworks.length > 0 && (
            <View className="rounded-2xl border bg-card border-soft p-4 gap-2.5">
              <View className="flex-row items-center gap-2.5">
                <View className="w-[34px] h-[34px] rounded-[10px] items-center justify-center bg-indigo-50">
                  <Ionicons name="albums-outline" size={18} color="#6366F1" />
                </View>
                <Text className="text-[15px] font-bold text-main">Related Artworks</Text>
              </View>
              <View className="gap-2">
                {artwork.relatedArtworks.map((name, i) => (
                  <View key={i} className="flex-row items-center gap-2.5">
                    <View className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <Text className="text-sm text-secondary flex-1">{name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Save button */}
          {showButton && (
            <TouchableOpacity
              onPress={handleSaveArtwork}
              disabled={isSaving}
              activeOpacity={0.85}
              className={`bg-primary flex-row items-center justify-center gap-2.5 py-4 rounded-2xl mt-1 ${isSaving ? "opacity-60" : "opacity-100"}`}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="heart" size={20} color="#fff" />
              )}
              <Text className="text-white text-base font-bold">{isSaving ? "Saving..." : "Save Artwork"}</Text>
            </TouchableOpacity>
          )}

          <View className="h-8" />
        </View>
      </ScrollView>
    </View>
  );
};

export default ArtworkDetailsView;
