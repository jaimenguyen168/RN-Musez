import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Museum } from "@/types/museum";
import { useTheme } from "@/provider/ThemeProvider";
import { Colors } from "@/constants/colors";

const GRID_PADDING = 14;
const GRID_GAP = 8;
const COLUMNS = 3;
const ITEM_WIDTH = (Dimensions.get("window").width - GRID_PADDING * 2 - GRID_GAP * (COLUMNS - 1)) / COLUMNS;

interface AddCollectionModalProps {
  visible: boolean;
  onClose: () => void;
  museums: Museum[];
  onCreateCollection: (name: string, selectedMuseums: Museum[]) => void;
  isCreating?: boolean;
}

const AddCollectionModal = ({
  visible,
  onClose,
  museums,
  onCreateCollection,
  isCreating = false,
}: AddCollectionModalProps) => {
  const { isDark } = useTheme();
  const [collectionName, setCollectionName] = useState("");
  const [selectedMuseums, setSelectedMuseums] = useState<Set<string>>(new Set());

  const bg = isDark ? "#111827" : "#FAFAFA";
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const textMain = isDark ? "#F9FAFB" : "#111827";
  const textSub = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#374151" : "#E5E7EB";
  const inputBg = isDark ? "#1F2937" : "#FFFFFF";

  const handleMuseumToggle = (museum: Museum) => {
    if (isCreating) return;
    const next = new Set(selectedMuseums);
    next.has(museum.placeId) ? next.delete(museum.placeId) : next.add(museum.placeId);
    setSelectedMuseums(next);
  };

  const handleCreate = () => {
    if (!collectionName.trim() || isCreating) return;
    onCreateCollection(
      collectionName.trim(),
      museums.filter((m) => selectedMuseums.has(m.placeId)),
    );
    setCollectionName("");
    setSelectedMuseums(new Set());
  };

  const handleClose = () => {
    if (isCreating) return;
    setCollectionName("");
    setSelectedMuseums(new Set());
    onClose();
  };

  const isDisabled = !collectionName.trim() || selectedMuseums.size === 0 || isCreating;

  const renderMuseumItem = ({ item }: { item: Museum }) => {
    const isSelected = selectedMuseums.has(item.placeId);
    const photoRef = item.imageUrl ?? item.photos?.[0]?.photoReference;
    const imageUrl = photoRef
      ? photoRef.startsWith("http")
        ? photoRef
        : `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY}`
      : null;

    return (
      <Pressable
        onPress={() => handleMuseumToggle(item)}
        disabled={isCreating}
        style={[
          styles.museumItem,
          {
            backgroundColor: cardBg,
            borderColor: isSelected ? Colors.Primary : borderColor,
            borderWidth: isSelected ? 2 : 1,
            opacity: isCreating ? 0.5 : 1,
          },
        ]}
      >
        <View style={styles.museumThumb}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={[styles.museumPlaceholder, { backgroundColor: isDark ? "#374151" : "#F3F4F6" }]}>
              <Ionicons name="image-outline" size={18} color="#9CA3AF" />
            </View>
          )}
          {isSelected && (
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={11} color="#fff" />
            </View>
          )}
        </View>
        <Text style={[styles.museumName, { color: textMain }]} numberOfLines={2}>
          {item.name}
        </Text>
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={30}
      >
        <View style={[styles.sheet, { backgroundColor: bg }]}>

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <View style={styles.dragHandle} />
            <View style={styles.headerRow}>
              <View>
                <Text style={[styles.title, { color: textMain }]}>New Collection</Text>
                <Text style={[styles.subtitle, { color: textSub }]}>
                  {selectedMuseums.size > 0
                    ? `${selectedMuseums.size} museum${selectedMuseums.size > 1 ? "s" : ""} selected`
                    : "Select museums to add"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                disabled={isCreating}
                style={[styles.closeBtn, { backgroundColor: cardBg, borderColor }]}
              >
                <Ionicons name="close" size={18} color={textSub} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Name input ─────────────────────────────────────────────────── */}
          <View style={[styles.inputSection, { borderBottomColor: borderColor }]}>
            <Text style={[styles.label, { color: textSub }]}>COLLECTION NAME</Text>
            <TextInput
              value={collectionName}
              onChangeText={setCollectionName}
              placeholder="e.g. Paris Trip 2025"
              placeholderTextColor={isDark ? "#4B5563" : "#D1D5DB"}
              style={[styles.input, { backgroundColor: inputBg, borderColor, color: textMain }]}
              maxLength={30}
              editable={!isCreating}
            />
            <Text style={[styles.charCount, { color: textSub }]}>{collectionName.length}/30</Text>
          </View>

          {/* ── Museums grid ───────────────────────────────────────────────── */}
          <View style={styles.gridSection}>
            <Text style={[styles.label, { color: textSub, paddingHorizontal: 20, marginBottom: 12 }]}>
              MUSEUMS
            </Text>
            <FlatList
              data={museums}
              numColumns={3}
              keyExtractor={(item) => item.placeId}
              renderItem={renderMuseumItem}
              showsVerticalScrollIndicator={false}
              scrollEnabled={!isCreating}
              contentContainerStyle={styles.grid}
              columnWrapperStyle={{ gap: GRID_GAP, marginBottom: GRID_GAP }}
            />
          </View>

          {/* ── Create button ───────────────────────────────────────────────── */}
          <View style={[styles.footer, { borderTopColor: borderColor }]}>
            <TouchableOpacity
              onPress={handleCreate}
              disabled={isDisabled}
              style={[styles.createBtn, { opacity: isDisabled ? 0.5 : 1 }]}
              activeOpacity={0.85}
            >
              <View style={[styles.createBtnGradient, { backgroundColor: Colors.Primary }]}>
                {isCreating ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.createBtnText}>Creating...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={20} color="#fff" />
                    <Text style={styles.createBtnText}>Create Collection</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheet: { flex: 1 },

  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  title: { fontSize: 22, fontWeight: "800", letterSpacing: -0.4 },
  subtitle: { fontSize: 13, marginTop: 3 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  inputSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    fontWeight: "500",
  },
  charCount: { fontSize: 11, marginTop: 6, textAlign: "right" },

  gridSection: { flex: 1, paddingTop: 20 },
  grid: { paddingHorizontal: 14, paddingBottom: 16 },
  gridRow: { gap: 8, marginBottom: 8 },

  museumItem: {
    width: ITEM_WIDTH,
    borderRadius: 12,
    overflow: "hidden",
  },
  museumThumb: { width: "100%", aspectRatio: 1, position: "relative" },
  museumPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  checkBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.Primary,
    alignItems: "center",
    justifyContent: "center",
  },
  museumName: {
    fontSize: 11,
    fontWeight: "500",
    padding: 6,
    lineHeight: 15,
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  createBtn: { borderRadius: 14, overflow: "hidden" },
  createBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  createBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

export default AddCollectionModal;
