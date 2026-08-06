import { ActivityIndicator, Text, View, Alert, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CategorySection } from "@/modules/favorite/ui/components/FavoriteGrid";
import FavoriteMuseumsEmpty from "@/modules/favorite/ui/components/FavoriteMuseumsEmpty";
import { useMuseumListStore } from "@/stores/museumListStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import AddCollectionModal from "@/modules/favorite/ui/components/AddCollectionModal";
import { Museum } from "../../../../../convex/convexTypes";
import { Doc } from "../../../../../convex/_generated/dataModel";
import MuseumModeView from "@/modules/favorite/ui/views/museum-mode-view";
import ArtworkModeView from "@/modules/favorite/ui/views/artwork-mode-view";
import TabsPicker from "@/components/TabsPicker";
import FavoriteArtworksEmpty from "@/modules/favorite/ui/components/FavoriteArtworksEmpty";
import { useTheme } from "@/provider/ThemeProvider";

type ViewMode = "museum" | "artwork";
type ArtworkDoc = Doc<"artworks">;

const FavoriteView = () => {
  const router = useRouter();
  const { isDark } = useTheme();
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

  const viewModeOptions: [string, string] = ["Museums", "Artworks"];
  const createCollectionMutation = useMutation(api.function.museumCategories.createCollection);

  const getDisplayValue = (mode: ViewMode) => mode === "museum" ? "Museums" : "Artworks";
  const getInternalValue = (display: string): ViewMode => display === "Museums" ? "museum" : "artwork";

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
      <View className={`flex-1 justify-center items-center ${isDark ? "bg-gray-900" : "bg-[#FAFAFA]"}`}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator size="large" color={Colors.Primary} />
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-[#FAFAFA]"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <View
        className={`px-6 pb-3.5 ${isDark ? "bg-gray-900" : "bg-[#FAFAFA]"}`}
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-start justify-between mb-4">
          <View className="gap-0.5">
            <Text className={`text-[28px] font-extrabold -tracking-[0.5px] ${isDark ? "text-gray-50" : "text-gray-900"}`}>
              Favorites
            </Text>
            <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Your saved museums & artworks
            </Text>
          </View>
          {viewMode === "museum" && (
            <TouchableOpacity
              onPress={() => setIsModalVisible(true)}
              className={`w-9 h-9 rounded-[10px] border items-center justify-center mt-1 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
            >
              <Ionicons name="add" size={20} color={Colors.Primary} />
            </TouchableOpacity>
          )}
        </View>

        <TabsPicker
          options={viewModeOptions}
          selectedValue={getDisplayValue(viewMode)}
          onSelectionChange={(val) => setViewMode(getInternalValue(val))}
        />
      </View>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      {isEmpty ? (
        <View className="flex-1">
          {viewMode === "museum" ? (
            <FavoriteMuseumsEmpty onDiscoveryPress={handleDiscoveryPress} />
          ) : (
            <FavoriteArtworksEmpty onSnapPress={handleSnapPress} />
          )}
        </View>
      ) : viewMode === "museum" ? (
        <>
          <MuseumModeView
            onCategoryPress={handleCategoryPress}
            onMuseumsLoaded={handleMuseumsLoaded}
          />
          <AddCollectionModal
            visible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            museums={museums}
            onCreateCollection={handleCreateCollection}
            isCreating={isCreatingCollection}
          />
        </>
      ) : (
        <ArtworkModeView onArtworkPress={handleArtworkPress} />
      )}
    </View>
  );
};

export default FavoriteView;
