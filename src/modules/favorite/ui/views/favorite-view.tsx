import {
  ActivityIndicator,
  Text,
  View,
  Alert,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { CategorySection } from "@/modules/favorite/ui/components/FavoriteGrid";
import FavoriteEmpty from "@/modules/favorite/ui/components/FavoriteEmpty";
import { useMuseumListStore } from "@/stores/museumListStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import AddCollectionModal from "@/modules/favorite/ui/components/AddCollectionModal";
import { Museum } from "@/types/museum";
import BlurNavigationHeader from "@/components/BlurNavigationHeader";
import { Doc } from "../../../../../convex/_generated/dataModel";
import MuseumModeView from "@/modules/favorite/ui/views/museum-mode-view";
import ArtworkModeView from "@/modules/favorite/ui/views/artwork-mode-view";
import TabsPicker from "@/components/TabsPicker";

type ViewMode = "museum" | "artwork";
type ArtworkDoc = Doc<"artworks">;

const { width: screenWidth } = Dimensions.get("window");

const FavoriteView = () => {
  const router = useRouter();
  const { artwork } = useLocalSearchParams<{ artwork?: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>(
    artwork === "true" ? "artwork" : "museum",
  );

  const { setMuseumList } = useMuseumListStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [museums, setMuseums] = useState<Museum[]>([]);

  // Only fetch museum IDs for isEmpty check, actual data handled in MuseumModeView
  const savedMuseumIds = useQuery(api.function.museums.getSavedMuseumIds, {
    userId: "1234",
  });
  const categorizedMuseumIds = useQuery(
    api.function.museumCategories.getMuseumsByCategories,
    {
      userId: "1234",
    },
  );
  const savedArtworks = useQuery(api.function.artworks.getAllArtworks, {
    userId: "1234",
  });

  const viewModeOptions: [string, string] = ["Museums", "Artworks"];

  const createCollectionMutation = useMutation(
    api.function.museumCategories.createCollection,
  );

  // Helper functions to convert between display labels and internal values
  const getDisplayValue = (mode: ViewMode): string => {
    return mode === "museum" ? "Museums" : "Artworks";
  };

  const getInternalValue = (display: string): ViewMode => {
    return display === "Museums" ? "museum" : "artwork";
  };

  const handleDiscoveryPress = () => {
    router.push("/discovery");
  };

  const handleCategoryPress = (category: CategorySection) => {
    setMuseumList(category.title, category.museums);
    router.push("/collections");
  };

  const handleArtworkPress = (artwork: ArtworkDoc) => {
    // Navigate to artwork detail page
    router.push(`/artworks/${artwork._id}`);
  };

  const handleAddFavoriteCollectionPress = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handleCreateCollection = async (
    name: string,
    selectedMuseums: Museum[],
  ) => {
    try {
      setIsCreatingCollection(true);

      const museumIds = selectedMuseums.map((museum) => museum.placeId);

      const result = await createCollectionMutation({
        userId: "1234",
        collectionName: name,
        museumIds: museumIds,
      });

      if (result.success) {
        Alert.alert(
          "Success",
          `Collection "${result.categoryDisplayName}" created successfully with ${result.museumsAdded} museums.`,
          [{ text: "OK" }],
        );
        setIsModalVisible(false);
      } else {
        Alert.alert("Error", result.message || "Failed to create collection", [
          { text: "OK" },
        ]);
      }
    } catch (error) {
      console.error("Error creating collection:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred while creating the collection.",
        [{ text: "OK" }],
      );
    } finally {
      setIsCreatingCollection(false);
    }
  };

  // Callback to receive museums from MuseumModeView
  const handleMuseumsLoaded = (loadedMuseums: Museum[]) => {
    setMuseums(loadedMuseums);
  };

  const isLoading = !savedMuseumIds && !categorizedMuseumIds;

  const isEmpty =
    viewMode === "museum"
      ? (!savedMuseumIds || savedMuseumIds.length === 0) &&
        (!categorizedMuseumIds ||
          Object.keys(categorizedMuseumIds).length === 0)
      : !savedArtworks || savedArtworks.length === 0;

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-2 text-gray-600">Loading saved items...</Text>
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View className="flex-1 bg-gray-50 px-6">
        <BlurNavigationHeader title="Favorites" />
        <View className="items-center pt-32">
          <TabsPicker
            options={viewModeOptions}
            selectedValue={getDisplayValue(viewMode)}
            onSelectionChange={(value) => setViewMode(getInternalValue(value))}
            width={screenWidth - 48}
          />
        </View>
        <FavoriteEmpty onDiscoveryPress={handleDiscoveryPress} />
      </View>
    );
  }

  const rightComponent =
    viewMode === "museum" ? (
      <TouchableOpacity
        onPress={handleAddFavoriteCollectionPress}
        className="justify-center items-center p-2"
      >
        <Ionicons name="add" size={24} color="black" />
      </TouchableOpacity>
    ) : null;

  return (
    <View className="flex-1 bg-gray-50 relative">
      <BlurNavigationHeader
        title="Favorite"
        height={160}
        rightComponent={rightComponent}
        bottomComponent={
          <TabsPicker
            options={viewModeOptions}
            selectedValue={getDisplayValue(viewMode)}
            onSelectionChange={(value) => setViewMode(getInternalValue(value))}
            width={screenWidth - 48}
          />
        }
      />

      {viewMode === "museum" ? (
        <>
          <MuseumModeView
            onCategoryPress={handleCategoryPress}
            onMuseumsLoaded={handleMuseumsLoaded}
          />

          <AddCollectionModal
            visible={isModalVisible}
            onClose={closeModal}
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
