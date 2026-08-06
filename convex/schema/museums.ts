import { defineTable } from "convex/server";
import { v } from "convex/values";

export const museums = defineTable({
  osmId: v.string(),
  name: v.string(),
  lat: v.number(),
  lng: v.number(),
  address: v.optional(v.string()),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  postcode: v.optional(v.string()),
  country: v.optional(v.string()),
  openingHours: v.optional(v.string()),
  website: v.optional(v.string()),
  phone: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  description: v.optional(v.string()),
  wikipedia: v.optional(v.string()),
  fee: v.optional(v.string()),
  wheelchair: v.optional(v.string()),
  category: v.optional(v.string()),
  fetchedAt: v.number(),
})
  .index("by_osm_id", ["osmId"])
  .index("by_city", ["city"]);

export const savedMuseums = defineTable({
  userId: v.string(),
  museumId: v.string(),
  personalNotes: v.optional(v.string()),
})
  .index("by_user", ["userId"])
  .index("by_museum_id", ["museumId"])
  .index("by_user_museum_id", ["userId", "museumId"]);

export const reviews = defineTable({
  userId: v.string(),
  museumId: v.string(), // osmId e.g. "node/12345"
  rating: v.number(), // 1–5, required
  comment: v.optional(v.string()),
  dateVisited: v.optional(v.string()), // ISO date string e.g. "2026-04-20"
  photos: v.optional(v.array(v.string())), // Convex storage IDs
})
  .index("by_museum", ["museumId"])
  .index("by_user", ["userId"])
  .index("by_user_museum", ["userId", "museumId"]);

export const museumCategories = defineTable({
  userId: v.string(),
  museumId: v.string(),
  categoryName: v.string(),
  categoryDisplayName: v.string(),
})
  .index("by_user", ["userId"])
  .index("by_user_category", ["userId", "categoryName"])
  .index("by_user_museum", ["userId", "museumId"]);
