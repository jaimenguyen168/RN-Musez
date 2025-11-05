import React, { useMemo } from "react";
import { FlatList, View, ActivityIndicator, Text } from "react-native";
import { useQuery } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import FavoriteGrid, {
  CategorySection,
} from "@/modules/favorite/ui/components/FavoriteGrid";
import { useMuseumsFavorites } from "@/hooks/useMuseumsFavorites";
import { api } from "../../../../../convex/_generated/api";

interface MuseumModeViewProps {
  onCategoryPress: (category: CategorySection) => void;
}

const MuseumModeView = ({ onCategoryPress }: MuseumModeViewProps) => {
  const savedMuseumIds = useQuery(api.function.museums.getSavedMuseumIds, {
    userId: "1234",
  });
  const categorizedMuseumIds = useQuery(
    api.function.museumCategories.getMuseumsByCategories,
    {
      userId: "1234",
    },
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

    // 1. Add "Saved" with ALL saved museums
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
  }, [museums, savedMuseumIds, categorizedMuseumIds]);

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-2 text-gray-600">Fetching museum details...</Text>
      </View>
    );
  }

  // Error state
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
    <FlatList
      data={categories}
      numColumns={2}
      keyExtractor={(item) => item.categoryKey || item.title}
      renderItem={({ item }) => (
        <FavoriteGrid category={item} onPress={() => onCategoryPress(item)} />
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
  );
};

export default MuseumModeView;
