import { useState, useEffect } from "react";
import { Museum } from "@/types/museum";

const fetchWikimediaImage = async (museumName: string): Promise<string | null> => {
  try {
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(museumName)}&srlimit=1&format=json&origin=*`
    );
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const pages = searchData?.query?.search;
    if (!pages?.length) return null;

    const imageRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pages[0].title)}&prop=pageimages&pithumbsize=600&format=json&origin=*`
    );
    if (!imageRes.ok) return null;
    const imageData = await imageRes.json();
    const pageObj = imageData?.query?.pages;
    if (!pageObj) return null;
    const page = Object.values(pageObj)[0] as any;
    return page?.thumbnail?.source ?? null;
  } catch {
    return null;
  }
};

/**
 * Given a list of museums (sorted by distance), returns the first `limit`
 * that have a Wikimedia image. Fires requests in parallel but caps at
 * `scanLimit` museums to avoid hammering the API.
 */
export const useMuseumsWithImages = (
  museums: Museum[],
  limit = 4,
  scanLimit = 20,
): { museums: Museum[]; imageMap: Record<string, string>; isLoading: boolean } => {
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const candidates = museums.slice(0, scanLimit);
    if (!candidates.length) return;

    setIsLoading(true);
    setImageMap({});

    let cancelled = false;

    const run = async () => {
      // Fire all requests in parallel
      const results = await Promise.all(
        candidates.map(async (m) => ({
          placeId: m.placeId,
          url: await fetchWikimediaImage(m.name),
        }))
      );

      if (cancelled) return;

      const map: Record<string, string> = {};
      for (const r of results) {
        if (r.url) map[r.placeId] = r.url;
      }
      setImageMap(map);
      setIsLoading(false);
    };

    run();
    return () => { cancelled = true; };
  }, [museums.map((m) => m.placeId).join(","), scanLimit]);

  // Filter to only museums that have an image, take first `limit`
  const museumsWithImages = museums
    .filter((m) => imageMap[m.placeId])
    .slice(0, limit);

  return { museums: museumsWithImages, imageMap, isLoading };
};
