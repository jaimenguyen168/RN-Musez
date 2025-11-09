import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getAuthenticatedUser } from "../utils";

export const getSavedMuseumIds = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    const savedMuseums = await ctx.db
      .query("savedMuseums")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
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
    museumId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const existingSave = await ctx.db
      .query("savedMuseums")
      .withIndex("by_user_museum_id", (q) =>
        q.eq("userId", user._id).eq("museumId", args.museumId),
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
        userId: user._id,
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
    museumId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const savedMuseum = await ctx.db
      .query("savedMuseums")
      .withIndex("by_user_museum_id", (q) =>
        q.eq("userId", user._id).eq("museumId", args.museumId),
      )
      .first();

    return !!savedMuseum;
  },
});
