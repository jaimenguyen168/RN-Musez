import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface BackfillableMuseum {
  osmId: string;
  name: string;
  wikipedia?: string;
  description?: string;
}

const fetchWikipediaSummary = async (lang: string, title: string) => {
  try {
    const res = await fetch(
      `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      extract: data?.extract as string | undefined,
      thumbnail: data?.thumbnail?.source as string | undefined,
    };
  } catch {
    return null;
  }
};

const searchWikipediaTitle = async (name: string): Promise<string | null> => {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&srlimit=1&format=json&origin=*`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.query?.search?.[0]?.title ?? null;
  } catch {
    return null;
  }
};

/**
 * Fetches a Wikipedia summary for a single museum missing a description, and
 * saves it back to Convex. Prefers the exact OSM `wikipedia` tag when present
 * (unambiguous match — safe to also overwrite a poorly name-matched existing
 * photo); falls back to a name search otherwise, same as the image backfill,
 * where a fetched photo only fills a gap and never overwrites.
 *
 * Returns whether a backfill is in flight, so callers can hold their loading
 * state until the description either arrives or is confirmed unavailable —
 * avoiding a pop-in once the museum's other details are already on screen.
 */
export const useMuseumDescriptionBackfill = (museum: BackfillableMuseum | null | undefined) => {
  const saveMuseumEnrichment = useMutation(api.function.museumLocations.saveMuseumEnrichment);
  const [isBackfilling, setIsBackfilling] = useState(false);

  useEffect(() => {
    if (!museum || museum.description) {
      setIsBackfilling(false);
      return;
    }
    let cancelled = false;
    setIsBackfilling(true);

    const run = async () => {
      try {
        let summary: { extract?: string; thumbnail?: string } | null = null;
        let highConfidenceImage = false;

        if (museum.wikipedia) {
          const [lang, ...rest] = museum.wikipedia.split(":");
          const title = rest.length ? rest.join(":") : museum.wikipedia;
          summary = await fetchWikipediaSummary(lang || "en", title);
          highConfidenceImage = true;
        }

        if (!summary?.extract) {
          const title = await searchWikipediaTitle(museum.name);
          if (title) {
            summary = await fetchWikipediaSummary("en", title);
            highConfidenceImage = false;
          }
        }

        if (cancelled || !summary || (!summary.extract && !summary.thumbnail)) return;

        await saveMuseumEnrichment({
          osmId: museum.osmId,
          description: summary.extract,
          imageUrl: summary.thumbnail,
          overwriteImage: highConfidenceImage,
        }).catch(() => {});
      } finally {
        if (!cancelled) setIsBackfilling(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [museum?.osmId, museum?.description, museum?.wikipedia, museum?.name]);

  return isBackfilling;
};
