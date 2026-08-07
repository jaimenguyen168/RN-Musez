import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getAuthenticatedUser } from "../utils";

// ─── Add or update a review ──────────────────────────────────────────────────
export const addReview = mutation({
  args: {
    museumId: v.string(),
    rating: v.number(),
    comment: v.optional(v.string()),
    dateVisited: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // One review per user per museum — update if exists
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_user_museum", (q) =>
        q.eq("userId", user._id).eq("museumId", args.museumId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        rating: args.rating,
        comment: args.comment,
        dateVisited: args.dateVisited,
        photos: args.photos,
      });
      return existing._id;
    }

    return await ctx.db.insert("reviews", {
      userId: user._id,
      museumId: args.museumId,
      rating: args.rating,
      comment: args.comment,
      dateVisited: args.dateVisited,
      photos: args.photos,
    });
  },
});

// ─── Delete a review ─────────────────────────────────────────────────────────
export const deleteReview = mutation({
  args: { museumId: v.string() },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const review = await ctx.db
      .query("reviews")
      .withIndex("by_user_museum", (q) =>
        q.eq("userId", user._id).eq("museumId", args.museumId)
      )
      .first();

    if (!review) throw new Error("Review not found");
    await ctx.db.delete(review._id);
  },
});

// ─── Get all reviews for a museum (with user info) ───────────────────────────
export const getMuseumReviews = query({
  args: { museumId: v.string() },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_museum", (q) => q.eq("museumId", args.museumId))
      .order("desc")
      .collect();

    // Attach user display name + avatar for each review
    const enriched = await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId as any);
        return {
          ...review,
          userName: (user as any)?.username ?? "Anonymous",
          userAvatar: (user as any)?.imageUrl ?? null,
        };
      })
    );

    return enriched;
  },
});

// ─── Get the current user's review for a museum ──────────────────────────────
export const getUserReviewForMuseum = query({
  args: { museumId: v.string() },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    return await ctx.db
      .query("reviews")
      .withIndex("by_user_museum", (q) =>
        q.eq("userId", user._id).eq("museumId", args.museumId)
      )
      .first();
  },
});

// ─── Get how many reviews the current user has written ──────────────────────
export const getMyReviewCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_user_museum", (q) => q.eq("userId", user._id))
      .collect();

    return reviews.length;
  },
});

// ─── Get average rating + count for a museum ────────────────────────────────
export const getMuseumRatingSummary = query({
  args: { museumId: v.string() },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_museum", (q) => q.eq("museumId", args.museumId))
      .collect();

    if (reviews.length === 0) return { avgRating: null, totalReviews: 0 };

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      avgRating: Math.round((sum / reviews.length) * 10) / 10,
      totalReviews: reviews.length,
    };
  },
});
