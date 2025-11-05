export interface ArtworkInsights {
  title?: string;
  artist?: string;
  period?: string;
  style?: string;
  description?: string;
  significance?: string;
  confidence?: "high" | "medium" | "low";
  error?: string;

  medium?: string;
  location?: string;
  dateCreated?: string;
  funFact?: string;
  culturalContext?: string;
}

export interface Artwork extends ArtworkInsights {
  imageUri: string;
}
