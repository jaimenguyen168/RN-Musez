import { defineSchema } from "convex/server";
import { museumCategories, savedMuseums } from "./schema/museums";

export default defineSchema({
  savedMuseums: savedMuseums,
  museumCategories: museumCategories,
});
