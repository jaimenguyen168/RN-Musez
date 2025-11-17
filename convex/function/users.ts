import { mutation, query } from "../_generated/server";
import { getAuthenticatedUser, getImageUrl } from "../utils";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const imageUrl = await getImageUrl(ctx, currentUser.imageUrl);
    const coverImageUrl = await getImageUrl(ctx, currentUser.coverImageUrl);

    return {
      ...currentUser,
      imageUrl,
      coverImageUrl,
    };
  },
});

export const updateUserProfile = mutation({
  args: {
    username: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, { username, imageUrl, coverImageUrl }) => {
    const user = await getAuthenticatedUser(ctx);

    const updateData: any = {};

    if (username !== undefined) {
      updateData.username = username;
    }

    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl;
    }

    if (coverImageUrl !== undefined) {
      updateData.coverImageUrl = coverImageUrl;
    }

    await ctx.db.patch(user._id, updateData);

    return await ctx.db.get(user._id);
  },
});
