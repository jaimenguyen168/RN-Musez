import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import React from "react";
import { Museum } from "@/types/museum";
import { Ionicons } from "@expo/vector-icons";

const resolvePhotoUrl = (museum: Museum | null): string | null => {
  if (!museum) return null;
  const ref = museum.imageUrl ?? museum.photos?.[0]?.photoReference;
  if (!ref) return null;
  return ref.startsWith("http")
    ? ref
    : `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${ref}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY}`;
};

const { width } = Dimensions.get("window");
const CARD_MARGIN = 16;
const CARD_WIDTH = (width - CARD_MARGIN * 3) / 2;

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
  const getGridMuseums = (): (Museum | null)[] => {
    const museums: (Museum | null)[] = category.museums.slice(0, 4);

    while (museums.length < 4) {
      museums.push(null);
    }

    return museums;
  };

  const museums = getGridMuseums();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-card rounded-3xl overflow-hidden"
      style={{
        width: CARD_WIDTH,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Image Grid */}
      <View style={{ height: 160 }}>
        <View className="flex-row h-full">
          {/* Left Column */}
          <View className="flex-1">
            {[0, 2].map((index) => (
              <View
                key={index}
                className={`flex-1 mr-0.5 ${index === 0 ? "mb-0.5" : "mt-0.5"}`}
              >
                {resolvePhotoUrl(museums[index]) ? (
                  <Image
                    source={{ uri: resolvePhotoUrl(museums[index]) as string }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <View className="w-full h-full bg-surface items-center justify-center">
                    <Ionicons name="image-outline" size={24} color="#9CA3AF" />
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Right Column */}
          <View className="flex-1">
            {[1, 3].map((index) => (
              <View
                key={index}
                className={`flex-1 ml-0.5 ${index === 1 ? "mb-0.5" : "mt-0.5"}`}
              >
                {resolvePhotoUrl(museums[index]) ? (
                  <Image
                    source={{ uri: resolvePhotoUrl(museums[index]) as string }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <View className="w-full h-full bg-surface items-center justify-center">
                    <Ionicons
                      name="image-outline"
                      size={index === 1 ? 24 : 20}
                      color="#9CA3AF"
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Overlay for extra count */}
        {category.count > 4 && (
          <View className="absolute bottom-2 right-2 bg-black/60 rounded-full px-2 py-1">
            <Text className="text-white text-xs font-semibold">
              +{category.count - 4}
            </Text>
          </View>
        )}
      </View>

      {/* Card Content */}
      <View className="p-4">
        <Text className="text-lg font-bold text-main mb-1">
          {category.title}
        </Text>
        <Text className="text-secondary text-sm">{category.count} Saved</Text>
      </View>
    </TouchableOpacity>
  );
};

export default FavoriteGrid;
