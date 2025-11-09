import { View, Text, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useMuseumListStore } from "@/stores/museumListStore";
import { useCollectionMenu } from "@/modules/favorite/hooks/useCollectionMenu";
import ContextMenuDropdown from "@/components/ContextMenuDropdown";
import MuseumListView from "@/modules/museums/ui/views/museum-list-view";
import BackButton from "@/components/BackButton";
import RemoveCollectionModal from "@/modules/favorite/ui/components/RemoveCollectionModal";

const CollectionView = () => {
  const router = useRouter();
  const { title, museums, setMuseumList } = useMuseumListStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    menuOptions,
    handleMenuAction,
    showRemoveModal,
    isRemoving,
    handleRemoveMuseums,
    handleCloseRemoveModal,
  } = useCollectionMenu({
    title,
    museums,
    isDeleting,
    setIsDeleting,
    setMuseumList,
  });

  const handleCardPress = (museumId: string) => {
    router.push(`/museums/${museumId}`);
  };

  const handleBackPress = () => {
    router.back();
  };

  useEffect(() => {
    if (museums.length === 0 && !isDeleting && !isRemoving) {
      const timer = setTimeout(() => {
        router.back();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [museums.length, isDeleting, isRemoving, router]);

  const rightComponent = (
    <View className="flex-row items-center">
      {(isDeleting || isRemoving) && (
        <ActivityIndicator
          size="small"
          color="#000"
          style={{ marginRight: 8 }}
        />
      )}
      <ContextMenuDropdown
        options={menuOptions}
        variant="plain"
        onValueChange={handleMenuAction}
      />
    </View>
  );

  return (
    <>
      <MuseumListView
        museums={museums}
        onCardPress={handleCardPress}
        leftComponent={<BackButton onPress={handleBackPress} />}
        rightComponent={title !== "Saved" ? rightComponent : null}
      />

      {/* Remove Collection Modal */}
      <RemoveCollectionModal
        visible={showRemoveModal}
        onClose={handleCloseRemoveModal}
        museums={museums}
        collectionName={title}
        onRemoveMuseums={handleRemoveMuseums}
        isRemoving={isRemoving}
      />

      {/* Full screen loading overlay for deletion */}
      {isDeleting && (
        <View
          className="absolute inset-0 bg-black bg-opacity-50 flex-1 items-center justify-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
          }}
        >
          <View className="bg-white p-6 rounded-lg items-center">
            <ActivityIndicator size="large" color="#000" />
            <Text className="mt-3 text-base font-medium">
              Deleting collection...
            </Text>
          </View>
        </View>
      )}

      {/* Full screen loading overlay for removing museums */}
      {isRemoving && (
        <View
          className="absolute inset-0 bg-black bg-opacity-50 flex-1 items-center justify-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
        >
          <View className="bg-white p-6 rounded-lg items-center">
            <ActivityIndicator size="large" color="#000" />
            <Text className="mt-3 text-base font-medium">
              Removing museums...
            </Text>
          </View>
        </View>
      )}
    </>
  );
};

export default CollectionView;
