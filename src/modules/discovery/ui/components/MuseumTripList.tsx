import { View, Text, Image, TouchableOpacity, Pressable } from "react-native";
import React from "react";
import { Museum } from "../../../../../convex/convexTypes";
import { useMuseumCardInfo } from "@/modules/discovery/ui/hooks/useMuseumCardInfo";
import MuseumSaveButton from "./MuseumSaveButton";

interface MuseumTripListProps {
  title: string;
  museums: Museum[];
  onCardPress: (museumId: string) => void;
  onShowAll?: () => void;
  footerText?: string;
  maxItems?: number;
}

const MuseumTripList = ({
  title,
  museums,
  onCardPress,
  onShowAll,
  footerText,
  maxItems = 30,
}: MuseumTripListProps) => {
  if (museums.length === 0) return null;

  // Rendered as a plain View, not a FlatList — this list sits inside a single
  // item of the outer (vertical) FlatList that AnimatedHeaderWrapper renders
  // the whole Discovery screen with, and nesting a same-orientation
  // VirtualizedList inside another breaks scrolling. Each row opens its own
  // Convex subscription (save state) though, so cap how many render instead.
  const visibleMuseums = museums.slice(0, maxItems);

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

      <View className="mx-5 bg-organic-surface rounded-2xl overflow-hidden">
        {visibleMuseums.map((museum, index) => (
          <TripRow
            key={museum.osmId}
            museum={museum}
            onPress={() => onCardPress(museum.osmId)}
            isLast={index === visibleMuseums.length - 1}
          />
        ))}
      </View>

      {footerText && (
        <Text className="font-figtree text-organic-faint text-[12.5px] text-center px-5">{footerText}</Text>
      )}
    </View>
  );
};

export default MuseumTripList;

const TripRow = ({ museum, onPress, isLast }: { museum: Museum; onPress: () => void; isLast: boolean }) => {
  const info = useMuseumCardInfo(museum);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`flex-row gap-3 p-3 px-3.5 items-center ${!isLast ? "border-b border-organic-divider" : ""}`}
    >
      <View className="w-[52px] h-[52px] rounded-lg overflow-hidden bg-organic-placeholder-a">
        {info.hasPhoto ? (
          <Image source={{ uri: museum.imageUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="flex-1 items-center justify-center bg-organic-accent-soft">
            <Text className="font-heading text-organic-accent-strong text-base">{info.initials}</Text>
          </View>
        )}
      </View>

      <View className="flex-1 gap-0.5">
        <Text className="font-figtree-bold text-organic text-[14.5px] leading-[18px]" numberOfLines={1}>
          {museum.name}
        </Text>
        <View className="flex-row flex-wrap gap-1.5">
          {info.distanceText && (
            <Text className="font-figtree text-organic-muted text-[12.5px]">{info.distanceText}</Text>
          )}
          {info.hasRating ? (
            <Text className="font-figtree-bold text-organic text-[12.5px]">★ {info.ratingText}</Text>
          ) : (
            <Text className="font-figtree italic text-organic-accent-strong text-[12.5px]">be the first to review</Text>
          )}
        </View>
      </View>

      <MuseumSaveButton museumId={museum.osmId} size={17} containerSize={32} onPhoto={false} />
    </TouchableOpacity>
  );
};
