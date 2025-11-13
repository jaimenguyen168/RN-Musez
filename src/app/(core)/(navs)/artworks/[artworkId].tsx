import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useArtworkStore } from "@/stores/artworkStore";
import ArtworkDetailsView from "@/modules/snap/ui/views/artwork-details-view";
import { Artwork } from "@/types/artwork";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function ArtworkDetailsScreen() {
  const { artworkId } = useLocalSearchParams<{ artworkId: string }>();
  const { getCurrentArtwork } = useArtworkStore();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);

  const shouldFetchFromDB = artworkId !== "new" && artworkId;
  const artworkFromDB = useQuery(
    api.function.artworks.getArtwork,
    shouldFetchFromDB ? { artworkId: artworkId as Id<"artworks"> } : "skip",
  );

  useEffect(() => {
    const loadArtwork = async () => {
      try {
        if (shouldFetchFromDB && artworkFromDB !== undefined) {
          if (artworkFromDB?.imageUri) {
            const artwork: Artwork = {
              ...artworkFromDB,
              imageUri: artworkFromDB.imageUri,
            };
            setArtwork(artwork);
          } else {
            console.error("Artwork missing imageUri");
            Alert.alert("Error", "Artwork data is incomplete");
          }
        } else {
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
  }, [artworkId, getCurrentArtwork, artworkFromDB, shouldFetchFromDB]);

  return (
    <ArtworkDetailsView
      artwork={artwork}
      loading={loading}
      showButton={!shouldFetchFromDB}
    />
  );
}
