import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Museum } from "../../convex/convexTypes";

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
 * For any museums missing an imageUrl, fetch from Wikimedia on the client
 * and save back to Convex. Runs in the background — UI updates reactively
 * as images are saved.
 */
export const useMuseumImageBackfill = (museums: Museum[]) => {
  const saveMuseumImage = useMutation(api.function.museumLocations.saveMuseumImage);

  useEffect(() => {
    const missing = museums.filter((m) => !m.imageUrl);
    if (!missing.length) return;

    let cancelled = false;

    const run = async () => {
      // Process in small batches to avoid hammering Wikimedia
      const BATCH = 5;
      for (let i = 0; i < missing.length; i += BATCH) {
        if (cancelled) return;
        const batch = missing.slice(i, i + BATCH);

        await Promise.all(
          batch.map(async (museum) => {
            const imageUrl = await fetchWikimediaImage(museum.name);
            if (imageUrl && !cancelled) {
              await saveMuseumImage({ osmId: museum.osmId, imageUrl }).catch(() => {});
            }
          })
        );
      }
    };

    run();
    return () => { cancelled = true; };
  }, [museums.map((m) => m.osmId).join(",")]);
};
