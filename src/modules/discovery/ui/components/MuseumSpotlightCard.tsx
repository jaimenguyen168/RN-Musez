import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { Museum } from "../../../../../convex/convexTypes";
import { useOrganicTheme } from "@/constants/organicTheme";
import { useMuseumCardInfo } from "@/modules/discovery/ui/hooks/useMuseumCardInfo";
import MuseumSaveButton from "./MuseumSaveButton";

interface MuseumSpotlightCardProps {
  museum: Museum;
  onPress: () => void;
}

const MuseumSpotlightCard = ({ museum, onPress }: MuseumSpotlightCardProps) => {
  const c = useOrganicTheme();
  const info = useMuseumCardInfo(museum);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="mx-5 rounded-[28px] overflow-hidden bg-organic-surface"
      style={{ shadowColor: c.shadow, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.16, shadowRadius: 20, elevation: 6 }}
    >
      <View className="h-[188px] bg-organic-placeholder-a">
        {info.hasPhoto ? (
          <Image source={{ uri: museum.imageUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="flex-1 items-center justify-center bg-organic-accent-soft">
            <Text className="font-heading text-organic-accent-strong text-[40px]">{info.initials}</Text>
          </View>
        )}
        <View className="absolute top-3 right-3">
          <MuseumSaveButton museumId={museum.osmId} size={18} containerSize={36} />
        </View>
      </View>

      <View className="p-[18px] pt-[15px] gap-[5px]">
        <Text className="font-heading text-organic text-[21px] leading-[25px]" numberOfLines={2}>
          {museum.name}
        </Text>
        <View className="flex-row items-center gap-2 flex-wrap">
          {info.hasRating ? (
            <>
              <Text className="font-figtree-bold text-organic text-[13.5px]">★ {info.ratingText}</Text>
              <Text className="font-figtree text-organic-muted text-[13.5px]">{info.reviewCountText} reviews</Text>
            </>
          ) : (
            <Text className="font-figtree italic text-organic-accent-strong text-[13.5px]">
              Be the first to review
            </Text>
          )}
          {info.distanceText && (
            <>
              <Text className="text-organic-muted">·</Text>
              <Text className="font-figtree text-organic-muted text-[13.5px]">{info.distanceText} away</Text>
            </>
          )}
        </View>
        {info.addr && (
          <Text className="font-figtree text-organic-muted text-[12.5px]" numberOfLines={1}>
            {info.addr}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default MuseumSpotlightCard;
