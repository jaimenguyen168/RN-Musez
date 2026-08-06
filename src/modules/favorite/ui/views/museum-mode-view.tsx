import React, { useMemo, useEffect } from "react";
import { FlatList, View, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { useQuery } from "convex/react";
import FavoriteGroupRow, { CategorySection } from "@/modules/favorite/ui/components/FavoriteGroupRow";
import { useMuseumsFavorites } from "@/hooks/useMuseumsFavorites";
import { api } from "../../../../../convex/_generated/api";
import { Museum } from "../../../../../convex/convexTypes";
import { useOrganicTheme } from "@/constants/organicTheme";

interface MuseumModeViewProps {
  onCategoryPress: (category: CategorySection) => void;
  onMuseumsLoaded: (museums: Museum[]) => void;
  onNewGroupPress: () => void;
}

const MuseumModeView = ({ onCategoryPress, onMuseumsLoaded, onNewGroupPress }: MuseumModeViewProps) => {
  const c = useOrganicTheme();
  const savedMuseumIds = useQuery(api.function.museums.getSavedMuseumIds, {});
  const categorizedMuseumIds = useQuery(
    api.function.museumCategories.getMuseumsByCategories,
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

  // Send museums back to parent when they're loaded
  useEffect(() => {
    if (museums.length > 0) {
      onMuseumsLoaded(museums);
    }
  }, [museums, onMuseumsLoaded]);

  const categories = useMemo(() => {
    if (museums.length === 0) return [];

    const categories: CategorySection[] = [];

    // Create museum lookup map
    const museumMap = new Map(
      museums.map((museum) => [museum.osmId, museum]),
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
        isAll: true,
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
      <View className="flex-1 justify-center items-center bg-organic">
        <ActivityIndicator size="large" color={c.accent} />
        <Text className="font-figtree text-organic-muted text-sm mt-2">Fetching museum details...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-5 bg-organic gap-1.5">
        <Text className="font-heading text-organic-status-closed text-base">Error loading museums</Text>
        <Text className="font-figtree text-organic-muted text-sm text-center">{error.message}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => item.categoryKey || item.title}
      renderItem={({ item }) => (
        <FavoriteGroupRow category={item} onPress={() => onCategoryPress(item)} />
      )}
      ListHeaderComponent={
        <Text className="font-figtree text-organic-muted text-[12.5px] mb-3">
          {categories.length} group{categories.length === 1 ? "" : "s"}
        </Text>
      }
      ListFooterComponent={
        <TouchableOpacity
          onPress={onNewGroupPress}
          className="mt-2.5 py-4 rounded-2xl items-center border-2 border-dashed border-organic-divider"
        >
          <Text className="font-heading text-organic-accent-strong text-[14.5px]">＋ New group</Text>
        </TouchableOpacity>
      }
      ItemSeparatorComponent={() => <View className="h-2.5" />}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 4,
        paddingBottom: 32,
      }}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default MuseumModeView;
