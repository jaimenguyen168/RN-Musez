import { create } from "zustand";
import { Museum } from "../../convex/convexTypes";

interface MuseumListState {
  title: string;
  museums: Museum[];
  setMuseumList: (title: string, museums: Museum[]) => void;
  clearMuseumList: () => void;
}

export const useMuseumListStore = create<MuseumListState>((set) => ({
  title: "Museums",
  museums: [],
  setMuseumList: (title: string, museums: Museum[]) => set({ title, museums }),
  clearMuseumList: () => set({ title: "Museums", museums: [] }),
}));
