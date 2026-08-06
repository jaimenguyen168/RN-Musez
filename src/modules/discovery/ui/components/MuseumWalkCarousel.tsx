import { View, Text, Image, TouchableOpacity, FlatList, Pressable } from "react-native";
import React from "react";
import { Museum } from "../../../../../convex/convexTypes";
import { useOrganicTheme } from "@/constants/organicTheme";
import { useMuseumCardInfo } from "@/modules/discovery/ui/hooks/useMuseumCardInfo";
import MuseumSaveButton from "./MuseumSaveButton";

interface MuseumWalkCarouselProps {
  title: string;
  museums: Museum[];
  onCardPress: (museumId: string) => void;
  onShowAll?: () => void;
}

const MuseumWalkCarousel = ({ title, museums, onCardPress, onShowAll }: MuseumWalkCarouselProps) => {
  if (museums.length === 0) return null;

  return (
    <View className="gap-2.5">
      <View className="flex-row justify-between items-baseline px-5">
        <Text className="font-heading text-organic text-[19px]">{title}</Text>
        {onShowAll && (
          <Pressable onPress={onShowAll}>
            <Text className="font-figtree-bold text-organic-accent-strong text-[13px]">Show all</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        horizontal
        data={museums}
        keyExtractor={(item) => item.osmId}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 8, paddingTop: 2 }}
        renderItem={({ item }) => (
          <WalkCard museum={item} onPress={() => onCardPress(item.osmId)} />
        )}
      />
    </View>
  );
};

export default MuseumWalkCarousel;

const WalkCard = ({ museum, onPress }: { museum: Museum; onPress: () => void }) => {
  const c = useOrganicTheme();
  const info = useMuseumCardInfo(museum);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="w-[158px] bg-organic-surface rounded-2xl overflow-hidden"
      style={{ shadowColor: c.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}
    >
      <View className="h-[94px] bg-organic-placeholder-a">
        {info.hasPhoto ? (
          <Image source={{ uri: museum.imageUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="flex-1 items-center justify-center bg-organic-accent-soft">
            <Text className="font-heading text-organic-accent-strong text-2xl">{info.initials}</Text>
          </View>
        )}
        <View className="absolute top-2 right-2">
          <MuseumSaveButton museumId={museum.osmId} size={14} containerSize={28} />
        </View>
      </View>

      <View className="p-[11px] pt-2.5 gap-1">
        <Text className="font-figtree-bold text-organic text-sm leading-[18px]" numberOfLines={2}>
          {museum.name}
        </Text>
        <View className="flex-row flex-wrap gap-1.5">
          {info.distanceText && (
            <Text className="font-figtree text-organic-muted text-xs">{info.distanceText}</Text>
          )}
          {info.hasRating ? (
            <Text className="font-figtree-bold text-organic text-xs">★ {info.ratingText}</Text>
          ) : (
            <Text className="font-figtree italic text-organic-accent-strong text-xs">no reviews yet</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
