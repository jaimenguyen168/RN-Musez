import { Museum } from "@/types/museum";

const SEARCH_RADIUS_M = 10000;

// Overpass public mirrors — try in order if the first fails
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const lat = url.searchParams.get("lat");
    const lng = url.searchParams.get("lng");

    if (!lat || !lng) {
      return Response.json(
        { error: "Latitude and longitude are required" },
        { status: 400 },
      );
    }

    const museums = await fetchMuseumsFromOverpass(
      parseFloat(lat),
      parseFloat(lng),
    );

    return Response.json({ success: true, data: museums });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch museums";
    console.error("[museums API] Error:", message);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

async function fetchMuseumsFromOverpass(
  latitude: number,
  longitude: number,
): Promise<Museum[]> {
  const query = `
    [out:json][timeout:25];
    (
      node["tourism"="museum"](around:${SEARCH_RADIUS_M},${latitude},${longitude});
      way["tourism"="museum"](around:${SEARCH_RADIUS_M},${latitude},${longitude});
    );
    out center;
  `;

  let lastError: Error | null = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      console.log(`[museums API] Trying Overpass endpoint: ${endpoint}`);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        lastError = new Error(`Overpass ${response.status} from ${endpoint}: ${body.slice(0, 200)}`);
        console.warn(`[museums API] ${lastError.message}`);
        continue;
      }

      const data = await response.json();
      const elements: OverpassElement[] = data.elements ?? [];
      console.log(`[museums API] Got ${elements.length} elements from Overpass`);

      return elements
        .filter((el) => el.tags?.name)
        .map((el) => {
          const tags = el.tags ?? {};
          const lat = el.lat ?? el.center?.lat ?? 0;
          const lng = el.lon ?? el.center?.lon ?? 0;

          const addrParts = [
            tags["addr:housenumber"],
            tags["addr:street"],
            tags["addr:city"],
          ].filter(Boolean);

          return {
            placeId: `${el.type}/${el.id}`,
            name: tags.name,
            vicinity: addrParts.join(", ") || undefined,
            formattedAddress: addrParts.join(", ") || undefined,
            website: tags["website"] ?? tags["contact:website"] ?? undefined,
            formattedPhoneNumber: tags["phone"] ?? tags["contact:phone"] ?? undefined,
            openingHours: tags["opening_hours"]
              ? { openNow: false, weekdayText: [tags["opening_hours"]] }
              : undefined,
            geometry: {
              location: { lat, lng },
            },
            types: ["museum"],
          } satisfies Museum;
        });
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[museums API] Fetch error from ${endpoint}:`, lastError.message);
    }
  }

  throw lastError ?? new Error("All Overpass endpoints failed");
}
