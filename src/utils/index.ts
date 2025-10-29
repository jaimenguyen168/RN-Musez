import { Museum } from "@/types";

export function snakeToCamel<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => snakeToCamel(item)) as T;
  }

  if (typeof obj === "object" && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase(),
      );

      acc[camelKey] = snakeToCamel(obj[key]);

      return acc;
    }, {} as any) as T;
  }

  return obj;
}

export const getPhotoUrl = (museum: Museum) => {
  if (museum.photos && museum.photos.length > 0) {
    const photoReference = museum.photos[0].photoReference;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;
  }
  return null;
};
