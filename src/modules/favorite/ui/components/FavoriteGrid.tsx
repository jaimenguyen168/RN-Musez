import { View, Text, TouchableOpacity, Dimensions, Image } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Museum } from "../../../../../convex/convexTypes";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/provider/ThemeProvider";

const resolvePhotoUrl = (museum: Museum | null): string | null => museum?.imageUrl ?? null;

const { width } = Dimensions.get("window");
const GAP = 10;
const SIDE = 16;
const CARD_WIDTH = (width - SIDE * 2 - GAP) / 2;

export interface CategorySection {
  title: string;
  count: number;
  museums: Museum[];
  categoryKey?: string;
}

interface FavoriteGridProps {
  category: CategorySection;
  onPress: () => void;
}

const FavoriteGrid = ({ category, onPress }: FavoriteGridProps) => {
  const { isDark } = useTheme();

  const museums: (Museum | null)[] = [
    ...category.museums.slice(0, 4),
    ...Array(Math.max(0, 4 - category.museums.length)).fill(null),
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="rounded-[18px] overflow-hidden mb-2.5 bg-card"
      style={{
        width: CARD_WIDTH,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
      }}
    >
      {/* 2×2 mosaic */}
      <View className="h-40 flex-row relative">
        {[0, 1].map((col) => (
          <View key={col} className="flex-1">
            {[col * 2, col * 2 + 1].map((i, rowIdx) => {
              const url = resolvePhotoUrl(museums[i]);
              return (
                <View key={i} className={`flex-1 ${rowIdx === 0 ? "mb-0.5" : "mt-0.5"}`}>
                  {url ? (
                    <Image source={{ uri: url }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <View className="w-full h-full items-center justify-center bg-surface">
                      <Ionicons name="image-outline" size={20} color="#9CA3AF" />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.35)"]}
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60 }}
        />

        {category.count > 4 && (
          <View className="absolute bottom-2 right-2 bg-black/55 rounded-full px-2 py-0.5">
            <Text className="text-white text-[11px] font-bold">+{category.count - 4}</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View className="flex-row items-center justify-between px-3.5 py-3">
        <View className="flex-1 gap-0.5">
          <Text className="text-sm font-bold text-main" numberOfLines={1}>
            {category.title}
          </Text>
          <Text className="text-xs text-secondary">
            {category.count} {category.count === 1 ? "museum" : "museums"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={isDark ? "#4B5563" : "#D1D5DB"} />
      </View>
    </TouchableOpacity>
  );
};

export default FavoriteGrid;
