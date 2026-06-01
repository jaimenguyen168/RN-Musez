import { GoogleGenerativeAI } from "@google/generative-ai";
import { ArtworkInsights } from "@/types/artwork";

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY);
export const analyzeArtwork = async (
  imageUri: string,
): Promise<ArtworkInsights> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // Convert image to base64
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          resolve(result.split(",")[1]);
        } else {
          reject(new Error("Failed to read file as base64"));
        }
      };
      reader.onerror = () => reject(new Error("FileReader error"));
      reader.readAsDataURL(blob);
    });

    const prompt = `Analyze this artwork and provide information in this JSON format:
{
  "title": "artwork title if identifiable, omit if unknown",
  "artist": "artist name if identifiable, omit if unknown",
  "period": "time period or era",
  "style": "art movement or style",
  "location": "current museum or city if known",
  "description": "what you observe in this artwork",
  "medium": "materials or medium used",
  "dateCreated": "year or period when created",
  "culturalContext": "historical or cultural background",
  "funFact": "interesting trivia or story about this artwork",
  "relatedArtworks": ["name of related artwork 1", "name of related artwork 2", "name of related artwork 3"]
}

Return ONLY the JSON object, no additional text.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const text = result.response.text();

    try {
      return JSON.parse(text) as ArtworkInsights;
    } catch {
      // Fallback: extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]) as ArtworkInsights;
        } catch {
          return { error: "Could not parse response as valid JSON" };
        }
      } else {
        return { error: "No JSON found in response" };
      }
    }
  } catch (error: any) {
    console.error("Gemini API error:", error);

    if (error.status === 404) {
      return { error: "Model not available. Please try again later." };
    }

    return { error: error.message || "Failed to analyze artwork" };
  }
};
