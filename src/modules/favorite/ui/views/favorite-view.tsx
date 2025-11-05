import {
  ActivityIndicator,
  Text,
  View,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useMemo, useState } from "react";
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
import ViewModePicker from "@/modules/favorite/ui/components/ViewModePicker";
import MuseumModeView from "@/modules/favorite/ui/views/museum-mode-view";
import ArtworkModeView from "@/modules/favorite/ui/views/artwork-mode-view";
import { useMuseumsFavorites } from "@/hooks/useMuseumsFavorites";

type ViewMode = "museum" | "artwork";
type ArtworkDoc = Doc<"artworks">;

const FavoriteView = () => {
  const router = useRouter();
  const { artwork } = useLocalSearchParams<{ artwork?: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>(
    artwork === "true" ? "artwork" : "museum",
  );

  const { setMuseumList } = useMuseumListStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);

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

  const allMuseumIds = useMemo(() => {
    const savedIds = savedMuseumIds?.map((item) => item.museumId) || [];
    const categorizedIds = categorizedMuseumIds
      ? Object.values(categorizedMuseumIds)
          .flat()
          .map((item) => item.museumId)
      : [];

    return Array.from(new Set([...savedIds, ...categorizedIds]));
  }, [savedMuseumIds, categorizedMuseumIds]);

  const { data: museums = [] } = useMuseumsFavorites({
    museumIds: allMuseumIds,
  });

  const createCollectionMutation = useMutation(
    api.function.museumCategories.createCollection,
  );

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

  const handleViewModeChange = (newMode: ViewMode) => {
    setViewMode(newMode);
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
      <View className="flex-1 bg-gray-50">
        <BlurNavigationHeader title="Favorites" />
        <View className="items-center pt-32">
          <ViewModePicker
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
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
          <ViewModePicker
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />
        }
      />

      {viewMode === "museum" ? (
        <>
          <MuseumModeView onCategoryPress={handleCategoryPress} />

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
