import React from "react";
import {
  FlatList,
  TouchableOpacity,
  Dimensions,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "convex/react";
import { Doc } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import { useTheme } from "@/provider/ThemeProvider";

type ArtworkDoc = Doc<"artworks">;

interface ArtworkModeViewProps {
  onArtworkPress: (artwork: ArtworkDoc) => void;
}

const { width: SW } = Dimensions.get("window");
const PAD = 16;
const GAP = 8;
const COLUMNS = 3;
const CARD_WIDTH = (SW - PAD * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

const ArtworkModeView = ({ onArtworkPress }: ArtworkModeViewProps) => {
  const { isDark } = useTheme();
  const savedArtworks = useQuery(api.function.artworks.getAllArtworks);

  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const textMain = isDark ? "#F9FAFB" : "#111827";
  const textSub = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#374151" : "#E5E7EB";

  const renderItem = ({ item }: { item: ArtworkDoc }) => (
    <TouchableOpacity
      onPress={() => onArtworkPress(item)}
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: cardBg, borderColor }]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: item.imageUri }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.5)"]}
          style={styles.imageGradient}
        />
      </View>
      <View style={styles.info}>
        <Text style={[styles.cardTitle, { color: textMain }]} numberOfLines={1}>
          {item.title || "Unidentified Artwork"}
        </Text>
        {item.artist && (
          <Text style={[styles.cardArtist, { color: textSub }]} numberOfLines={1}>
            {item.artist}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={savedArtworks || []}
      renderItem={renderItem}
      keyExtractor={(item) => item._id}
      numColumns={COLUMNS}
      contentContainerStyle={styles.grid}
      columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  grid: { paddingHorizontal: PAD, paddingTop: 16, paddingBottom: 32 },
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  imageWrap: { width: "100%", aspectRatio: 1, position: "relative" },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  info: { padding: 10, gap: 3 },
  cardTitle: { fontSize: 13, fontWeight: "600" },
  cardArtist: { fontSize: 12 },
});

export default ArtworkModeView;
