import { internalMutation, mutation, query } from "../_generated/server";
import { getAuthenticatedUser } from "../utils";
import { v } from "convex/values";

const DAILY_LIMIT = 3;

const getOrCreateCreditRecord = async (ctx: any, externalId: string) => {
  const record = await ctx.db
    .query("credits")
    .withIndex("by_external_id", (q: any) => q.eq("externalId", externalId))
    .unique();

  if (record) return record;

  // First time — create a fresh record
  const id = await ctx.db.insert("credits", {
    externalId,
    isProUser: false,
    creditsUsedToday: 0,
    creditsResetDate: "",
  });
  return await ctx.db.get(id);
};

export const getCredits = query({
  args: {
    resetPeriodKey: v.string(),
  },
  handler: async (ctx, { resetPeriodKey }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { credits: 0, isProUser: false };

    const record = await ctx.db
      .query("credits")
      .withIndex("by_external_id", (q: any) => q.eq("externalId", identity.subject))
      .unique();

    if (!record) return { credits: DAILY_LIMIT, isProUser: false };

    if (record.isProUser) {
      return { credits: Infinity, isProUser: true };
    }

    if (!record.creditsResetDate || record.creditsResetDate !== resetPeriodKey) {
      return { credits: DAILY_LIMIT, isProUser: false };
    }

    const used = record.creditsUsedToday ?? 0;
    return { credits: Math.max(0, DAILY_LIMIT - used), isProUser: false };
  },
});

export const consumeCredit = mutation({
  args: { resetPeriodKey: v.string() },
  handler: async (ctx, { resetPeriodKey }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { success: false };

    const record = await getOrCreateCreditRecord(ctx, identity.subject);

    if (record.isProUser) return { success: true };

    const isNewWindow = !record.creditsResetDate || record.creditsResetDate !== resetPeriodKey;
    const usedToday = isNewWindow ? 0 : (record.creditsUsedToday ?? 0);

    if (usedToday >= DAILY_LIMIT) return { success: false };

    await ctx.db.patch(record._id, {
      creditsUsedToday: usedToday + 1,
      creditsResetDate: resetPeriodKey,
    });

    return { success: true };
  },
});

export const setProStatus = mutation({
  args: { isPro: v.boolean() },
  handler: async (ctx, { isPro }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const record = await getOrCreateCreditRecord(ctx, identity.subject);
    await ctx.db.patch(record._id, { isProUser: isPro });
  },
});

// Same as setProStatus, but callable from the RevenueCat webhook (convex/http.ts),
// which has no Clerk session — the caller supplies the RevenueCat app_user_id
// directly instead of it coming from ctx.auth. app_user_id is set to the Clerk
// user ID when the client calls Purchases.configure (see RevenueCatProvider),
// so it lines up with the `externalId` used everywhere else in this table.
export const setProStatusByExternalId = internalMutation({
  args: { externalId: v.string(), isPro: v.boolean() },
  handler: async (ctx, { externalId, isPro }) => {
    const record = await getOrCreateCreditRecord(ctx, externalId);
    await ctx.db.patch(record._id, { isProUser: isPro });
  },
});
