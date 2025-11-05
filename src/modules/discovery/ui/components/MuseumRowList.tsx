import { View, Text, FlatList, Pressable } from "react-native";
import React from "react";
import { Museum } from "@/types/museum";
import MuseumOverviewCard from "./MuseumOverviewCard";

interface MuseumRowListProps {
  title: string;
  museums: Museum[];
  onCardPress: (museumId: string) => void;
  onShowAll?: () => void;
}

const MuseumRowList = ({
  title,
  museums,
  onCardPress,
  onShowAll,
}: MuseumRowListProps) => {
  if (museums.length === 0) {
    return null;
  }

  return (
    <View className="mb-6">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 mb-4">
        <Text className="text-xl font-bold text-gray-900">{title}</Text>
        {onShowAll && (
          <Pressable onPress={onShowAll}>
            <Text className="text-base font-medium underline">Show all</Text>
          </Pressable>
        )}
      </View>

      {/* Horizontal ScrollView */}
      <FlatList
        horizontal
        data={museums}
        keyExtractor={(item) => item.placeId}
        renderItem={({ item }) => (
          <View className="w-80">
            <MuseumOverviewCard
              museum={item}
              variant="compact"
              onCardPress={() => onCardPress(item.placeId)}
            />
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 12,
          gap: 16,
        }}
      />
    </View>
  );
};

export default MuseumRowList;
