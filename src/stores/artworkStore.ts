import { create } from "zustand";
import { Artwork } from "@/types/artwork";

interface ArtworkState {
  currentArtwork: Artwork | null;
  artworkHistory: Artwork[];
  setCurrentArtwork: (artwork: Artwork) => void;
  getCurrentArtwork: () => Artwork | null;
  clearCurrentArtwork: () => void;
  addToHistory: (artwork: Artwork) => void;
}

export const useArtworkStore = create<ArtworkState>((set, get) => ({
  currentArtwork: null,
  artworkHistory: [],

  setCurrentArtwork: (artwork: Artwork) => {
    set({ currentArtwork: artwork });
    // Also add to history
    const { artworkHistory } = get();
    const existingIndex = artworkHistory.findIndex(
      (item) => item.id === artwork.id,
    );

    if (existingIndex >= 0) {
      // Update existing artwork
      const updatedHistory = [...artworkHistory];
      updatedHistory[existingIndex] = artwork;
      set({ artworkHistory: updatedHistory });
    } else {
      // Add new artwork
      set({ artworkHistory: [...artworkHistory, artwork] });
    }
  },

  getCurrentArtwork: () => get().currentArtwork,

  clearCurrentArtwork: () => set({ currentArtwork: null }),

  addToHistory: (artwork: Artwork) => {
    const { artworkHistory } = get();
    const existingIndex = artworkHistory.findIndex(
      (item) => item.id === artwork.id,
    );

    if (existingIndex >= 0) {
      const updatedHistory = [...artworkHistory];
      updatedHistory[existingIndex] = artwork;
      set({ artworkHistory: updatedHistory });
    } else {
      set({ artworkHistory: [...artworkHistory, artwork] });
    }
  },
}));
