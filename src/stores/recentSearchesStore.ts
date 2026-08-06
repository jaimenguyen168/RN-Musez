import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MAX_RECENTS = 5;

interface RecentSearchesState {
  terms: string[];
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
}

export const useRecentSearchesStore = create<RecentSearchesState>()(
  persist(
    (set) => ({
      terms: [],
      addRecentSearch: (term: string) => {
        const trimmed = term.trim();
        if (!trimmed) return;
        set((state) => ({
          terms: [
            trimmed,
            ...state.terms.filter((t) => t.toLowerCase() !== trimmed.toLowerCase()),
          ].slice(0, MAX_RECENTS),
        }));
      },
      clearRecentSearches: () => set({ terms: [] }),
    }),
    {
      name: "recent-searches-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
