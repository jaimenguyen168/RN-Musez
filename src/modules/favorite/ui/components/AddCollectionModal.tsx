import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Museum } from "@/types/museum";
import { getPhotoUrl } from "@/utils";

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
  const [collectionName, setCollectionName] = useState("");
  const [selectedMuseums, setSelectedMuseums] = useState<Set<string>>(
    new Set(),
  );

  const handleMuseumPress = (museum: Museum) => {
    if (isCreating) return; // Disable selection while creating

    const newSelected = new Set(selectedMuseums);
    if (newSelected.has(museum.placeId)) {
      newSelected.delete(museum.placeId);
    } else {
      newSelected.add(museum.placeId);
    }
    setSelectedMuseums(newSelected);
  };

  const handleCreate = () => {
    if (collectionName.trim() && !isCreating) {
      const selectedMuseumsArray = museums.filter((museum) =>
        selectedMuseums.has(museum.placeId),
      );
      onCreateCollection(collectionName.trim(), selectedMuseumsArray);
      setCollectionName("");
      setSelectedMuseums(new Set());
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setCollectionName("");
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
          disabled={isCreating}
          className={`rounded-lg overflow-hidden ${
            isSelected ? "border-2 border-blue-500" : "border border-gray-200"
          } ${isCreating ? "opacity-50" : ""}`}
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
              <View className="absolute top-1 right-1 bg-blue-500 rounded-full w-5 h-5 justify-center items-center">
                <Ionicons name="checkmark" size={12} color="white" />
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

  const isCreateDisabled =
    !collectionName.trim() || selectedMuseums.size === 0 || isCreating;

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
            <Text className="text-lg font-semibold">Create Collection</Text>
            <TouchableOpacity onPress={handleClose} disabled={isCreating}>
              <Ionicons
                name="close"
                size={24}
                color={isCreating ? "#ccc" : "#666"}
              />
            </TouchableOpacity>
          </View>

          <View className="flex-1">
            {/* Collection Name Input */}
            <View className="mb-6">
              <Text className="text-base font-medium text-gray-800 mb-2">
                Name Collection
              </Text>
              <TextInput
                value={collectionName}
                onChangeText={setCollectionName}
                placeholder="Ex : Collection 2024"
                className={`border border-gray-300 rounded-lg p-4 text-base ${
                  isCreating ? "bg-gray-100" : ""
                }`}
                maxLength={30}
                editable={!isCreating}
              />
              <Text className="text-sm text-gray-500 mt-1">
                {collectionName.length}/30 Character
              </Text>
            </View>

            {/* Museums Grid */}
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-800 mb-3">
                Select Museums ({selectedMuseums.size} selected)
              </Text>
              <FlatList
                data={museums}
                numColumns={3}
                keyExtractor={(item) => item.placeId}
                renderItem={renderMuseumItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                scrollEnabled={!isCreating}
              />
            </View>

            {/* Create Button */}
            <TouchableOpacity
              onPress={handleCreate}
              disabled={isCreateDisabled}
              className={`py-4 rounded-lg ${
                collectionName.trim() && selectedMuseums.size > 0 && !isCreating
                  ? "bg-orange-500"
                  : "bg-gray-300"
              }`}
            >
              <View className="flex-row justify-center items-center">
                {isCreating && (
                  <ActivityIndicator
                    size="small"
                    color="white"
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text className="text-center text-white font-semibold text-base">
                  {isCreating ? "Creating..." : "Create"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddCollectionModal;
