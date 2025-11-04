import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  Alert,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import React, { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import FavoriteGrid, {
  CategorySection,
} from "@/modules/favorite/ui/components/FavoriteGrid";
import FavoriteEmpty from "@/modules/favorite/ui/components/FavoriteEmpty";
import { useMuseumsFavorites } from "@/hooks/useMuseumsFavorites";
import { useMuseumListStore } from "@/stores/museumListStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import AddCollectionModal from "@/modules/favorite/ui/components/AddCollectionModal";
import { Museum } from "@/types/museum";
import BlurNavigationHeader from "@/components/BlurNavigationHeader";
import { Doc } from "../../../../../convex/_generated/dataModel";

type ViewMode = "museum" | "artwork";
type ArtworkDoc = Doc<"artworks">;

const { width: screenWidth } = Dimensions.get("window");
const GRID_SPACING = 8;
const GRID_COLUMNS = 4;
const IMAGE_SIZE =
  (screenWidth - GRID_SPACING * (GRID_COLUMNS + 1)) / GRID_COLUMNS;

const FavoriteView = () => {
  const router = useRouter();
  const { artwork } = useLocalSearchParams<{ artwork?: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>(
    artwork === "true" ? "artwork" : "museum",
  );

  const { setMuseumList } = useMuseumListStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);

  // Museum queries
  const savedMuseumIds = useQuery(api.function.museums.getSavedMuseumIds, {
    userId: "1234",
  });
  const categorizedMuseumIds = useQuery(
    api.function.museumCategories.getMuseumsByCategories,
    {
      userId: "1234",
    },
  );

  // Artwork queries
  const savedArtworks = useQuery(api.function.artworks.getAllArtworks, {
    userId: "1234",
  });

  // Mutation for creating collections
  const createCollectionMutation = useMutation(
    api.function.museumCategories.createCollection,
  );

  const allMuseumIds = useMemo(() => {
    const savedIds = savedMuseumIds?.map((item) => item.museumId) || [];
    const categorizedIds = categorizedMuseumIds
      ? Object.values(categorizedMuseumIds)
          .flat()
          .map((item) => item.museumId)
      : [];

    return Array.from(new Set([...savedIds, ...categorizedIds]));
  }, [savedMuseumIds, categorizedMuseumIds]);

  const {
    data: museums = [],
    isLoading: loading,
    error,
  } = useMuseumsFavorites({ museumIds: allMuseumIds });

  const categories = useMemo(() => {
    if (viewMode === "artwork") {
      if (!savedArtworks || savedArtworks.length === 0) return [];

      return [
        {
          title: "Saved Artworks",
          count: savedArtworks.length,
          museums: [], // We'll handle artworks differently
          categoryKey: "saved-artworks",
          artworks: savedArtworks,
        },
      ];
    }

    // Museum categories logic (existing)
    if (museums.length === 0) return [];

    const categories: CategorySection[] = [];

    // Create museum lookup map
    const museumMap = new Map(
      museums.map((museum) => [museum.placeId, museum]),
    );

    // 1. Add "Your Favorites" with ALL saved museums
    if (savedMuseumIds && savedMuseumIds.length > 0) {
      const favoriteMuseums = savedMuseumIds
        .map((saved) => museumMap.get(saved.museumId))
        .filter((museum) => museum !== undefined);

      categories.push({
        title: "Saved",
        count: favoriteMuseums.length,
        museums: favoriteMuseums,
        categoryKey: "saved",
      });
    }

    // 2. Add custom categories
    if (categorizedMuseumIds && Object.keys(categorizedMuseumIds).length > 0) {
      Object.entries(categorizedMuseumIds).forEach(
        ([categoryName, museumData]) => {
          if (museumData.length === 0) return;

          // Get the display name from the first item (they should all be the same)
          const displayName =
            museumData[0]?.categoryDisplayName || categoryName;

          // Get museums for this category
          const categoryMuseums = museumData
            .map((item) => museumMap.get(item.museumId))
            .filter((museum) => museum !== undefined);

          if (categoryMuseums.length > 0) {
            categories.push({
              title: displayName,
              count: categoryMuseums.length,
              museums: categoryMuseums,
              categoryKey: categoryName,
            });
          }
        },
      );
    }

    return categories;
  }, [museums, savedMuseumIds, categorizedMuseumIds, viewMode, savedArtworks]);

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

  const ViewModePicker = () => (
    <View className="flex-row bg-gray-100 rounded-3xl mx-4 mb-4 shadow-sm">
      <TouchableOpacity
        onPress={() => setViewMode("museum")}
        className={`flex-1 py-2 px-4 rounded-3xl ${
          viewMode === "museum" ? "bg-white shadow-sm" : ""
        }`}
      >
        <Text
          className={`text-center text-base font-semibold ${
            viewMode === "museum" ? "text-gray-800" : "text-gray-500"
          }`}
        >
          Museums
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setViewMode("artwork")}
        className={`flex-1 py-2 px-4 rounded-3xl ${
          viewMode === "artwork" ? "bg-white shadow-sm" : ""
        }`}
      >
        <Text
          className={`text-center text-base font-semibold ${
            viewMode === "artwork" ? "text-gray-800" : " text-gray-500"
          }`}
        >
          Artworks
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderArtworkItem = ({ item }: { item: ArtworkDoc }) => (
    <TouchableOpacity
      onPress={() => handleArtworkPress(item)}
      style={{
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        marginRight: GRID_SPACING,
        marginBottom: GRID_SPACING,
      }}
    >
      <Image
        source={{ uri: item.imageUri }}
        style={{
          width: IMAGE_SIZE,
          height: IMAGE_SIZE,
          borderRadius: 8,
        }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

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
          <ViewModePicker />
        </View>
        <FavoriteEmpty onDiscoveryPress={handleDiscoveryPress} />
      </View>
    );
  }

  if (loading && viewMode === "museum") {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-2 text-gray-600">Fetching museum details...</Text>
      </View>
    );
  }

  if (error && viewMode === "museum") {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <View className="bg-white rounded-2xl p-6 items-center shadow-lg">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="text-red-500 text-center mt-4 font-semibold">
            Error loading museums
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            {error.message}
          </Text>
        </View>
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
        bottomComponent={<ViewModePicker />}
      />

      {viewMode === "museum" ? (
        <>
          <FlatList
            data={categories}
            numColumns={2}
            keyExtractor={(item) => item.categoryKey || item.title}
            renderItem={({ item }) => (
              <FavoriteGrid
                category={item}
                onPress={() => handleCategoryPress(item)}
              />
            )}
            columnWrapperStyle={{
              justifyContent: "space-between",
              paddingHorizontal: 16,
            }}
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: 170,
              paddingBottom: 32,
            }}
            showsVerticalScrollIndicator={false}
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
        <FlatList
          data={savedArtworks || []}
          renderItem={renderArtworkItem}
          keyExtractor={(item) => item._id}
          numColumns={GRID_COLUMNS}
          contentContainerStyle={{
            paddingTop: 170,
            paddingHorizontal: 16,
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
        />
      )}
    </View>
  );
};

export default FavoriteView;
