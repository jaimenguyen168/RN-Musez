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
const GRID_SPACING = 8;
const GRID_COLUMNS = 4;
const IMAGE_SIZE =
  (screenWidth - GRID_SPACING * (GRID_COLUMNS + 1)) / GRID_COLUMNS;

const ArtworkModeView = ({ onArtworkPress }: ArtworkModeViewProps) => {
  const savedArtworks = useQuery(api.function.artworks.getAllArtworks);

  const renderArtworkItem = ({ item }: { item: ArtworkDoc }) => (
    <TouchableOpacity
      onPress={() => onArtworkPress(item)}
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

  return (
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
  );
};
export default ArtworkModeView;
