import { Museum } from "@/types/museum";
import { snakeToCamel } from "@/utils";

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

    const museums = await fetchNearbyMuseums(parseFloat(lat), parseFloat(lng));

    return Response.json({
      success: true,
      data: museums,
    });
  } catch (error) {
    console.error("Error fetching museums:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch museums",
      },
      { status: 500 },
    );
  }
}

async function fetchNearbyMuseums(
  latitude: number,
  longitude: number,
): Promise<Museum[]> {
  try {
    const radius = 5000;
    const type = "museum";

    // Use fields parameter for nearby search too
    const fields = [
      "place_id",
      "name",
      "vicinity",
      "rating",
      "user_ratings_total",
      "opening_hours",
      "photos",
      "types",
      "business_status",
      "geometry",
    ].join(",");

    const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&fields=${fields}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === "OK") {
      console.log(`Found ${data.results.length} museums`);

      return snakeToCamel<Museum[]>(data.results);
    } else {
      console.log("Error fetching museums:", data.status);
      throw new Error(`Google Places API error: ${data.status}`);
    }
  } catch (error) {
    console.error("Error fetching museums:", error);
    throw error;
  }
}
