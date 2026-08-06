import { useEffect } from "react";
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
 */
export const useMuseumDescriptionBackfill = (museum: BackfillableMuseum | null | undefined) => {
  const saveMuseumEnrichment = useMutation(api.function.museumLocations.saveMuseumEnrichment);

  useEffect(() => {
    if (!museum || museum.description) return;
    let cancelled = false;

    const run = async () => {
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
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [museum?.osmId, museum?.description, museum?.wikipedia, museum?.name]);
};
