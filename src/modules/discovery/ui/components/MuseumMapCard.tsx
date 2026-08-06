import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { Museum } from "../../../../../convex/convexTypes";
import { useOrganicTheme } from "@/constants/organicTheme";
import { useMuseumCardInfo } from "@/modules/discovery/ui/hooks/useMuseumCardInfo";
import MuseumSaveButton from "./MuseumSaveButton";

interface MuseumMapCardProps {
  museum: Museum;
  onPress: () => void;
}

const MuseumMapCard = ({ museum, onPress }: MuseumMapCardProps) => {
  const c = useOrganicTheme();
  const info = useMuseumCardInfo(museum);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="flex-row gap-3 p-[13px] px-[15px] items-center bg-organic rounded-2xl"
      style={{ shadowColor: c.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 8 }}
    >
      <View className="w-[58px] h-[58px] rounded-lg overflow-hidden bg-organic-placeholder-a">
        {info.hasPhoto ? (
          <Image source={{ uri: museum.imageUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="flex-1 items-center justify-center bg-organic-accent-soft">
            <Text className="font-heading text-organic-accent-strong text-lg">{info.initials}</Text>
          </View>
        )}
      </View>

      <View className="flex-1 gap-[3px]">
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
        {info.statusLabel && (
          <Text
            className={`font-figtree-bold text-[12px] ${info.isOpen ? "text-organic-status-open" : "text-organic-status-closed"}`}
          >
            {info.statusLabel}
          </Text>
        )}
      </View>

      <MuseumSaveButton museumId={museum.osmId} size={18} containerSize={34} onPhoto={false} />
    </TouchableOpacity>
  );
};

export default MuseumMapCard;
