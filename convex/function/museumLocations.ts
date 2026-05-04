import { v } from "convex/values";
import { action, internalMutation, internalQuery, mutation, query } from "../_generated/server";
import { internal as _internal } from "../_generated/api";
// Cast to any until `convex dev` regenerates _generated/api.d.ts with this file's exports.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const internal = _internal as any;

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SEARCH_RADIUS_M = 10000;                  // 10km

type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};


// ─── Internal mutation: upsert museums ───────────────────────────────────────
export const upsertMuseums = internalMutation({
  args: {
    museums: v.array(
      v.object({
        osmId: v.string(),
        name: v.string(),
        lat: v.number(),
        lng: v.number(),
        address: v.optional(v.string()),
        city: v.optional(v.string()),
        country: v.optional(v.string()),
        openingHours: v.optional(v.string()),
        website: v.optional(v.string()),
        phone: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        fetchedAt: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const museum of args.museums) {
      const existing = await ctx.db
        .query("museums")
        .withIndex("by_osm_id", (q) => q.eq("osmId", museum.osmId))
        .first();

      if (existing) {
        // Only overwrite imageUrl if we got a new one (don't blank out an existing image)
        await ctx.db.patch(existing._id, {
          ...museum,
          imageUrl: museum.imageUrl ?? existing.imageUrl,
        });
      } else {
        await ctx.db.insert("museums", museum);
      }
    }
  },
});

// ─── Internal query: cache check ─────────────────────────────────────────────
export const getMuseumsNearLocationInternal = internalQuery({
  args: { lat: v.number(), lng: v.number() },
  handler: async (ctx, args) => {
    const delta = 0.09; // ~10km bounding box
    const all = await ctx.db.query("museums").collect();
    return all
      .filter(
        (m) =>
          Math.abs(m.lat - args.lat) <= delta &&
          Math.abs(m.lng - args.lng) <= delta
      )
      .map((m) => ({ osmId: m.osmId, fetchedAt: m.fetchedAt }));
  },
});

// ─── Action: fetch from Overpass + Wikimedia, save to DB ─────────────────────
export const fetchMuseumsNearLocation = action({
  args: { lat: v.number(), lng: v.number() },
  handler: async (ctx, args): Promise<string[]> => {
    const { lat, lng } = args;

    // Skip if we have fresh data for this area
    const existing: { osmId: string; fetchedAt: number }[] = await ctx.runQuery(
      internal.function.museumLocations.getMuseumsNearLocationInternal,
      { lat, lng }
    );

    const now = Date.now();
    const allFresh =
      existing.length > 0 &&
      existing.every((m) => now - m.fetchedAt < CACHE_TTL_MS);

    if (allFresh) return existing.map((m) => m.osmId);

    // 1. Fetch from Overpass
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["tourism"="museum"](around:${SEARCH_RADIUS_M},${lat},${lng});
        way["tourism"="museum"](around:${SEARCH_RADIUS_M},${lat},${lng});
      );
      out center;
    `;

    const overpassRes = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

    if (!overpassRes.ok) throw new Error(`Overpass error: ${overpassRes.status}`);

    const data = await overpassRes.json();
    const elements: OverpassElement[] = data.elements ?? [];

    const rawMuseums = elements
      .filter((el) => el.tags?.name)
      .map((el) => {
        const tags = el.tags ?? {};
        const coordLat = el.lat ?? el.center?.lat ?? 0;
        const coordLng = el.lon ?? el.center?.lon ?? 0;
        const addrParts = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean);

        return {
          osmId: `${el.type}/${el.id}`,
          name: tags.name,
          lat: coordLat,
          lng: coordLng,
          address: addrParts.length ? addrParts.join(" ") : undefined,
          city: tags["addr:city"] ?? undefined,
          country: tags["addr:country"] ?? undefined,
          openingHours: tags["opening_hours"] ?? undefined,
          website: tags["website"] ?? tags["contact:website"] ?? undefined,
          phone: tags["phone"] ?? tags["contact:phone"] ?? undefined,
          fetchedAt: now,
        };
      });

    if (!rawMuseums.length) return [];

    // Save to DB — imageUrl will be filled in by the client-side hook
    await ctx.runMutation(internal.function.museumLocations.upsertMuseums, {
      museums: rawMuseums,
    });

    return rawMuseums.map((m) => m.osmId);
  },
});

// ─── Public mutation: save imageUrl found by the client ──────────────────────
export const saveMuseumImage = mutation({
  args: { osmId: v.string(), imageUrl: v.string() },
  handler: async (ctx, args) => {
    const museum = await ctx.db
      .query("museums")
      .withIndex("by_osm_id", (q) => q.eq("osmId", args.osmId))
      .first();
    if (museum && !museum.imageUrl) {
      await ctx.db.patch(museum._id, { imageUrl: args.imageUrl });
    }
  },
});

// ─── Internal mutation: patch imageUrl on a single museum ────────────────────
export const patchMuseumImage = internalMutation({
  args: { id: v.id("museums"), imageUrl: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { imageUrl: args.imageUrl });
  },
});


// ─── Public query: get a single museum by osmId ──────────────────────────────
export const getMuseumByOsmId = query({
  args: { osmId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("museums")
      .withIndex("by_osm_id", (q) => q.eq("osmId", args.osmId))
      .first();
  },
});

// ─── Public query: batch-fetch museums by osmIds ─────────────────────────────
export const getMuseumsByOsmIds = query({
  args: { osmIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    if (args.osmIds.length === 0) return [];
    const results = await Promise.all(
      args.osmIds.map((osmId) =>
        ctx.db
          .query("museums")
          .withIndex("by_osm_id", (q) => q.eq("osmId", osmId))
          .first()
      )
    );
    return results.filter(Boolean);
  },
});

// ─── Public query: get museums near a location from DB ───────────────────────
export const getMuseumsNearLocation = query({
  args: { lat: v.number(), lng: v.number() },
  handler: async (ctx, args) => {
    const delta = 0.09;
    const all = await ctx.db.query("museums").collect();
    return all.filter(
      (m) =>
        Math.abs(m.lat - args.lat) <= delta &&
        Math.abs(m.lng - args.lng) <= delta
    );
  },
});
