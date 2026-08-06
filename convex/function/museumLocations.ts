import { v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "../_generated/server";
import { internal as _internal } from "../_generated/api";

const internal = _internal as any;

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SEARCH_RADIUS_M = 10000; // 10km

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

async function fetchFromOverpass(overpassQuery: string): Promise<Response> {
  let lastError: Error = new Error("No Overpass endpoints tried");
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(overpassQuery)}`,
      });
      if (res.ok) return res;
      lastError = new Error(`Overpass error: ${res.status}`);
      // Only retry on server/gateway errors; bail immediately on 4xx (except 429)
      if (res.status < 500 && res.status !== 429) throw lastError;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw lastError;
}

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
        state: v.optional(v.string()),
        postcode: v.optional(v.string()),
        country: v.optional(v.string()),
        openingHours: v.optional(v.string()),
        website: v.optional(v.string()),
        phone: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        description: v.optional(v.string()),
        wikipedia: v.optional(v.string()),
        fee: v.optional(v.string()),
        wheelchair: v.optional(v.string()),
        category: v.optional(v.string()),
        fetchedAt: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const museum of args.museums) {
      const existing = await ctx.db
        .query("museums")
        .withIndex("by_osm_id", (q) => q.eq("osmId", museum.osmId))
        .first();

      if (existing) {
        // Only overwrite enrichment fields if we got a new value — a fresh
        // Overpass refetch has none of these (they're either straight from
        // OSM tags that may since be gone, or backfilled separately from
        // Wikipedia), and patching with `undefined` clears the field.
        await ctx.db.patch(existing._id, {
          ...museum,
          imageUrl: museum.imageUrl ?? existing.imageUrl,
          description: museum.description ?? existing.description,
          wikipedia: museum.wikipedia ?? existing.wikipedia,
          fee: museum.fee ?? existing.fee,
          wheelchair: museum.wheelchair ?? existing.wheelchair,
          category: museum.category ?? existing.category,
          state: museum.state ?? existing.state,
          postcode: museum.postcode ?? existing.postcode,
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
          Math.abs(m.lng - args.lng) <= delta,
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
      { lat, lng },
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

    let overpassRes: Response;
    try {
      overpassRes = await fetchFromOverpass(overpassQuery);
    } catch (err) {
      // All endpoints failed — return stale cached data rather than crashing
      if (existing.length > 0) return existing.map((m) => m.osmId);
      throw err;
    }

    const data = await overpassRes.json();
    const elements: OverpassElement[] = data.elements ?? [];

    const rawMuseums = elements
      .filter((el) => el.tags?.name)
      .map((el) => {
        const tags = el.tags ?? {};
        const coordLat = el.lat ?? el.center?.lat ?? 0;
        const coordLng = el.lon ?? el.center?.lon ?? 0;
        const addrParts = [
          tags["addr:housenumber"],
          tags["addr:street"],
        ].filter(Boolean);

        return {
          osmId: `${el.type}/${el.id}`,
          name: tags.name,
          lat: coordLat,
          lng: coordLng,
          address: addrParts.length ? addrParts.join(" ") : undefined,
          city: tags["addr:city"] ?? undefined,
          state: tags["addr:state"] ?? undefined,
          postcode: tags["addr:postcode"] ?? undefined,
          country: tags["addr:country"] ?? undefined,
          openingHours: tags["opening_hours"] ?? undefined,
          website: tags["website"] ?? tags["contact:website"] ?? undefined,
          phone: tags["phone"] ?? tags["contact:phone"] ?? undefined,
          description: tags["description"] ?? undefined,
          wikipedia: tags["wikipedia"] ?? undefined,
          fee: tags["fee"] ?? undefined,
          wheelchair: tags["wheelchair"] ?? undefined,
          category: tags["museum"] ?? undefined,
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

// ─── Public mutation: save a Wikipedia-sourced description (+ optional
// higher-confidence photo) found by the client ────────────────────────────
export const saveMuseumEnrichment = mutation({
  args: {
    osmId: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    // Set when imageUrl came from the exact OSM `wikipedia` tag (unambiguous
    // match) — safe to replace a poorly name-matched existing photo with it.
    overwriteImage: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const museum = await ctx.db
      .query("museums")
      .withIndex("by_osm_id", (q) => q.eq("osmId", args.osmId))
      .first();
    if (!museum) return;

    const patch: { description?: string; imageUrl?: string } = {};
    if (args.description && !museum.description) patch.description = args.description;
    if (args.imageUrl && (args.overwriteImage || !museum.imageUrl)) patch.imageUrl = args.imageUrl;

    if (Object.keys(patch).length) await ctx.db.patch(museum._id, patch);
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
          .first(),
      ),
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
        Math.abs(m.lng - args.lng) <= delta,
    );
  },
});
