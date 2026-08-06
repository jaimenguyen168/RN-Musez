import React, { useMemo } from "react";
import { FlatList, TouchableOpacity, Dimensions, View, Text, Image } from "react-native";

import { useQuery } from "convex/react";
import { Doc } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";

type ArtworkDoc = Doc<"artworks">;

interface ArtworkModeViewProps {
  onArtworkPress: (artwork: ArtworkDoc) => void;
}

const { width: SW } = Dimensions.get("window");
const PAD = 20;
const GAP = 9;
const COLUMNS = 3;
const CARD_WIDTH = (SW - PAD * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

const formatWhen = (creationTime: number) => {
  const diffDays = Math.floor((Date.now() - creationTime) / 86400000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(creationTime).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const ArtworkModeView = ({ onArtworkPress }: ArtworkModeViewProps) => {
  const savedArtworks = useQuery(api.function.artworks.getAllArtworks);

  const sorted = useMemo(
    () => [...(savedArtworks ?? [])].sort((a, b) => b._creationTime - a._creationTime),
    [savedArtworks],
  );
  const [newest, ...rest] = sorted;

  const renderItem = ({ item }: { item: ArtworkDoc }) => (
    <TouchableOpacity
      onPress={() => onArtworkPress(item)}
      activeOpacity={0.85}
      className="bg-organic-surface rounded-2xl p-1.5 gap-1.5"
      style={{ width: CARD_WIDTH }}
    >
      <View className="w-full aspect-square rounded-xl overflow-hidden bg-organic-placeholder-a">
        <Image source={{ uri: item.imageUri }} className="w-full h-full" resizeMode="cover" />
      </View>
      <View className="px-0.5 pb-0.5 gap-0.5">
        <Text className="font-figtree-bold text-organic text-[11.5px] leading-4" numberOfLines={1}>
          {item.title || "Unidentified Artwork"}
        </Text>
        {item.artist ? (
          <Text className="font-figtree text-organic-muted text-[10.5px]" numberOfLines={1}>
            {item.artist}
          </Text>
        ) : (
          <Text className="font-figtree text-organic-faint text-[10.5px] italic">no artist</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={rest}
      renderItem={renderItem}
      keyExtractor={(item) => item._id}
      numColumns={COLUMNS}
      columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
      contentContainerStyle={{ paddingHorizontal: PAD, paddingTop: 4, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View className="gap-3 mb-[9px]">
          <Text className="font-figtree text-organic-muted text-[12.5px]">
            {sorted.length} artwork{sorted.length === 1 ? "" : "s"} saved
          </Text>
          {newest && (
            <TouchableOpacity
              onPress={() => onArtworkPress(newest)}
              activeOpacity={0.9}
              className="rounded-2xl overflow-hidden bg-organic-surface"
            >
              <View className="h-[176px] bg-organic-placeholder-a relative">
                <Image source={{ uri: newest.imageUri }} className="w-full h-full" resizeMode="cover" />
                <View className="absolute top-2.5 left-2.5 bg-organic-accent rounded-full px-3 py-1.5">
                  <Text className="font-figtree-bold text-organic-accent-soft text-[11px] uppercase tracking-wide">
                    Latest catch
                  </Text>
                </View>
              </View>
              <View className="px-3.5 py-3 gap-0.5">
                <Text className="font-heading text-organic text-[19px] leading-[23px]">
                  {newest.title || "Unidentified Artwork"}
                </Text>
                <Text className="font-figtree text-organic-muted text-[12.5px]">
                  {newest.artist ? `${newest.artist} · ` : ""}
                  {formatWhen(newest._creationTime)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      }
    />
  );
};

export default ArtworkModeView;
