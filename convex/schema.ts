import { defineSchema } from "convex/server";
import { savedMuseums } from "./schema/museums";

export default defineSchema({
  savedMuseums: savedMuseums,
});
