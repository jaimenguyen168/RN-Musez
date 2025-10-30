import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const getSavedMuseumIds = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const savedMuseums = await ctx.db
      .query("savedMuseums")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return savedMuseums.map((saved) => ({
      museumId: saved.museumId,
      personalNotes: saved.personalNotes,
    }));
  },
});

export const toggleSavedMuseum = mutation({
  args: {
    userId: v.string(),
    museumId: v.string(),
    visitStatus: v.optional(
      v.union(
        v.literal("want_to_visit"),
        v.literal("visited"),
        v.literal("favorite"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const existingSave = await ctx.db
      .query("savedMuseums")
      .withIndex("by_user_museum_id", (q) =>
        q.eq("userId", args.userId).eq("museumId", args.museumId),
      )
      .first();

    if (existingSave) {
      await ctx.db.delete(existingSave._id);
      return {
        action: "removed",
        isSaved: false,
        placeId: args.museumId,
      };
    } else {
      const savedId = await ctx.db.insert("savedMuseums", {
        userId: args.userId,
        museumId: args.museumId,
      });

      return {
        action: "saved",
        isSaved: true,
        museumId: args.museumId,
        savedId,
      };
    }
  },
});

export const isMuseumSaved = query({
  args: {
    userId: v.string(),
    museumId: v.string(),
  },
  handler: async (ctx, args) => {
    const savedMuseum = await ctx.db
      .query("savedMuseums")
      .withIndex("by_user_museum_id", (q) =>
        q.eq("userId", args.userId).eq("museumId", args.museumId),
      )
      .first();

    return !!savedMuseum;
  },
});
