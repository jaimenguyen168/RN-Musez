import { create } from "zustand";

export interface ArtworkAnalysis {
  id: string;
  title?: string;
  artist?: string;
  period?: string;
  style?: string;
  description?: string;
  significance?: string;
  confidence?: "high" | "medium" | "low";
  imageUri: string;
  analyzedAt: Date;
  error?: string;

  medium?: string;
  location?: string;
  dateCreated?: string;
  funFact?: string;
  culturalContext?: string;
}

interface ArtworkState {
  currentArtwork: ArtworkAnalysis | null;
  artworkHistory: ArtworkAnalysis[];
  setCurrentArtwork: (artwork: ArtworkAnalysis) => void;
  getCurrentArtwork: () => ArtworkAnalysis | null;
  clearCurrentArtwork: () => void;
  addToHistory: (artwork: ArtworkAnalysis) => void;
}

export const useArtworkStore = create<ArtworkState>((set, get) => ({
  currentArtwork: null,
  artworkHistory: [],

  setCurrentArtwork: (artwork: ArtworkAnalysis) => {
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

  addToHistory: (artwork: ArtworkAnalysis) => {
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
