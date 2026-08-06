import { ActivityIndicator, Text, View, Alert, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CategorySection } from "@/modules/favorite/ui/components/FavoriteGroupRow";
import FavoriteMuseumsEmpty from "@/modules/favorite/ui/components/FavoriteMuseumsEmpty";
import { useMuseumListStore } from "@/stores/museumListStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import AddCollectionModal from "@/modules/favorite/ui/components/AddCollectionModal";
import { Museum } from "../../../../../convex/convexTypes";
import { Doc } from "../../../../../convex/_generated/dataModel";
import MuseumModeView from "@/modules/favorite/ui/views/museum-mode-view";
import ArtworkModeView from "@/modules/favorite/ui/views/artwork-mode-view";
import FavoriteArtworksEmpty from "@/modules/favorite/ui/components/FavoriteArtworksEmpty";
import { useTheme } from "@/provider/ThemeProvider";
import { useOrganicTheme } from "@/constants/organicTheme";

type ViewMode = "museum" | "artwork";
type ArtworkDoc = Doc<"artworks">;

const FavoriteView = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const c = useOrganicTheme();
  const insets = useSafeAreaInsets();
  const { artwork } = useLocalSearchParams<{ artwork?: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>(artwork === "true" ? "artwork" : "museum");

  const { setMuseumList } = useMuseumListStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [museums, setMuseums] = useState<Museum[]>([]);

  const savedMuseumIds = useQuery(api.function.museums.getSavedMuseumIds);
  const categorizedMuseumIds = useQuery(api.function.museumCategories.getMuseumsByCategories);
  const savedArtworks = useQuery(api.function.artworks.getAllArtworks);

  const createCollectionMutation = useMutation(api.function.museumCategories.createCollection);

  const handleDiscoveryPress = () => router.push("/discovery");
  const handleSnapPress = () => router.push("/snap");
  const handleCategoryPress = (category: CategorySection) => {
    setMuseumList(category.title, category.museums);
    router.push("/collections");
  };
  const handleArtworkPress = (artwork: ArtworkDoc) => router.push(`/artworks/${artwork._id}`);
  const handleMuseumsLoaded = (loadedMuseums: Museum[]) => setMuseums(loadedMuseums);

  const handleCreateCollection = async (name: string, selectedMuseums: Museum[]) => {
    try {
      setIsCreatingCollection(true);
      const result = await createCollectionMutation({
        collectionName: name,
        museumIds: selectedMuseums.map((m) => m.osmId),
      });
      if (result.success) {
        Alert.alert("Success", `Collection "${result.categoryDisplayName}" created with ${result.museumsAdded} museums.`);
        setIsModalVisible(false);
      } else {
        Alert.alert("Error", result.message || "Failed to create collection");
      }
    } catch {
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setIsCreatingCollection(false);
    }
  };

  const isLoading = !savedMuseumIds && !categorizedMuseumIds;
  const isEmpty =
    viewMode === "museum"
      ? (!savedMuseumIds || savedMuseumIds.length === 0) &&
        (!categorizedMuseumIds || Object.keys(categorizedMuseumIds).length === 0)
      : !savedArtworks || savedArtworks.length === 0;

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-organic">
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator size="large" color={c.accent} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-organic">
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <View className="px-5 gap-[18px]" style={{ paddingTop: insets.top + 8, paddingBottom: 14 }}>
        <View className="flex-row items-start justify-between gap-3">
          <View className="gap-[3px]">
            <Text className="font-heading text-organic text-[28px] leading-[32px]">Favorites</Text>
            <Text className="font-figtree text-organic-muted text-[13px]">
              Everything you&apos;ve kept, in one place.
            </Text>
          </View>
          {viewMode === "museum" && (
            <TouchableOpacity
              onPress={() => setIsModalVisible(true)}
              className="w-10 h-10 rounded-full items-center justify-center bg-organic-accent mt-0.5"
            >
              <Ionicons name="add" size={22} color={c.accentSoft} />
            </TouchableOpacity>
          )}
        </View>

        <View className="bg-organic-surface rounded-full p-1 flex-row gap-1">
          <TouchableOpacity
            onPress={() => setViewMode("museum")}
            activeOpacity={0.8}
            className={`flex-1 py-2.5 rounded-full items-center ${viewMode === "museum" ? "bg-organic-accent" : ""}`}
          >
            <Text
              className={`font-heading text-sm ${viewMode === "museum" ? "text-organic-accent-soft" : "text-organic"}`}
            >
              Museums
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode("artwork")}
            activeOpacity={0.8}
            className={`flex-1 py-2.5 rounded-full items-center ${viewMode === "artwork" ? "bg-organic-accent" : ""}`}
          >
            <Text
              className={`font-heading text-sm ${viewMode === "artwork" ? "text-organic-accent-soft" : "text-organic"}`}
            >
              Artworks
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <View className="flex-1">
        {isEmpty ? (
          viewMode === "museum" ? (
            <FavoriteMuseumsEmpty onDiscoveryPress={handleDiscoveryPress} />
          ) : (
            <FavoriteArtworksEmpty onSnapPress={handleSnapPress} />
          )
        ) : viewMode === "museum" ? (
          <MuseumModeView
            onCategoryPress={handleCategoryPress}
            onMuseumsLoaded={handleMuseumsLoaded}
            onNewGroupPress={() => setIsModalVisible(true)}
          />
        ) : (
          <ArtworkModeView onArtworkPress={handleArtworkPress} />
        )}
      </View>

      <AddCollectionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        museums={museums}
        onCreateCollection={handleCreateCollection}
        isCreating={isCreatingCollection}
      />
    </View>
  );
};

export default FavoriteView;
