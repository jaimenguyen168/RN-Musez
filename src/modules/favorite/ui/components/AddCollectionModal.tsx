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
  Dimensions,
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Museum } from "@/types/museum";
import { useTheme } from "@/provider/ThemeProvider";

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
        className={`rounded-xl overflow-hidden bg-card ${isSelected ? "border-2 border-primary" : "border border-soft"} ${isCreating ? "opacity-50" : "opacity-100"}`}
        style={{ width: ITEM_WIDTH, borderWidth: isSelected ? 2 : 1 }}
      >
        <View className="w-full aspect-square relative">
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="w-full h-full items-center justify-center bg-surface">
              <Ionicons name="image-outline" size={18} color="#9CA3AF" />
            </View>
          )}
          {isSelected && (
            <View className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary items-center justify-center">
              <Ionicons name="checkmark" size={11} color="#fff" />
            </View>
          )}
        </View>
        <Text className="text-[11px] font-medium p-1.5 leading-[15px] text-main" numberOfLines={2}>
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
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={30}
      >
        <View className="flex-1 bg-app">

          {/* Header */}
          <View className="px-5 pt-3 pb-5">
            <View className="w-9 h-1 rounded bg-gray-300 self-center mb-5" />
            <View className="flex-row items-start justify-between">
              <View>
                <Text className="text-[22px] font-extrabold -tracking-[0.4px] text-main">
                  New Collection
                </Text>
                <Text className="text-[13px] mt-0.5 text-secondary">
                  {selectedMuseums.size > 0
                    ? `${selectedMuseums.size} museum${selectedMuseums.size > 1 ? "s" : ""} selected`
                    : "Select museums to add"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                disabled={isCreating}
                className="w-[34px] h-[34px] rounded-[10px] border border-soft bg-card items-center justify-center"
              >
                <Ionicons name="close" size={18} color={isDark ? "#9CA3AF" : "#6B7280"} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Name input */}
          <View className="px-5 pb-5 border-b border-soft">
            <Text className="text-[11px] font-bold tracking-[0.8px] mb-2.5 text-secondary">
              COLLECTION NAME
            </Text>
            <TextInput
              value={collectionName}
              onChangeText={setCollectionName}
              placeholder="e.g. Paris Trip 2025"
              placeholderTextColor={isDark ? "#4B5563" : "#D1D5DB"}
              className="border border-soft rounded-xl px-4 py-3 text-[15px] font-medium bg-card text-main"
              maxLength={30}
              editable={!isCreating}
            />
            <Text className="text-[11px] mt-1.5 text-right text-secondary">
              {collectionName.length}/30
            </Text>
          </View>

          {/* Museums grid */}
          <View className="flex-1 pt-5">
            <Text className="text-[11px] font-bold tracking-[0.8px] mb-3 px-5 text-secondary">
              MUSEUMS
            </Text>
            <FlatList
              data={museums}
              numColumns={3}
              keyExtractor={(item) => item.placeId}
              renderItem={renderMuseumItem}
              showsVerticalScrollIndicator={false}
              scrollEnabled={!isCreating}
              contentContainerStyle={{ paddingHorizontal: GRID_PADDING, paddingBottom: 16 }}
              columnWrapperStyle={{ gap: GRID_GAP, marginBottom: GRID_GAP }}
            />
          </View>

          {/* Footer */}
          <View className="px-5 pt-3.5 pb-8 border-t border-soft">
            <TouchableOpacity
              onPress={handleCreate}
              disabled={isDisabled}
              className={`rounded-[14px] overflow-hidden ${isDisabled ? "opacity-50" : "opacity-100"}`}
              activeOpacity={0.85}
            >
              <View className="flex-row items-center justify-center gap-2 py-4 bg-primary">
                {isCreating ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text className="text-white text-base font-bold">Creating...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={20} color="#fff" />
                    <Text className="text-white text-base font-bold">Create Collection</Text>
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

export default AddCollectionModal;
