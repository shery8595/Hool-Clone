import { query } from "@/lib/db/client";
import { syncCloneMaturity } from "@/lib/db/users";
import { getMemoryAdapter } from "@/lib/memory";

export async function storeDebateCorrection(
  userId: string,
  input: { correctionText: string; wrongMemoryId?: string },
): Promise<{ memoryId: string; storageStatus: string }> {
  const correctionText = input.correctionText.trim();
  if (correctionText.length < 8) {
    throw new Error("Correction must be at least 8 characters.");
  }

  const memoryAdapter = getMemoryAdapter();
  const remembered = await memoryAdapter.remember(userId, {
    type: "correction",
    text: `Debate correction: ${correctionText}`,
    metadata: {
      source: "debate",
      userCorrection: correctionText,
      wrongMemoryId: input.wrongMemoryId,
    },
  });

  if (!remembered.id) {
    throw new Error("Failed to store correction");
  }

  if (input.wrongMemoryId) {
    await query(
      `update memories
       set public_visible = false,
           metadata = metadata || $3::jsonb
       where id = $1 and user_id = $2`,
      [
        input.wrongMemoryId,
        userId,
        JSON.stringify({
          disputed: true,
          disputedAt: new Date().toISOString(),
          disputedReason: correctionText.slice(0, 200),
        }),
      ],
    );
  }

  await syncCloneMaturity(userId);

  return { memoryId: remembered.id, storageStatus: remembered.status };
}
