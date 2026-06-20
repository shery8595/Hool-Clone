import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { getEnv } from "@/lib/env";
import type { LlmAdapter } from "@/lib/llm/llm-adapter";

export class GeminiLlmAdapter implements LlmAdapter {
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generateJson<T>(input: {
    system: string;
    user: string;
    schemaName: string;
    schema: object;
  }): Promise<T> {
    const model = this.client.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: input.system,
      generationConfig: {
        responseMimeType: "application/json",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        responseSchema: input.schema as any,
      },
    });

    const result = await model.generateContent(input.user);
    const text = result.response.text();
    return JSON.parse(text) as T;
  }
}

export function getLlmAdapter(): LlmAdapter | null {
  const apiKey = getEnv().GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GeminiLlmAdapter(apiKey);
}

export const memoryExtractionResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    facts: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          type: {
            type: SchemaType.STRING,
            enum: [
              "fan_profile",
              "emotional_memory",
              "prediction_style",
              "bias",
              "preference",
            ],
          },
          text: { type: SchemaType.STRING },
          team: { type: SchemaType.STRING },
          driver: {
            type: SchemaType.STRING,
            enum: ["stats", "vibes", "loyalty", "chaos"],
          },
        },
        required: ["type", "text"],
      },
    },
    profileHints: {
      type: SchemaType.OBJECT,
      properties: {
        favoriteTeam: { type: SchemaType.STRING },
        rivalTeam: { type: SchemaType.STRING },
        preferredStyle: { type: SchemaType.STRING },
      },
    },
    summaryLine: { type: SchemaType.STRING },
  },
  required: ["facts", "summaryLine"],
};

export const clonePredictionResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    predictedWinner: { type: SchemaType.STRING },
    predictedScore: {
      type: SchemaType.OBJECT,
      properties: {
        teamA: { type: SchemaType.INTEGER },
        teamB: { type: SchemaType.INTEGER },
      },
      required: ["teamA", "teamB"],
    },
    confidence: { type: SchemaType.INTEGER },
    reasoning: { type: SchemaType.STRING },
    memoryReceipts: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          memoryId: { type: SchemaType.STRING },
          summary: { type: SchemaType.STRING },
          memoryType: { type: SchemaType.STRING },
          strength: {
            type: SchemaType.STRING,
            enum: ["low", "medium", "high"],
          },
        },
        required: ["summary", "memoryType"],
      },
    },
    insight: { type: SchemaType.STRING },
    trainingQuestion: { type: SchemaType.STRING },
  },
  required: [
    "predictedWinner",
    "predictedScore",
    "confidence",
    "reasoning",
    "memoryReceipts",
  ],
};
