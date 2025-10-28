import { MuseumDetails } from "@/types";
import { snakeToCamel } from "@/utils";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const placeId = url.searchParams.get("place_id");

    if (!placeId) {
      return Response.json({ error: "Place ID is required" }, { status: 400 });
    }

    const museumDetails = await fetchMuseumDetails(placeId);

    return Response.json({
      success: true,
      data: museumDetails,
    });
  } catch (error) {
    console.error("Error fetching museum details:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch museum details",
      },
      { status: 500 },
    );
  }
}

async function fetchMuseumDetails(placeId: string): Promise<MuseumDetails> {
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
      "photos",
      "reviews",
      "geometry",
      "types",
      "business_status",
      "editorial_summary",
      "current_opening_hours",
      "secondary_opening_hours",
    ].join(",");

    const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === "OK") {
      console.log("Successfully fetched museum details");
      return snakeToCamel<MuseumDetails>(data.result);
    } else {
      console.log("Error fetching museum details:", data.status);
      throw new Error(`Google Places API error: ${data.status}`);
    }
  } catch (error) {
    console.error("Error fetching museum details:", error);
    throw error;
  }
}
