import OpenAI from 'openai';
import type { VideoPrompt } from '../types';

export async function generateOpenAIPrompts(
  narrative: string,
  totalDuration: number,
  interval: number,
  artStyle: string,
  lightingStyle: string,
  colorPalette: string,
  apiKey: string,
  model: string = 'gpt-4o'
): Promise<VideoPrompt[]> {
  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Required for client-side usage
  });

  const prompt = `You are an expert assistant specializing in creating video storyboards.
Your task is to take a given narrative, and a total video duration in seconds, and an interval in seconds.
Break down the narrative into distinct, sequential scenes or parts, where each part has a duration equal to the interval.
For each part, you must identify the original narrative segment, generate a concise, visually descriptive video prompt suitable for a video generation AI, and specify the duration of that segment.
The total number of segments should correspond to the total duration divided by the interval.
The generated video prompts should be in the style of: ${artStyle}, with ${lightingStyle} lighting, and a ${colorPalette} color palette. 
Crucially, the prompts must accurately reflect the specific actions, characters, and setting described in the narrative segment.

Narrative: ${narrative}
Total Duration: ${totalDuration} seconds
Interval: ${interval} seconds

The final output must be a valid JSON array of objects, where each object has 'narasi' (narrative segment) and 'prompt' (detailed video prompt) fields. Do not include markdown formatting like \`\`\`json.`;

  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that outputs JSON arrays of video prompts."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI.");
    }

    // OpenAI json_object mode requires the output to be an object, but we want an array.
    // Usually it wraps it in a key if we ask for JSON.
    // Let's try to parse it.
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      throw new Error("Failed to parse JSON from OpenAI response.");
    }

    // If it's an object with a key like "prompts" or "scenes", extract it.
    // Or if the model outputted an array directly (which json_object mode might discourage but models do).
    if (Array.isArray(parsed)) {
      return parsed as VideoPrompt[];
    } else if (parsed.prompts && Array.isArray(parsed.prompts)) {
      return parsed.prompts as VideoPrompt[];
    } else if (parsed.scenes && Array.isArray(parsed.scenes)) {
      return parsed.scenes as VideoPrompt[];
    } else {
      // Fallback: try to find an array in the object values
      const values = Object.values(parsed);
      const arrayValue = values.find(v => Array.isArray(v));
      if (arrayValue) {
        return arrayValue as VideoPrompt[];
      }
    }

    throw new Error("OpenAI response structure is not a recognizable array of prompts.");

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    if (error instanceof Error) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with OpenAI.");
  }
}
