import { TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useOrganicTheme } from "@/constants/organicTheme";

interface MuseumSaveButtonProps {
  museumId: string;
  size?: number;
  containerSize?: number;
  onPhoto?: boolean; // true = sits over an image, needs a translucent backdrop
}

const MuseumSaveButton = ({
  museumId,
  size = 16,
  containerSize = 32,
  onPhoto = true,
}: MuseumSaveButtonProps) => {
  const c = useOrganicTheme();
  const isSaved = useQuery(api.function.museums.isMuseumSaved, { museumId });
  const toggleSavedMuseum = useMutation(api.function.museums.toggleSavedMuseum);

  return (
    <TouchableOpacity
      onPress={() => toggleSavedMuseum({ museumId })}
      hitSlop={8}
      className={`items-center justify-center rounded-full ${onPhoto ? "bg-organic-photo-btn" : ""}`}
      style={{ width: containerSize, height: containerSize }}
    >
      <Ionicons name={isSaved ? "heart" : "heart-outline"} size={size} color={isSaved ? c.accent : c.textFaint} />
    </TouchableOpacity>
  );
};

export default MuseumSaveButton;
