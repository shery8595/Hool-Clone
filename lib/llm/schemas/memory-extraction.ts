import { z } from "zod";

export const memoryExtractionSchema = z.object({
  facts: z
    .array(
      z.object({
        type: z.enum([
          "fan_profile",
          "emotional_memory",
          "prediction_style",
          "bias",
          "preference",
        ]),
        text: z.string().min(1).max(300),
        team: z.string().optional(),
        driver: z.enum(["stats", "vibes", "loyalty", "chaos"]).optional(),
      }),
    )
    .min(1)
    .max(3),
  profileHints: z
    .object({
      favoriteTeam: z.string().optional(),
      rivalTeam: z.string().optional(),
      preferredStyle: z.string().optional(),
    })
    .optional(),
  summaryLine: z.string().min(1).max(200),
});

export type MemoryExtraction = z.infer<typeof memoryExtractionSchema>;
