import React from "react";
import { FlatList, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useQuery } from "convex/react";
import { Doc } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import { useTheme } from "@/provider/ThemeProvider";

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
  const { isDark } = useTheme();
  const savedArtworks = useQuery(api.function.artworks.getAllArtworks);

  const renderArtworkItem = ({ item }: { item: ArtworkDoc }) => (
    <TouchableOpacity
      onPress={() => onArtworkPress(item)}
      className="aspect-square m-1"
      style={{ width: itemWidth }}
    >
      <Image
        source={{ uri: item.imageUri }}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 8,
          borderWidth: 1,
          borderColor: isDark ? "#9CA3AF" : "#D1D5DB",
        }}
        contentFit="cover"
        cachePolicy="memory-disk"
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
        paddingTop: 180,
        paddingHorizontal: 16,
        paddingBottom: 32,
      }}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
    />
  );
};

export default ArtworkModeView;
