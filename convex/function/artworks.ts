import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getAuthenticatedUser, getImageUrl } from "../utils";

export const getAllArtworks = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    const artworks = await ctx.db
      .query("artworks")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      artworks.map(async (artwork) => {
        const imageUrl = await getImageUrl(ctx, artwork.imageUri);
        return {
          ...artwork,
          imageUri: imageUrl || artwork.imageUri,
        };
      }),
    );
  },
});

export const getArtwork = query({
  args: {
    artworkId: v.id("artworks"),
  },
  handler: async (ctx, args) => {
    const artwork = await ctx.db.get(args.artworkId);

    if (!artwork) {
      return null;
    }

    const imageUrl = await getImageUrl(ctx, artwork.imageUri);

    return {
      ...artwork,
      imageUri: imageUrl || artwork.imageUri,
    };
  },
});

export const createArtwork = mutation({
  args: {
    artwork: v.object({
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
    }),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    return await ctx.db.insert("artworks", {
      ...args.artwork,
      userId: user._id,
    });
  },
});
