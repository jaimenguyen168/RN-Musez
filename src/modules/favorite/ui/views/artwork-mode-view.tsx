import React from "react";
import { FlatList, TouchableOpacity, Image, Dimensions } from "react-native";
import { useQuery } from "convex/react";
import { Doc } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";

type ArtworkDoc = Doc<"artworks">;

interface ArtworkModeViewProps {
  onArtworkPress: (artwork: ArtworkDoc) => void;
}

const { width: screenWidth } = Dimensions.get("window");
const HORIZONTAL_PADDING = 32;
const MARGIN_PER_ITEM = 8;
const COLUMNS = 4;

const availableWidth = screenWidth - HORIZONTAL_PADDING;
const totalMarginWidth = MARGIN_PER_ITEM * COLUMNS;
const itemWidth = (availableWidth - totalMarginWidth) / COLUMNS;

const ArtworkModeView = ({ onArtworkPress }: ArtworkModeViewProps) => {
  const savedArtworks = useQuery(api.function.artworks.getAllArtworks);

  const renderArtworkItem = ({ item }: { item: ArtworkDoc }) => (
    <TouchableOpacity
      onPress={() => onArtworkPress(item)}
      className="aspect-square m-1"
      style={{ width: itemWidth }}
    >
      <Image
        source={{ uri: item.imageUri }}
        className="flex-1 border-gray-300 dark:border-gray-400 border rounded-lg"
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={savedArtworks || []}
      renderItem={renderArtworkItem}
      keyExtractor={(item) => item._id}
      numColumns={4}
      contentContainerStyle={{
        paddingTop: 170,
        paddingHorizontal: 16,
        paddingBottom: 32,
      }}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
    />
  );
};

export default ArtworkModeView;
