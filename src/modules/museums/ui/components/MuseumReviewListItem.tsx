import { View, Text, Image } from "react-native";
import React from "react";

interface MuseumReviewListItemProps {
  name: string;
  avatarUrl?: string | null;
  rating: number;
  time: string;
  comment?: string;
}

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const MuseumReviewListItem = ({ name, avatarUrl, rating, time, comment }: MuseumReviewListItemProps) => {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

  return (
    <View className="bg-organic-surface rounded-2xl p-3.5 gap-1.5">
      <View className="flex-row gap-2.5 items-center">
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} className="w-[34px] h-[34px] rounded-full" />
        ) : (
          <View className="w-[34px] h-[34px] rounded-full items-center justify-center bg-organic-accent2-soft">
            <Text className="font-figtree-extrabold text-organic-accent2 text-xs">{initialsOf(name)}</Text>
          </View>
        )}
        <View className="flex-1 min-w-0">
          <Text className="font-figtree-bold text-organic text-[13.5px]" numberOfLines={1}>
            {name}
          </Text>
          <Text className="font-figtree text-organic-muted text-[11.5px]">{time}</Text>
        </View>
        <Text className="text-organic-accent text-[13px] tracking-[1.5px]">{stars}</Text>
      </View>
      {!!comment && (
        <Text className="font-figtree text-organic-muted text-[13.5px] leading-[19px]">{comment}</Text>
      )}
    </View>
  );
};

export default MuseumReviewListItem;
