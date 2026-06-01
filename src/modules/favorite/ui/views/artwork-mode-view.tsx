import React from "react";
import { FlatList, TouchableOpacity, Dimensions, View, Text, Image } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "convex/react";
import { Doc } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";

type ArtworkDoc = Doc<"artworks">;

interface ArtworkModeViewProps {
  onArtworkPress: (artwork: ArtworkDoc) => void;
}

const { width: SW } = Dimensions.get("window");
const PAD = 16;
const GAP = 8;
const COLUMNS = 3;
const CARD_WIDTH = (SW - PAD * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

const ArtworkModeView = ({ onArtworkPress }: ArtworkModeViewProps) => {
  const savedArtworks = useQuery(api.function.artworks.getAllArtworks);

  const renderItem = ({ item }: { item: ArtworkDoc }) => (
    <TouchableOpacity
      onPress={() => onArtworkPress(item)}
      activeOpacity={0.85}
      className="rounded-2xl overflow-hidden border bg-card border-soft"
      style={{ width: CARD_WIDTH }}
    >
      <View className="w-full aspect-square">
        <Image
          source={{ uri: item.imageUri }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.5)"]}
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%" }}
        />
      </View>
      <View className="p-2 gap-0.5">
        <Text className="text-[13px] font-semibold text-main" numberOfLines={1}>
          {item.title || "Unidentified Artwork"}
        </Text>
        {item.artist && (
          <Text className="text-xs text-secondary" numberOfLines={1}>
            {item.artist}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={savedArtworks || []}
      renderItem={renderItem}
      keyExtractor={(item) => item._id}
      numColumns={COLUMNS}
      contentContainerStyle={{ paddingHorizontal: PAD, paddingTop: 16, paddingBottom: 32 }}
      columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default ArtworkModeView;
