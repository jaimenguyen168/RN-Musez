import { useMemo, useState } from "react";
import { Alert, Share } from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { stringToSlug } from "@/utils";
import { Museum } from "../../../../convex/convexTypes";

interface UseCollectionMenuProps {
  title: string;
  museums: any[];
  isDeleting: boolean;
  setIsDeleting: (value: boolean) => void;
  setMuseumList?: (title: string, museums: Museum[]) => void; // Add this for updating museums after removal
}

export const useCollectionMenu = ({
  title,
  museums,
  isDeleting,
  setIsDeleting,
  setMuseumList,
}: UseCollectionMenuProps) => {
  const router = useRouter();
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const deleteCollection = useMutation(
    api.function.museumCategories.deleteCollection,
  );
  const removeMuseumFromCategory = useMutation(
    api.function.museumCategories.removeMuseumFromCategory,
  );

  // Action functions
  const handleShare = async () => {
    try {
      const museumList = museums.map((museum) => museum.name).join("\n");
      await Share.share({
        message: `My Museum Collection: ${title}\n\n${museumList}`,
        title: `My Museum Collection: ${title}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleAdjust = () => {
    setShowRemoveModal(true);
  };

  const handleRemoveMuseums = async (selectedMuseums: any[]) => {
    setIsRemoving(true);
    try {
      const categoryName = stringToSlug(title);

      // Remove each selected museum from the collection
      const removePromises = selectedMuseums.map((museum) =>
        removeMuseumFromCategory({
          museumId: museum.osmId,
          categoryName,
        }),
      );

      const results = await Promise.all(removePromises);

      // Check if all removals were successful
      const allSuccessful = results.every((result) => result.success);

      if (allSuccessful) {
        // Update local state by filtering out removed museums
        if (setMuseumList) {
          const removedIds = new Set(selectedMuseums.map((m) => m.osmId));
          const updatedMuseums = museums.filter(
            (museum) => !removedIds.has(museum.osmId),
          );
          setMuseumList(title, updatedMuseums);
        }

        setShowRemoveModal(false);

        Alert.alert(
          "Success",
          `Successfully removed ${selectedMuseums.length} museum${selectedMuseums.length > 1 ? "s" : ""} from ${title}`,
        );
      } else {
        Alert.alert(
          "Error",
          "Some museums could not be removed. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error removing museums from collection:", error);
      Alert.alert(
        "Error",
        "An error occurred while removing museums from the collection",
      );
    } finally {
      setIsRemoving(false);
    }
  };

  const handleCloseRemoveModal = () => {
    if (!isRemoving) {
      setShowRemoveModal(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Collection",
      `Are you sure you want to delete "${title}" collection? This will remove all ${museums.length} museums from this collection.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              const result = await deleteCollection({
                categoryName: stringToSlug(title),
              });

              if (result.success) {
                Alert.alert(
                  "Success",
                  `Collection "${title}" has been deleted successfully.`,
                  [
                    {
                      text: "OK",
                      onPress: () => router.back(),
                    },
                  ],
                );
              } else {
                Alert.alert(
                  "Error",
                  result.message || "Failed to delete collection",
                );
                setIsDeleting(false);
              }
            } catch (error) {
              console.error("Error deleting collection:", error);
              Alert.alert(
                "Error",
                "An error occurred while deleting the collection",
              );
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  // Menu actions mapping
  const menuActions = useMemo(
    () => ({
      share: handleShare,
      adjust: handleAdjust,
      delete: handleDelete,
    }),
    [handleShare, handleAdjust, handleDelete],
  );

  // Handle menu action selection
  const handleMenuAction = (value: string) => {
    // Disable menu actions while deleting or removing
    if (isDeleting || isRemoving) return;

    const action = menuActions[value as keyof typeof menuActions];
    if (action) {
      action();
    } else {
      console.warn(`Unknown menu action: ${value}`);
    }
  };

  const menuOptions = useMemo(
    () => [
      {
        label: `Share ${title}`,
        value: "share",
        systemImage: "square.and.arrow.up" as const,
      },
      {
        label: `Adjust ${title}`,
        value: "adjust",
        systemImage: "slider.horizontal.3" as const,
      },
      {
        label: `Delete ${title}`,
        value: "delete",
        systemImage: "trash" as const,
      },
    ],
    [title],
  );

  return {
    menuOptions,
    handleMenuAction,
    // Remove modal states and handlers
    showRemoveModal,
    isRemoving,
    handleRemoveMuseums,
    handleCloseRemoveModal,
  };
};
