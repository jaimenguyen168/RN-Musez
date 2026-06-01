import { defineSchema } from "convex/server";
import { museums, museumCategories, savedMuseums, reviews } from "./schema/museums";
import { artworks } from "./schema/artworks";
import { users } from "./schema/users";
import { credits } from "./schema/credits";

export default defineSchema({
  users: users,

  museums: museums,
  reviews: reviews,
  savedMuseums: savedMuseums,
  museumCategories: museumCategories,

  artworks: artworks,
  credits: credits,
});
