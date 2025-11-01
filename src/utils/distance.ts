export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type DistanceUnit = "metric" | "imperial";

export const calculateRawDistance = (
  userCoords: Coordinates,
  museumCoords: Coordinates,
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (userCoords.latitude * Math.PI) / 180;
  const φ2 = (museumCoords.latitude * Math.PI) / 180;
  const Δφ = ((museumCoords.latitude - userCoords.latitude) * Math.PI) / 180;
  const Δλ = ((museumCoords.longitude - userCoords.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const calculateAndFormatDistance = (
  userCoords: Coordinates | null,
  museumCoords: Coordinates | null,
  unit: DistanceUnit = "metric",
): string | undefined => {
  if (!userCoords || !museumCoords) return undefined;

  const distanceInMeters = calculateRawDistance(userCoords, museumCoords);

  if (unit === "imperial") {
    const distanceInFeet = distanceInMeters * 3.28084;
    const distanceInMiles = distanceInFeet / 5280;

    if (distanceInMiles < 0.1) {
      return `${Math.round(distanceInFeet)} ft`;
    }
    return `${distanceInMiles.toFixed(1)} mi`;
  } else {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)}m`;
    }
    return `${(distanceInMeters / 1000).toFixed(1)} km`;
  }
};
