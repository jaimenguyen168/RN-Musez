import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "../utils";

function stringToSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const createCollection = mutation({
  args: {
    collectionName: v.string(),
    museumIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const categoryName = stringToSlug(args.collectionName);
    const categoryDisplayName = args.collectionName.trim();

    const existingCategory = await ctx.db
      .query("museumCategories")
      .withIndex("by_user_category", (q) =>
        q.eq("userId", user._id).eq("categoryName", categoryName),
      )
      .first();

    if (existingCategory) {
      return {
        success: false,
        message: "A collection with this name already exists",
      };
    }

    const savedMuseums = await ctx.db
      .query("savedMuseums")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const savedMuseumIds = new Set(
      savedMuseums.map((museum) => museum.museumId),
    );
    const invalidMuseumIds = args.museumIds.filter(
      (id) => !savedMuseumIds.has(id),
    );

    if (invalidMuseumIds.length > 0) {
      return {
        success: false,
        message: "Some museums are not saved by this user",
        invalidMuseumIds,
      };
    }

    const insertPromises = args.museumIds.map((museumId) =>
      ctx.db.insert("museumCategories", {
        userId: user._id,
        museumId,
        categoryName,
        categoryDisplayName,
      }),
    );

    await Promise.all(insertPromises);

    return {
      success: true,
      action: "collection_created",
      categoryName,
      categoryDisplayName,
      museumsAdded: args.museumIds.length,
    };
  },
});

export const deleteCollection = mutation({
  args: {
    categoryName: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const categoryEntries = await ctx.db
      .query("museumCategories")
      .withIndex("by_user_category", (q) =>
        q.eq("userId", user._id).eq("categoryName", args.categoryName),
      )
      .collect();

    if (categoryEntries.length === 0) {
      return {
        success: false,
        message: "Collection not found",
      };
    }

    const deletePromises = categoryEntries.map((entry) =>
      ctx.db.delete(entry._id),
    );

    await Promise.all(deletePromises);

    return {
      success: true,
      action: "collection_deleted",
      categoryName: args.categoryName,
      museumsRemoved: categoryEntries.length,
    };
  },
});

export const getMuseumsByCategories = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    const categories = await ctx.db
      .query("museumCategories")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const categorizedMuseums: Record<string, any[]> = {};

    categories.forEach((category) => {
      if (!categorizedMuseums[category.categoryName]) {
        categorizedMuseums[category.categoryName] = [];
      }
      categorizedMuseums[category.categoryName].push({
        museumId: category.museumId,
        categoryDisplayName: category.categoryDisplayName,
      });
    });

    Object.keys(categorizedMuseums).forEach((categoryName) => {
      categorizedMuseums[categoryName].sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        return b.addedAt - a.addedAt; // newest first
      });
    });

    return categorizedMuseums;
  },
});

export const addMuseumToCategory = mutation({
  args: {
    museumId: v.string(),
    categoryName: v.string(),
    categoryDisplayName: v.string(),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const savedMuseum = await ctx.db
      .query("savedMuseums")
      .withIndex("by_user_museum_id", (q) =>
        q.eq("userId", user._id).eq("museumId", args.museumId),
      )
      .first();

    if (!savedMuseum) {
      return {
        success: false,
        message: "Museum must be saved before adding to categories",
      };
    }

    const existingCategory = await ctx.db
      .query("museumCategories")
      .withIndex("by_user_category", (q) =>
        q.eq("userId", user._id).eq("categoryName", args.categoryName),
      )
      .filter((q) => q.eq(q.field("museumId"), args.museumId))
      .first();

    if (existingCategory) {
      return {
        success: false,
        message: "Museum already in this category",
      };
    }

    await ctx.db.insert("museumCategories", {
      userId: user._id,
      museumId: args.museumId,
      categoryName: args.categoryName,
      categoryDisplayName: args.categoryDisplayName,
    });

    return {
      success: true,
      action: "added_to_category",
      categoryName: args.categoryName,
    };
  },
});

export const removeMuseumFromCategory = mutation({
  args: {
    museumId: v.string(),
    categoryName: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const categoryEntry = await ctx.db
      .query("museumCategories")
      .withIndex("by_user_category", (q) =>
        q.eq("userId", user._id).eq("categoryName", args.categoryName),
      )
      .filter((q) => q.eq(q.field("museumId"), args.museumId))
      .first();

    if (!categoryEntry) {
      return { success: false, message: "Museum not in this category" };
    }

    await ctx.db.delete(categoryEntry._id);

    return {
      success: true,
      action: "removed_from_category",
      categoryName: args.categoryName,
    };
  },
});

export const getMuseumCategories = query({
  args: {
    museumId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const categories = await ctx.db
      .query("museumCategories")
      .withIndex("by_user_museum", (q) =>
        q.eq("userId", user._id).eq("museumId", args.museumId),
      )
      .collect();

    return categories.map((cat) => ({
      categoryName: cat.categoryName,
      categoryDisplayName: cat.categoryDisplayName,
    }));
  },
});

export const getUserCategories = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    const categories = await ctx.db
      .query("museumCategories")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const categoryMap = new Map<
      string,
      {
        name: string;
        displayName: string;
        count: number;
      }
    >();

    categories.forEach((cat) => {
      const existing = categoryMap.get(cat.categoryName);
      if (existing) {
        existing.count++;
      } else {
        categoryMap.set(cat.categoryName, {
          name: cat.categoryName,
          displayName: cat.categoryDisplayName,
          count: 1,
        });
      }
    });

    return Array.from(categoryMap.values());
  },
});
