import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const getAllArtworks = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("artworks")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

export const getArtwork = query({
  args: {
    artworkId: v.id("artworks"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.artworkId);
  },
});

export const createArtwork = mutation({
  args: {
    artwork: v.object({
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
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("artworks", {
      ...args.artwork,
    });
  },
});
