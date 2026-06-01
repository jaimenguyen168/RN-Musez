import { v } from "convex/values";
import { defineTable } from "convex/server";

export const credits = defineTable({
  externalId: v.string(),       // Clerk user ID
  isProUser: v.optional(v.boolean()),
  creditsUsedToday: v.optional(v.number()),
  creditsResetDate: v.optional(v.string()), // YYYY-MM-DD of the 8am reset window
}).index("by_external_id", ["externalId"]);
