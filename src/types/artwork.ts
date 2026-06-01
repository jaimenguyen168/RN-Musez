export interface ArtworkInsights {
  title?: string;
  artist?: string;
  period?: string;
  style?: string;
  description?: string;
  error?: string;

  medium?: string;
  location?: string;
  dateCreated?: string;
  funFact?: string;
  culturalContext?: string;
  relatedArtworks?: string[];
}

export interface Artwork extends ArtworkInsights {
  imageUri: string;
}
