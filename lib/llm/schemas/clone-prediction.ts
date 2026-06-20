import { z } from "zod";

export const cloneMemoryReceiptSchema = z.object({
  memoryId: z.string().optional(),
  summary: z.string().min(1).max(300),
  memoryType: z.string().min(1),
  strength: z.enum(["low", "medium", "high"]).optional(),
});

export const clonePredictionSchema = z.object({
  predictedWinner: z.string().min(1),
  predictedScore: z.object({
    teamA: z.number().int().min(0).max(9),
    teamB: z.number().int().min(0).max(9),
  }),
  confidence: z.number().int().min(1).max(100),
  reasoning: z.string().min(1).max(600),
  memoryReceipts: z.array(cloneMemoryReceiptSchema).max(4),
  insight: z.string().max(300).optional().nullable(),
  trainingQuestion: z.string().max(200).optional().nullable(),
});

export type ClonePredictionOutput = z.infer<typeof clonePredictionSchema>;
export type CloneMemoryReceipt = z.infer<typeof cloneMemoryReceiptSchema>;
