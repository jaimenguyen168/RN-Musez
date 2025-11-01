import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { stringToSlug } from "@/utils";

// Create a new collection with museums
export const createCollection = mutation({
  args: {
    userId: v.string(),
    collectionName: v.string(),
    museumIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const categoryName = stringToSlug(args.collectionName);
    const categoryDisplayName = args.collectionName.trim();

    // Check if category with this name already exists
    const existingCategory = await ctx.db
      .query("museumCategories")
      .withIndex("by_user_category", (q) =>
        q.eq("userId", args.userId).eq("categoryName", categoryName),
      )
      .first();

    if (existingCategory) {
      return {
        success: false,
        message: "A collection with this name already exists",
      };
    }

    // Validate that all museums are saved by the user
    const savedMuseums = await ctx.db
      .query("savedMuseums")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
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

    // Add all museums to the new category
    const insertPromises = args.museumIds.map((museumId, index) =>
      ctx.db.insert("museumCategories", {
        userId: args.userId,
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

// Delete an entire collection (all museums in a category)
export const deleteCollection = mutation({
  args: {
    userId: v.string(),
    categoryName: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all entries for this category
    const categoryEntries = await ctx.db
      .query("museumCategories")
      .withIndex("by_user_category", (q) =>
        q.eq("userId", args.userId).eq("categoryName", args.categoryName),
      )
      .collect();

    console.log("categoryName", args.categoryName);

    if (categoryEntries.length === 0) {
      return {
        success: false,
        message: "Collection not found",
      };
    }

    // Delete all entries in this category
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

// Get all museums organized by categories
export const getMuseumsByCategories = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("museumCategories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Group by category
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

    // Sort each category by order if specified, otherwise by addedAt
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

// Add museum to a category (museum must already be saved)
export const addMuseumToCategory = mutation({
  args: {
    userId: v.string(),
    museumId: v.string(),
    categoryName: v.string(),
    categoryDisplayName: v.string(),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if museum is saved first
    const savedMuseum = await ctx.db
      .query("savedMuseums")
      .withIndex("by_user_museum_id", (q) =>
        q.eq("userId", args.userId).eq("museumId", args.museumId),
      )
      .first();

    if (!savedMuseum) {
      return {
        success: false,
        message: "Museum must be saved before adding to categories",
      };
    }

    // Check if already in this category
    const existingCategory = await ctx.db
      .query("museumCategories")
      .withIndex("by_user_category", (q) =>
        q.eq("userId", args.userId).eq("categoryName", args.categoryName),
      )
      .filter((q) => q.eq(q.field("museumId"), args.museumId))
      .first();

    if (existingCategory) {
      return {
        success: false,
        message: "Museum already in this category",
      };
    }

    // Add to category
    await ctx.db.insert("museumCategories", {
      userId: args.userId,
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

// Remove museum from a specific category
export const removeMuseumFromCategory = mutation({
  args: {
    userId: v.string(),
    museumId: v.string(),
    categoryName: v.string(),
  },
  handler: async (ctx, args) => {
    const categoryEntry = await ctx.db
      .query("museumCategories")
      .withIndex("by_user_category", (q) =>
        q.eq("userId", args.userId).eq("categoryName", args.categoryName),
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

// Get categories for a specific museum
export const getMuseumCategories = query({
  args: {
    userId: v.string(),
    museumId: v.string(),
  },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("museumCategories")
      .withIndex("by_user_museum", (q) =>
        q.eq("userId", args.userId).eq("museumId", args.museumId),
      )
      .collect();

    return categories.map((cat) => ({
      categoryName: cat.categoryName,
      categoryDisplayName: cat.categoryDisplayName,
    }));
  },
});

// Get all user categories with counts
export const getUserCategories = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("museumCategories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get unique categories with counts
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
