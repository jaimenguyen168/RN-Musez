import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Museum } from "@/types";
import { getPhotoUrl } from "@/utils";

interface RemoveCollectionModalProps {
  visible: boolean;
  onClose: () => void;
  museums: Museum[];
  collectionName: string;
  onRemoveMuseums: (selectedMuseums: Museum[]) => void;
  isRemoving?: boolean;
}

const RemoveCollectionModal = ({
  visible,
  onClose,
  museums,
  collectionName,
  onRemoveMuseums,
  isRemoving = false,
}: RemoveCollectionModalProps) => {
  const [selectedMuseums, setSelectedMuseums] = useState<Set<string>>(
    new Set(),
  );

  const handleMuseumPress = (museum: Museum) => {
    if (isRemoving) return; // Disable selection while removing

    const newSelected = new Set(selectedMuseums);
    if (newSelected.has(museum.placeId)) {
      newSelected.delete(museum.placeId);
    } else {
      newSelected.add(museum.placeId);
    }
    setSelectedMuseums(newSelected);
  };

  const handleRemove = () => {
    if (selectedMuseums.size > 0 && !isRemoving) {
      const selectedMuseumsArray = museums.filter((museum) =>
        selectedMuseums.has(museum.placeId),
      );
      onRemoveMuseums(selectedMuseumsArray);
      setSelectedMuseums(new Set());
    }
  };

  const handleClose = () => {
    if (!isRemoving) {
      setSelectedMuseums(new Set());
      onClose();
    }
  };

  const renderMuseumItem = ({ item }: { item: Museum }) => {
    const isSelected = selectedMuseums.has(item.placeId);
    const imageUrl = getPhotoUrl(item);

    return (
      <View style={{ width: "33.33%" }} className="p-1">
        <Pressable
          onPress={() => handleMuseumPress(item)}
          disabled={isRemoving}
          className={`rounded-lg overflow-hidden ${
            isSelected ? "border-2 border-red-500" : "border border-gray-200"
          } ${isRemoving ? "opacity-50" : ""}`}
        >
          <View className="relative aspect-square">
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-gray-200 justify-center items-center">
                <Ionicons name="image-outline" size={20} color="#666" />
              </View>
            )}

            {isSelected && (
              <View className="absolute top-1 right-1 bg-red-500 rounded-full w-5 h-5 justify-center items-center">
                <Ionicons name="remove" size={12} color="white" />
              </View>
            )}
          </View>

          <View className="p-1.5" style={{ height: 40 }}>
            <Text
              className="text-xs font-medium text-gray-800 line-clamp-2"
              numberOfLines={2}
            >
              {item.name}
            </Text>
          </View>
        </Pressable>
      </View>
    );
  };

  const isRemoveDisabled = selectedMuseums.size === 0 || isRemoving;

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
        <View className="flex-1 bg-white px-6 gap-6 py-12">
          {/* Modal Header */}
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-semibold">Adjust Collection</Text>
            <TouchableOpacity onPress={handleClose} disabled={isRemoving}>
              <Ionicons
                name="close"
                size={24}
                color={isRemoving ? "#ccc" : "#666"}
              />
            </TouchableOpacity>
          </View>

          <View className="flex-1">
            {/* Collection Info */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-800 mb-2">
                {collectionName}
              </Text>
              <Text className="text-sm text-gray-500">
                Select museums to remove from this collection
              </Text>
            </View>

            {/* Museums Grid */}
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-800 mb-3">
                Museums in Collection ({selectedMuseums.size} selected for
                removal)
              </Text>
              {museums.length > 0 ? (
                <FlatList
                  data={museums}
                  numColumns={3}
                  keyExtractor={(item) => item.placeId}
                  renderItem={renderMuseumItem}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  scrollEnabled={!isRemoving}
                />
              ) : (
                <View className="flex-1 justify-center items-center">
                  <Text className="text-gray-500 text-center">
                    No museums in this collection
                  </Text>
                </View>
              )}
            </View>

            {/* Remove Button */}
            <TouchableOpacity
              onPress={handleRemove}
              disabled={isRemoveDisabled}
              className={`py-4 rounded-lg ${
                selectedMuseums.size > 0 && !isRemoving
                  ? "bg-red-500"
                  : "bg-gray-300"
              }`}
            >
              <View className="flex-row justify-center items-center">
                {isRemoving && (
                  <ActivityIndicator
                    size="small"
                    color="white"
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text className="text-center text-white font-semibold text-base">
                  {isRemoving
                    ? "Removing..."
                    : selectedMuseums.size > 0
                      ? `Remove ${selectedMuseums.size} Museum${
                          selectedMuseums.size > 1 ? "s" : ""
                        }`
                      : "Select Museums to Remove"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default RemoveCollectionModal;
