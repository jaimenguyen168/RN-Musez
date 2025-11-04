import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY);

interface ArtworkAnalysis {
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
export const analyzeArtwork = async (
  imageUri: string,
): Promise<ArtworkAnalysis> => {
  try {
    // Use the correct model name for vision tasks
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

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
  "title": "artwork title if identifiable",
  "artist": "artist name if identifiable", 
  "period": "time period or era",
  "style": "art movement or style",
  "description": "what you observe in this artwork",
  "significance": "why this work is important or notable",
  "confidence": "high/medium/low based on identification certainty",
  
  "medium": "materials or medium used",
  "location": "current museum or city if known",
  "dateCreated": "year or period when created",
  "funFact": "interesting trivia or story about this artwork",
  "culturalContext": "historical or cultural background"
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

    // Try to parse JSON directly first
    try {
      return JSON.parse(text) as ArtworkAnalysis;
    } catch {
      // Fallback: extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]) as ArtworkAnalysis;
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
