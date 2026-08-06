import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { Museum } from "../../../../../convex/convexTypes";
import { useMuseumCardInfo } from "@/modules/discovery/ui/hooks/useMuseumCardInfo";
import MuseumSaveButton from "./MuseumSaveButton";

interface MuseumSearchRowProps {
  museum: Museum;
  onPress: () => void;
}

const MuseumSearchRow = ({ museum, onPress }: MuseumSearchRowProps) => {
  const info = useMuseumCardInfo(museum);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="flex-row gap-3 p-3 px-3.5 items-center bg-organic-surface rounded-2xl"
      style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 }}
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

export default MuseumSearchRow;
