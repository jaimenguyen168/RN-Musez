import { defineTable } from "convex/server";
import { v } from "convex/values";

export const artworks = defineTable({
  userId: v.string(),
  imageUri: v.string(),
  title: v.optional(v.string()),
  artist: v.optional(v.string()),
  period: v.optional(v.string()),
  style: v.optional(v.string()),
  description: v.optional(v.string()),
  error: v.optional(v.string()),
  medium: v.optional(v.string()),
  location: v.optional(v.string()),
  dateCreated: v.optional(v.string()),
  funFact: v.optional(v.string()),
  culturalContext: v.optional(v.string()),
  relatedArtworks: v.optional(v.array(v.string())),

  userNotes: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
})
  .index("by_user", ["userId"])
  .index("by_artist", ["artist"])
  .index("by_period", ["period"]);
