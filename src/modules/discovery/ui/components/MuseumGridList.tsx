import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { Museum } from "@/types/museum";
import { useTheme } from "@/provider/ThemeProvider";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface MuseumGridListProps {
  title: string;
  museums: Museum[];
  onCardPress: (museumId: string) => void;
}

const MuseumGridList = ({ title, museums, onCardPress }: MuseumGridListProps) => {
  const { isDark } = useTheme();
  if (museums.length === 0) return null;

  return (
    <View style={{ marginBottom: 24 }}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? "#F9FAFB" : "#111827" }]}>{title}</Text>
      </View>

      <View style={styles.grid}>
        {museums.map((museum) => (
          <View key={museum.placeId} style={styles.gridItem}>
            <MuseumGridCard
              museum={museum}
              onCardPress={() => onCardPress(museum.placeId)}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

export default MuseumGridList;

interface MuseumGridCardProps {
  museum: Museum;
  onCardPress?: () => void;
}

const MuseumGridCard = ({ museum, onCardPress }: MuseumGridCardProps) => {
  const { isDark } = useTheme();
  const photoRef = museum.imageUrl ?? museum?.photos?.[0]?.photoReference;
  const photoUrl = photoRef
    ? photoRef.startsWith("http")
      ? photoRef
      : `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY}`
    : null;

  return (
    <TouchableOpacity
      onPress={onCardPress}
      activeOpacity={0.9}
      style={[styles.card, { shadowColor: isDark ? "#000" : "#374151" }]}
    >
      {/* Image fills entire card */}
      <View style={StyleSheet.absoluteFillObject}>
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={[{ width: "100%", height: "100%" }, styles.placeholder]}>
            <Ionicons name="image-outline" size={32} color="#9CA3AF" />
          </View>
        )}
      </View>

      {/* Gradient */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.16)", "rgba(0,0,0,0.68)"]}
        start={{ x: 0, y: 0.4 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Rating chip top-right */}
      <View style={styles.ratingChip}>
        <Ionicons name="star" size={10} color="#F59E0B" />
        <Text style={styles.ratingText}>{museum.rating?.toFixed(1) ?? "0.0"}</Text>
      </View>

      {/* Name at bottom */}
      <View style={styles.bottomContent}>
        <Text style={styles.name} numberOfLines={2}>
          {museum.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
  },
  gridItem: {
    width: "48%",
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    height: 172,
    backgroundColor: "#E5E7EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  ratingChip: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  ratingText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
  },
  bottomContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  name: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
});
