import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Museum } from "../../../../../convex/convexTypes";
import { useOrganicTheme } from "@/constants/organicTheme";

export interface CategorySection {
  title: string;
  count: number;
  museums: Museum[];
  categoryKey?: string;
  isAll?: boolean;
}

interface FavoriteGroupRowProps {
  category: CategorySection;
  onPress: () => void;
}

const FavoriteGroupRow = ({ category, onPress }: FavoriteGroupRowProps) => {
  const c = useOrganicTheme();
  const [primary, secondary] = category.museums;
  const primaryUrl = primary?.imageUrl ?? null;
  const secondaryUrl = secondary?.imageUrl ?? null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="bg-organic-surface rounded-2xl p-3 flex-row gap-3.5 items-center"
    >
      <View className="w-[72px] h-[72px] rounded-2xl overflow-hidden bg-organic-placeholder-a relative">
        {primaryUrl ? (
          <Image source={{ uri: primaryUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Ionicons name="image-outline" size={20} color={c.textFaint} />
          </View>
        )}
        {secondaryUrl && (
          <View className="absolute right-0 bottom-0 w-[34px] h-[34px] rounded-tl-xl overflow-hidden border-2 border-organic-surface">
            <Image source={{ uri: secondaryUrl }} className="w-full h-full" resizeMode="cover" />
          </View>
        )}
      </View>

      <View className="flex-1 gap-1">
        <View className="flex-row gap-2 items-center flex-wrap">
          <Text className="font-heading text-organic text-[17px]">{category.title}</Text>
          {category.isAll && (
            <View className="bg-organic-accent-soft rounded-full px-2.5 py-0.5">
              <Text className="font-figtree-bold text-organic-accent-strong text-[10.5px] uppercase tracking-wide">
                All bookmarks
              </Text>
            </View>
          )}
        </View>
        <Text className="font-figtree text-organic-muted text-[12.5px]">
          {category.count} {category.count === 1 ? "museum" : "museums"}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={17} color={c.textFaint} />
    </TouchableOpacity>
  );
};

export default FavoriteGroupRow;
