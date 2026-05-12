import { WorkflowState } from "../state";
import { vectorService } from "@/services/vector.service";
import { memoryService } from "@/services/memory.service";

const SIMILARITY_THRESHOLD = parseFloat(
  process.env.VECTOR_SIMILARITY_THRESHOLD ?? "0.8",
);

export async function retrieveMemoryNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  try {
    const similar = await vectorService.searchSimilar(state.prompt);
    if (similar.length > 0 && similar[0].score > SIMILARITY_THRESHOLD) {
      const pastMemory = (await memoryService.loadProjectMemory(
        similar[0].memoryHash,
      )) as Partial<WorkflowState> | null;

      if (pastMemory) {
        const memoryContext =
          `\n\n[System] Memory Conditioned Generation. ` +
          `Found similar past project (Memory Hash: ${similar[0].memoryHash}):\n` +
          `Architecture Approach: ${pastMemory.architecture || "None"}\n`;

        return { prompt: state.prompt + memoryContext };
      }
    }
  } catch (e) {
    console.error("[Retrieve Memory] error:", e);
  }
  return {};
}
