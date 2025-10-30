import { ActivityIndicator, FlatList, Text, View, Alert } from "react-native";
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
import { useRouter } from "expo-router";
import FavoriteHeader from "@/modules/favorite/ui/components/FavoriteHeader";
import AddCollectionModal from "@/modules/favorite/ui/components/AddCollectionModal";
import { Museum } from "@/types";

const FavoriteView = () => {
  const router = useRouter();
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
        title: "Your Favorites",
        count: favoriteMuseums.length,
        museums: favoriteMuseums,
        categoryKey: "all_favorites",
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
  }, [museums, savedMuseumIds, categorizedMuseumIds]);

  const handleDiscoveryPress = () => {
    router.push("/discovery");
  };

  const handleCategoryPress = (category: CategorySection) => {
    setMuseumList(category.title, category.museums);
    router.push("/museums");
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

  if (!savedMuseumIds && !categorizedMuseumIds) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-2 text-gray-600">Loading saved museums...</Text>
      </View>
    );
  }

  if (
    (!savedMuseumIds || savedMuseumIds.length === 0) &&
    (!categorizedMuseumIds || Object.keys(categorizedMuseumIds).length === 0)
  ) {
    return (
      <View className="flex-1 bg-gray-50">
        <FavoriteHeader onAddPress={handleAddFavoriteCollectionPress} />
        <FavoriteEmpty onDiscoveryPress={handleDiscoveryPress} />
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-2 text-gray-600">Fetching museum details...</Text>
      </View>
    );
  }

  if (error) {
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

  return (
    <View className="flex-1 bg-gray-50 relative">
      <FavoriteHeader onAddPress={handleAddFavoriteCollectionPress} />
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
          paddingTop: 128,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal */}
      <AddCollectionModal
        visible={isModalVisible}
        onClose={closeModal}
        museums={museums}
        onCreateCollection={handleCreateCollection}
        isCreating={isCreatingCollection}
      />
    </View>
  );
};

export default FavoriteView;
