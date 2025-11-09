import { defineSchema } from "convex/server";
import { museumCategories, savedMuseums } from "./schema/museums";
import { artworks } from "./schema/artworks";
import { users } from "./schema/users";

export default defineSchema({
  users: users,

  savedMuseums: savedMuseums,
  museumCategories: museumCategories,

  artworks: artworks,
});
