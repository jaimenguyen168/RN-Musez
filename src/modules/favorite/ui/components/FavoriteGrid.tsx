import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Museum } from "@/types/museum";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/provider/ThemeProvider";

const resolvePhotoUrl = (museum: Museum | null): string | null => {
  if (!museum) return null;
  const ref = museum.imageUrl ?? museum.photos?.[0]?.photoReference;
  if (!ref) return null;
  return ref.startsWith("http")
    ? ref
    : `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${ref}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY}`;
};

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
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const textMain = isDark ? "#F9FAFB" : "#111827";
  const textSub = isDark ? "#9CA3AF" : "#6B7280";

  const museums: (Museum | null)[] = [
    ...category.museums.slice(0, 4),
    ...Array(Math.max(0, 4 - category.museums.length)).fill(null),
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: cardBg, width: CARD_WIDTH }]}
    >
      {/* 2×2 image mosaic */}
      <View style={styles.mosaic}>
        <View style={styles.mosaicCol}>
          {[0, 2].map((i) => {
            const url = resolvePhotoUrl(museums[i]);
            return (
              <View key={i} style={[styles.mosaicCell, i === 0 ? { marginBottom: 2 } : { marginTop: 2 }]}>
                {url ? (
                  <Image source={{ uri: url }} style={styles.mosaicImg} contentFit="cover" cachePolicy="memory-disk" />
                ) : (
                  <View style={[styles.mosaicPlaceholder, { backgroundColor: isDark ? "#374151" : "#F3F4F6" }]}>
                    <Ionicons name="image-outline" size={20} color="#9CA3AF" />
                  </View>
                )}
              </View>
            );
          })}
        </View>
        <View style={styles.mosaicCol}>
          {[1, 3].map((i) => {
            const url = resolvePhotoUrl(museums[i]);
            return (
              <View key={i} style={[styles.mosaicCell, i === 1 ? { marginBottom: 2 } : { marginTop: 2 }]}>
                {url ? (
                  <Image source={{ uri: url }} style={styles.mosaicImg} contentFit="cover" cachePolicy="memory-disk" />
                ) : (
                  <View style={[styles.mosaicPlaceholder, { backgroundColor: isDark ? "#374151" : "#F3F4F6" }]}>
                    <Ionicons name="image-outline" size={20} color="#9CA3AF" />
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Gradient overlay at bottom */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.35)"]}
          style={styles.mosaicGradient}
        />

        {/* Extra count badge */}
        {category.count > 4 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>+{category.count - 4}</Text>
          </View>
        )}
      </View>

      {/* Card footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={[styles.footerTitle, { color: textMain }]} numberOfLines={1}>
            {category.title}
          </Text>
          <Text style={[styles.footerCount, { color: textSub }]}>
            {category.count} {category.count === 1 ? "museum" : "museums"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={isDark ? "#4B5563" : "#D1D5DB"} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: GAP,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  mosaic: {
    height: 160,
    flexDirection: "row",
    position: "relative",
  },
  mosaicCol: { flex: 1 },
  mosaicCell: { flex: 1 },
  mosaicImg: { width: "100%", height: "100%" },
  mosaicPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  mosaicGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  countBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  countBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  footerLeft: { flex: 1, gap: 2 },
  footerTitle: { fontSize: 14, fontWeight: "700" },
  footerCount: { fontSize: 12 },
});

export default FavoriteGrid;
