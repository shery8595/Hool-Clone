import { z } from "zod";

export const memoryConsolidationSchema = z.object({
  consolidatedText: z.string().min(10).max(400),
  theme: z.string().min(3).max(120),
  mergedIds: z.array(z.string()).min(1),
});

export type MemoryConsolidation = z.infer<typeof memoryConsolidationSchema>;
