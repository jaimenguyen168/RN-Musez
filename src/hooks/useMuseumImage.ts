import { useQuery } from "@tanstack/react-query";

// Wikimedia API: fetch the first image for a given museum name
const fetchWikimediaImage = async (museumName: string): Promise<string | null> => {
  // Search for a Wikipedia article matching the museum name
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(museumName)}&srlimit=1&format=json&origin=*`;

  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) return null;

  const searchData = await searchRes.json();
  const pages = searchData?.query?.search;
  if (!pages?.length) return null;

  const pageTitle = pages[0].title;

  // Fetch the page's main image
  const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&pithumbsize=600&format=json&origin=*`;

  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) return null;

  const imageData = await imageRes.json();
  const pageObj = imageData?.query?.pages;
  if (!pageObj) return null;

  const page = Object.values(pageObj)[0] as any;
  return page?.thumbnail?.source ?? null;
};

export const useMuseumImage = (museumName: string | undefined) => {
  return useQuery({
    queryKey: ["museum-image", museumName],
    queryFn: () => fetchWikimediaImage(museumName!),
    enabled: !!museumName,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours — images don't change often
    gcTime: 7 * 24 * 60 * 60 * 1000,
    retry: 1,
  });
};
