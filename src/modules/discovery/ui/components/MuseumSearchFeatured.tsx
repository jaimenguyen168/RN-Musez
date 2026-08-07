import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { Museum } from "../../../../../convex/convexTypes";
import { useMuseumCardInfo } from "@/modules/discovery/ui/hooks/useMuseumCardInfo";
import MuseumSaveButton from "./MuseumSaveButton";
import { useOrganicTheme } from "@/constants/organicTheme";

interface MuseumSearchFeaturedProps {
  museum: Museum;
  onPress: () => void;
}

const MuseumSearchFeatured = ({ museum, onPress }: MuseumSearchFeaturedProps) => {
  const c = useOrganicTheme();
  const info = useMuseumCardInfo(museum);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="rounded-2xl overflow-hidden bg-organic-surface"
      style={{ shadowColor: c.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 5 }}
    >
      <View className="h-[158px] bg-organic-placeholder-a relative">
        {info.hasPhoto ? (
          <Image source={{ uri: museum.imageUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full items-center justify-center bg-organic-accent-soft">
            <Text className="font-heading text-organic-accent-strong text-[40px]">{info.initials}</Text>
          </View>
        )}
        <View className="absolute top-2.5 right-2.5">
          <MuseumSaveButton museumId={museum.osmId} size={17} containerSize={34} />
        </View>
        {info.isOpen !== undefined && (
          <View
            className="absolute left-[11px] bottom-[11px] rounded-full px-3 py-1"
            style={{ backgroundColor: info.isOpen ? c.accent2Soft : c.accentSoft }}
          >
            <Text className="font-figtree-bold text-[11px]" style={{ color: info.isOpen ? c.statusOpen : c.statusClosed }}>
              {info.statusLabel}
            </Text>
          </View>
        )}
      </View>

      <View className="px-[15px] pt-[13px] pb-[15px] gap-1">
        <Text className="font-heading text-organic text-[19px] leading-[23px]" numberOfLines={1}>
          {museum.name}
        </Text>
        {info.addr && (
          <Text className="font-figtree text-organic-faint text-xs" numberOfLines={1}>
            {info.addr}
          </Text>
        )}
        <View className="flex-row gap-1.5 items-center flex-wrap">
          {info.hasRating ? (
            <>
              <Text className="font-figtree-bold text-organic text-[12.5px]">★ {info.ratingText}</Text>
              <Text className="font-figtree text-organic-muted text-[12.5px]">({info.reviewCountText})</Text>
            </>
          ) : (
            <Text className="font-figtree italic text-organic-accent-strong text-[12.5px]">
              be the first to review
            </Text>
          )}
          {info.distanceText && (
            <Text className="font-figtree text-organic-muted text-[12.5px]">· {info.distanceText}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MuseumSearchFeatured;
