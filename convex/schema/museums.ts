import { defineTable } from "convex/server";
import { v } from "convex/values";

export const savedMuseums = defineTable({
  userId: v.string(),
  museumId: v.string(),
  personalNotes: v.optional(v.string()),
})
  .index("by_user", ["userId"])
  .index("by_museum_id", ["museumId"])
  .index("by_user_museum_id", ["userId", "museumId"]);

export const museumCategories = defineTable({
  userId: v.string(),
  museumId: v.string(),
  categoryName: v.string(),
  categoryDisplayName: v.string(),
})
  .index("by_user", ["userId"])
  .index("by_user_category", ["userId", "categoryName"])
  .index("by_user_museum", ["userId", "museumId"]);
