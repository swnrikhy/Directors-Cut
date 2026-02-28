
import { GoogleGenAI, Type } from "@google/genai";
import type { VideoPrompt } from '../types';

export async function generateVideoPrompts(
  narrative: string, 
  totalDuration: number, 
  interval: number, 
  artStyle: string, 
  lightingStyle: string, 
  colorPalette: string,
  userApiKey?: string
): Promise<VideoPrompt[]> {
  const apiKey = userApiKey || process.env.API_KEY;

  if (!apiKey) {
      throw new Error("API Key is not set. Please provide your Gemini API Key in the settings.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Narrative: ${narrative}
Total Duration: ${totalDuration} seconds
Interval: ${interval} seconds`,
      config: {
        systemInstruction: `You are an expert assistant specializing in creating video storyboards.
Your task is to take a given narrative, and a total video duration in seconds, and an interval in seconds.
Break down the narrative into distinct, sequential scenes or parts, where each part has a duration equal to the interval.
For each part, you must identify the original narrative segment, generate a concise, visually descriptive video prompt suitable for a video generation AI, and specify the duration of that segment.
The total number of segments should correspond to the total duration divided by the interval.
The generated video prompts should be in the style of: ${artStyle}, with ${lightingStyle} lighting, and a ${colorPalette} color palette. 
Crucially, the prompts must accurately reflect the specific actions, characters, and setting described in the narrative segment.
The final output must be a JSON array of objects.`,
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
              duration: {
                type: Type.NUMBER,
                description: 'The duration of this scene in seconds.',
              },
            },
            required: ['narasi', 'prompt', 'duration'],
          },
        },
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      throw new Error("Received an empty response from the API.");
    }
    
    // Attempt to parse the JSON response.
    const result = JSON.parse(jsonText);

    // Basic validation to ensure the result is an array.
    if (!Array.isArray(result)) {
        throw new Error("API response is not a valid array.");
    }

    return result as VideoPrompt[];
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
}
