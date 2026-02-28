
import { GoogleGenAI, Type } from "@google/genai";
import type { VideoPrompt } from '../types';

export async function generateVideoPrompts(
  narrative: string,
  totalDuration: number,
  interval: number,
  artStyle: string,
  lightingStyle: string,
  colorPalette: string,
  apiKey?: string,
  model: string = 'gemini-3.1-pro-preview'
): Promise<VideoPrompt[]> {
  // Use the provided API key or fallback to the environment variable.
  const key = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!key) {
    throw new Error("Gemini API Key is missing. Please provide an API Key.");
  }

  // Create GoogleGenAI instance right before the API call to ensure it uses the most up-to-date API key.
  const ai = new GoogleGenAI({ apiKey: key });

  try {
    const prompt = `Create a detailed cinematic video prompt for a ${totalDuration} second video, broken into segments of ${interval} seconds. Each segment should have a unique narrative beat and visual description. The overall narrative is: "${narrative}". The generated video prompts should be in the style of: ${artStyle}, with ${lightingStyle} lighting, and a ${colorPalette} color palette. Provide the output as a JSON array of objects, where each object has 'narasi' (narrative segment) and 'prompt' (detailed video prompt) fields.`;
    
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              narasi: {
                type: Type.STRING,
                description: 'The specific segment of the original narrative for this scene.',
              },
              prompt: {
                type: Type.STRING,
                description: 'A concise and visually descriptive video prompt for this scene. The prompt should be creative and evocative.',
              },
            },
            required: ['narasi', 'prompt'],
          },
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response text from Gemini API.");
    }

    try {
      const parsedPrompts: VideoPrompt[] = JSON.parse(jsonText);
      return parsedPrompts;
    } catch (e) {
      console.error("Failed to parse JSON from Gemini API:", jsonText, e);
      throw new Error("Failed to parse video prompts from API response.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
      // Check for specific API key related errors
      if (error.message.includes("Requested entity was not found")) {
        // This error often indicates an issue with the API key or project setup
        throw new Error("API Key Error: Please ensure your Gemini API key is correctly selected and associated with a paid Google Cloud project. " + error.message);
      }
      throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
}
