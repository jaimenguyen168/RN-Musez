import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

const handleClerkWebhook = httpAction(async (ctx, request) => {
  const { data, type } = await request.json();

  switch (type) {
    case "user.created":
      await ctx.runMutation(internal.auth.upsertFromClerk, { data });
      break;
    case "user.deleted":
      await ctx.runMutation(internal.auth.deleteFromClerk, { clerkUserId: data.id! });
      break;
    case "user.updated":
      await ctx.runMutation(internal.auth.upsertFromClerk, { data });
      break;
    default:
      break;
  }
  return new Response(null, { status: 200 });
});

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: handleClerkWebhook,
});

// Events where a real purchase/renewal just happened — always safe to grant,
// since RevenueCat only sends these for a genuine transaction.
//
// Deliberately GRANT-ONLY: this webhook sees one event for one product at a
// time, so it can't safely tell whether OTHER products still grant the same
// entitlement (a user can hold more than one). Revoking here caused Pro to
// get switched off for users who still had an active subscription elsewhere.
// Revocation is instead handled client-side (RevenueCatProvider's
// customerInfo listener), which reads RevenueCat's own correctly-aggregated
// `entitlements.active` — the authoritative answer across all products —
// every time the app is opened or a purchase event fires.
const REVENUECAT_GRANT_EVENTS = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "PRODUCT_CHANGE",
  "UNCANCELLATION",
  "NON_RENEWING_PURCHASE",
  "TEMPORARY_ENTITLEMENT_GRANT",
  "SUBSCRIPTION_EXTENDED",
]);

const handleRevenueCatWebhook = httpAction(async (ctx, request) => {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (secret && request.headers.get("Authorization") !== secret) {
    return new Response(null, { status: 401 });
  }

  const { event } = await request.json();
  const type: string = event?.type ?? "";

  if (type === "TRANSFER") {
    // Purchases moved from one app_user_id to another (e.g. restore on a
    // different account) — grant to the destination(s). Not revoking from the
    // source for the same reason noted above.
    for (const externalId of event.transferred_to ?? []) {
      await ctx.runMutation(internal.function.credits.setProStatusByExternalId, {
        externalId,
        isPro: true,
      });
    }
    return new Response(null, { status: 200 });
  }

  const externalId: string | undefined = event?.app_user_id;
  if (externalId && REVENUECAT_GRANT_EVENTS.has(type)) {
    await ctx.runMutation(internal.function.credits.setProStatusByExternalId, {
      externalId,
      isPro: true,
    });
  }

  return new Response(null, { status: 200 });
});

http.route({
  path: "/revenuecat-webhook",
  method: "POST",
  handler: handleRevenueCatWebhook,
});

export default http;
