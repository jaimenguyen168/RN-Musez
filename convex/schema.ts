import { defineSchema } from "convex/server";
import { museumCategories, savedMuseums } from "./schema/museums";
import { artworks } from "./schema/artworks";

export default defineSchema({
  savedMuseums: savedMuseums,
  museumCategories: museumCategories,

  artworks: artworks,
});
