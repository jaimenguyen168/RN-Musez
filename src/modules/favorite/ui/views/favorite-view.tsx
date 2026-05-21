import {
  ActivityIndicator,
  Text,
  View,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CategorySection } from "@/modules/favorite/ui/components/FavoriteGrid";
import FavoriteMuseumsEmpty from "@/modules/favorite/ui/components/FavoriteMuseumsEmpty";
import { useMuseumListStore } from "@/stores/museumListStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import AddCollectionModal from "@/modules/favorite/ui/components/AddCollectionModal";
import { Museum } from "@/types/museum";
import { Doc } from "../../../../../convex/_generated/dataModel";
import MuseumModeView from "@/modules/favorite/ui/views/museum-mode-view";
import ArtworkModeView from "@/modules/favorite/ui/views/artwork-mode-view";
import TabsPicker from "@/components/TabsPicker";
import FavoriteArtworksEmpty from "@/modules/favorite/ui/components/FavoriteArtworksEmpty";
import { useTheme } from "@/provider/ThemeProvider";

type ViewMode = "museum" | "artwork";
type ArtworkDoc = Doc<"artworks">;

const FavoriteView = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { artwork } = useLocalSearchParams<{ artwork?: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>(
    artwork === "true" ? "artwork" : "museum",
  );

  const { setMuseumList } = useMuseumListStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [museums, setMuseums] = useState<Museum[]>([]);

  const savedMuseumIds = useQuery(api.function.museums.getSavedMuseumIds);
  const categorizedMuseumIds = useQuery(api.function.museumCategories.getMuseumsByCategories);
  const savedArtworks = useQuery(api.function.artworks.getAllArtworks);

  const viewModeOptions: [string, string] = ["Museums", "Artworks"];

  const createCollectionMutation = useMutation(api.function.museumCategories.createCollection);

  const bg = isDark ? "#111827" : "#FAFAFA";
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const textMain = isDark ? "#F9FAFB" : "#111827";
  const textSub = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#374151" : "#E5E7EB";

  const getDisplayValue = (mode: ViewMode) => mode === "museum" ? "Museums" : "Artworks";
  const getInternalValue = (display: string): ViewMode => display === "Museums" ? "museum" : "artwork";

  const handleDiscoveryPress = () => router.push("/discovery");
  const handleSnapPress = () => router.push("/snap");
  const handleCategoryPress = (category: CategorySection) => {
    setMuseumList(category.title, category.museums);
    router.push("/collections");
  };
  const handleArtworkPress = (artwork: ArtworkDoc) => router.push(`/artworks/${artwork._id}`);
  const handleMuseumsLoaded = (loadedMuseums: Museum[]) => setMuseums(loadedMuseums);

  const handleCreateCollection = async (name: string, selectedMuseums: Museum[]) => {
    try {
      setIsCreatingCollection(true);
      const result = await createCollectionMutation({
        collectionName: name,
        museumIds: selectedMuseums.map((m) => m.placeId),
      });
      if (result.success) {
        Alert.alert("Success", `Collection "${result.categoryDisplayName}" created with ${result.museumsAdded} museums.`);
        setIsModalVisible(false);
      } else {
        Alert.alert("Error", result.message || "Failed to create collection");
      }
    } catch {
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setIsCreatingCollection(false);
    }
  };

  const isLoading = !savedMuseumIds && !categorizedMuseumIds;
  const isEmpty =
    viewMode === "museum"
      ? (!savedMuseumIds || savedMuseumIds.length === 0) &&
        (!categorizedMuseumIds || Object.keys(categorizedMuseumIds).length === 0)
      : !savedArtworks || savedArtworks.length === 0;

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator size="large" color={Colors.Primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: bg }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: textMain }]}>Favorites</Text>
            <Text style={[styles.subtitle, { color: textSub }]}>
              Your saved museums & artworks
            </Text>
          </View>
          {viewMode === "museum" && (
            <TouchableOpacity
              onPress={() => setIsModalVisible(true)}
              style={[styles.addBtn, { backgroundColor: isDark ? "#1F2937" : "#FFFFFF", borderColor }]}
            >
              <Ionicons name="add" size={20} color={Colors.Primary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabs}>
          <TabsPicker
            options={viewModeOptions}
            selectedValue={getDisplayValue(viewMode)}
            onSelectionChange={(val) => setViewMode(getInternalValue(val))}
          />
        </View>
      </View>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      {isEmpty ? (
        <View style={styles.emptyContainer}>
          {viewMode === "museum" ? (
            <FavoriteMuseumsEmpty onDiscoveryPress={handleDiscoveryPress} />
          ) : (
            <FavoriteArtworksEmpty onSnapPress={handleSnapPress} />
          )}
        </View>
      ) : viewMode === "museum" ? (
        <>
          <MuseumModeView
            onCategoryPress={handleCategoryPress}
            onMuseumsLoaded={handleMuseumsLoaded}
          />
          <AddCollectionModal
            visible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            museums={museums}
            onCreateCollection={handleCreateCollection}
            isCreating={isCreatingCollection}
          />
        </>
      ) : (
        <ArtworkModeView onArtworkPress={handleArtworkPress} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: { paddingHorizontal: 24, paddingBottom: 14 },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerText: { gap: 3 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { fontSize: 14 },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  tabs: { width: "100%" },
  emptyContainer: { flex: 1 },
});

export default FavoriteView;
