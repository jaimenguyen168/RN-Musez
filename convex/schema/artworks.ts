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
  significance: v.optional(v.string()),
  confidence: v.optional(
    v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
  ),
  error: v.optional(v.string()),
  medium: v.optional(v.string()),
  location: v.optional(v.string()),
  dateCreated: v.optional(v.string()),
  funFact: v.optional(v.string()),
  culturalContext: v.optional(v.string()),

  userNotes: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
})
  .index("by_user", ["userId"])
  .index("by_confidence", ["confidence"])
  .index("by_artist", ["artist"])
  .index("by_period", ["period"]);
