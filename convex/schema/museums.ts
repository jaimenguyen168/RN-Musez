import { defineTable } from "convex/server";
import { v } from "convex/values";

export const savedMuseums = defineTable({
  userId: v.string(),
  museumId: v.string(),
  personalNotes: v.optional(v.string()),
  visitStatus: v.optional(
    v.union(
      v.literal("want_to_visit"),
      v.literal("visited"),
      v.literal("favorite"),
    ),
  ),
})
  .index("by_user", ["userId"])
  .index("by_museum_id", ["museumId"])
  .index("by_user_museum_id", ["userId", "museumId"]);
