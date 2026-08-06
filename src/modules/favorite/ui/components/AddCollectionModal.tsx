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
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Museum } from "../../../../../convex/convexTypes";
import { useOrganicTheme } from "@/constants/organicTheme";

interface AddCollectionModalProps {
  visible: boolean;
  onClose: () => void;
  museums: Museum[];
  onCreateCollection: (name: string, selectedMuseums: Museum[]) => void;
  isCreating?: boolean;
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

const AddCollectionModal = ({
  visible,
  onClose,
  museums,
  onCreateCollection,
  isCreating = false,
}: AddCollectionModalProps) => {
  const c = useOrganicTheme();
  const [collectionName, setCollectionName] = useState("");
  const [selectedMuseums, setSelectedMuseums] = useState<Set<string>>(new Set());

  const handleMuseumToggle = (museum: Museum) => {
    if (isCreating) return;
    const next = new Set(selectedMuseums);
    next.has(museum.osmId) ? next.delete(museum.osmId) : next.add(museum.osmId);
    setSelectedMuseums(next);
  };

  const handleCreate = () => {
    if (!collectionName.trim() || isCreating) return;
    onCreateCollection(
      collectionName.trim(),
      museums.filter((m) => selectedMuseums.has(m.osmId)),
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
    const isSelected = selectedMuseums.has(item.osmId);

    return (
      <Pressable
        onPress={() => handleMuseumToggle(item)}
        disabled={isCreating}
        className={`bg-organic-surface rounded-2xl px-3.5 py-2.5 flex-row gap-3 items-center ${isCreating ? "opacity-50" : "opacity-100"}`}
      >
        <View className="w-[42px] h-[42px] rounded-xl overflow-hidden bg-organic-accent-soft items-center justify-center">
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <Text className="font-heading text-organic-accent-strong text-sm">{initialsOf(item.name)}</Text>
          )}
        </View>
        <Text className="flex-1 font-figtree-bold text-organic text-[13.5px]" numberOfLines={2}>
          {item.name}
        </Text>
        <View
          className="w-6 h-6 rounded-full items-center justify-center"
          style={{
            borderWidth: 2,
            borderColor: isSelected ? c.accent : c.divider,
            backgroundColor: isSelected ? c.accent : "transparent",
          }}
        >
          {isSelected && <Ionicons name="checkmark" size={13} color={c.accentSoft} />}
        </View>
      </Pressable>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={30}
      >
        <View className="flex-1 bg-organic">

          {/* Header */}
          <View className="px-5 pt-3 pb-4">
            <View className="w-9 h-1 rounded-full bg-organic-faint self-center mb-4" />
            <View className="flex-row items-start justify-between">
              <Text className="font-heading text-organic text-[22px]">New group</Text>
              <TouchableOpacity
                onPress={handleClose}
                disabled={isCreating}
                className="w-9 h-9 rounded-full items-center justify-center bg-organic-surface"
              >
                <Ionicons name="close" size={17} color={c.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Name input */}
          <View className="px-5 pb-4">
            <TextInput
              value={collectionName}
              onChangeText={setCollectionName}
              placeholder='Name it — "Weekend trip"'
              placeholderTextColor={c.textFaint}
              className="bg-organic-surface rounded-full px-4 py-3.5 font-figtree text-organic text-sm"
              maxLength={30}
              editable={!isCreating}
            />
          </View>

          {/* Museums list */}
          <View className="flex-1 px-5">
            <View className="flex-row justify-between items-baseline mb-2.5">
              <Text className="font-figtree-bold text-organic-muted text-[12.5px]">
                Pick from your saved museums
              </Text>
              <Text className="font-figtree text-organic-faint text-xs">{selectedMuseums.size} selected</Text>
            </View>
            <FlatList
              data={museums}
              keyExtractor={(item) => item.osmId}
              renderItem={renderMuseumItem}
              showsVerticalScrollIndicator={false}
              scrollEnabled={!isCreating}
              contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
            />
          </View>

          {/* Footer */}
          <View className="px-5 pt-3.5 pb-8">
            <TouchableOpacity
              onPress={handleCreate}
              disabled={isDisabled}
              activeOpacity={0.85}
              className={`py-4 rounded-full items-center flex-row justify-center gap-2 ${isDisabled ? "bg-organic-faint" : "bg-organic-accent"}`}
            >
              {isCreating && <ActivityIndicator size="small" color={c.accentSoft} />}
              <Text className="font-heading text-organic-accent-soft text-[15px]">
                {isCreating ? "Creating…" : "Create group"}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddCollectionModal;
