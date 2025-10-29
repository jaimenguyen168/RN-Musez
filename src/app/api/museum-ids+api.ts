import { MuseumDetails } from "@/types";
import { snakeToCamel } from "@/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { placeIds } = body;

    if (!placeIds || !Array.isArray(placeIds) || placeIds.length === 0) {
      return Response.json(
        { error: "Place IDs array is required" },
        { status: 400 },
      );
    }

    if (placeIds.length > 20) {
      return Response.json(
        { error: "Maximum 20 place IDs allowed per request" },
        { status: 400 },
      );
    }

    const museums = await fetchMuseumsByIds(placeIds);

    return Response.json({
      success: true,
      data: museums,
      total: museums.length,
    });
  } catch (error) {
    console.error("Error fetching museums by IDs:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch museums",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const placeIdsParam = url.searchParams.get("place_ids");

    if (!placeIdsParam) {
      return Response.json(
        { error: "place_ids parameter is required" },
        { status: 400 },
      );
    }

    // Parse comma-separated place IDs
    const placeIds = placeIdsParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (placeIds.length === 0) {
      return Response.json(
        { error: "At least one place ID is required" },
        { status: 400 },
      );
    }

    if (placeIds.length > 20) {
      return Response.json(
        { error: "Maximum 20 place IDs allowed per request" },
        { status: 400 },
      );
    }

    const museums = await fetchMuseumsByIds(placeIds);

    return Response.json({
      success: true,
      data: museums,
      total: museums.length,
    });
  } catch (error) {
    console.error("Error fetching museums by IDs:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch museums",
      },
      { status: 500 },
    );
  }
}

async function fetchMuseumsByIds(placeIds: string[]): Promise<MuseumDetails[]> {
  try {
    const museums: MuseumDetails[] = [];
    const errors: { placeId: string; error: string }[] = [];

    const promises = placeIds.map(async (placeId) => {
      try {
        const details = await fetchSingleMuseumDetails(placeId);
        if (details) {
          museums.push(details);
        }
      } catch (error) {
        console.error(`Error fetching details for place ID ${placeId}:`, error);
        errors.push({
          placeId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Wait for all requests to complete
    await Promise.allSettled(promises);

    if (errors.length > 0) {
      console.warn(`Failed to fetch ${errors.length} museums:`, errors);
    }

    console.log(
      `Successfully fetched ${museums.length} out of ${placeIds.length} museums`,
    );

    return museums;
  } catch (error) {
    console.error("Error in fetchMuseumsByIds:", error);
    throw error;
  }
}

async function fetchSingleMuseumDetails(
  placeId: string,
): Promise<MuseumDetails | null> {
  try {
    // Define the fields you want to retrieve
    const fields = [
      "place_id",
      "name",
      "formatted_address",
      "formatted_phone_number",
      "international_phone_number",
      "website",
      "url",
      "rating",
      "user_ratings_total",
      "price_level",
      "opening_hours",
      "current_opening_hours",
      "secondary_opening_hours",
      "photos",
      "reviews",
      "geometry",
      "types",
      "business_status",
      "editorial_summary",
    ].join(",");

    const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === "OK" && data.result) {
      // Convert snake_case to camelCase
      return snakeToCamel<MuseumDetails>(data.result);
    } else if (data.status === "NOT_FOUND") {
      console.warn(`Museum with place ID ${placeId} not found`);
      return null;
    } else {
      throw new Error(`Google Places API error for ${placeId}: ${data.status}`);
    }
  } catch (error) {
    console.error(`Error fetching details for place ID ${placeId}:`, error);
    throw error;
  }
}
