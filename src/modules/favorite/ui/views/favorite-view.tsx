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
import FavoriteMuseumsEmpty from "@/modules/favorite/ui/components/FavoriteMuseumsEmpty";
import { useMuseumListStore } from "@/stores/museumListStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import AddCollectionModal from "@/modules/favorite/ui/components/AddCollectionModal";
import { Museum } from "@/types/museum";
import BlurNavigationHeader from "@/components/BlurNavigationHeader";
import { Doc } from "../../../../../convex/_generated/dataModel";
import MuseumModeView from "@/modules/favorite/ui/views/museum-mode-view";
import ArtworkModeView from "@/modules/favorite/ui/views/artwork-mode-view";
import TabsPicker from "@/components/TabsPicker";
import FavoriteArtworksEmpty from "@/modules/favorite/ui/components/FavoriteArtworksEmpty";

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

  const savedMuseumIds = useQuery(api.function.museums.getSavedMuseumIds);
  const categorizedMuseumIds = useQuery(
    api.function.museumCategories.getMuseumsByCategories,
  );
  const savedArtworks = useQuery(api.function.artworks.getAllArtworks);

  const viewModeOptions: [string, string] = ["Museums", "Artworks"];

  const createCollectionMutation = useMutation(
    api.function.museumCategories.createCollection,
  );

  const getDisplayValue = (mode: ViewMode): string => {
    return mode === "museum" ? "Museums" : "Artworks";
  };

  const getInternalValue = (display: string): ViewMode => {
    return display === "Museums" ? "museum" : "artwork";
  };

  const handleDiscoveryPress = () => {
    router.push("/discovery");
  };

  const handleSnapPress = () => {
    router.push("/snap");
  };

  const handleCategoryPress = (category: CategorySection) => {
    setMuseumList(category.title, category.museums);
    router.push("/collections");
  };

  const handleArtworkPress = (artwork: ArtworkDoc) => {
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
      <View className="flex-1 bg-gray-50 px-6 py-32">
        <BlurNavigationHeader
          title="Favorite"
          height={160}
          bottomComponent={
            <TabsPicker
              options={viewModeOptions}
              selectedValue={getDisplayValue(viewMode)}
              onSelectionChange={(value) =>
                setViewMode(getInternalValue(value))
              }
              width={screenWidth - 42}
            />
          }
        />
        {viewMode === "museum" ? (
          <FavoriteMuseumsEmpty onDiscoveryPress={handleDiscoveryPress} />
        ) : (
          <FavoriteArtworksEmpty onSnapPress={handleSnapPress} />
        )}
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
            width={screenWidth - 42}
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
