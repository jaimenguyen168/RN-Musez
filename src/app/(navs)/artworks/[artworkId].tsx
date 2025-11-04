import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ArtworkAnalysis, useArtworkStore } from "@/stores/artworkStore";
import ArtworkDetailsView from "@/modules/snap/ui/views/artwork-details-view";

export default function ArtworkDetailsScreen() {
  const { artworkId } = useLocalSearchParams<{ artworkId: string }>();
  const { getCurrentArtwork } = useArtworkStore();
  const [artwork, setArtwork] = useState<ArtworkAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArtwork = async () => {
      try {
        if (artworkId === "new") {
          const artworkData = getCurrentArtwork();
          setArtwork(artworkData);
        } else {
          console.log("Artwork ID:", artworkId);
          // TODO: Add logic to fetch artwork by ID from store or API
          // For now, fallback to current artwork
          const artworkData = getCurrentArtwork();
          setArtwork(artworkData);
        }
      } catch (error) {
        console.error("Error loading artwork:", error);
        Alert.alert("Error", "Failed to load artwork details");
      } finally {
        setLoading(false);
      }
    };

    loadArtwork();
  }, [artworkId, getCurrentArtwork]);

  return <ArtworkDetailsView artwork={artwork} loading={loading} />;
}
