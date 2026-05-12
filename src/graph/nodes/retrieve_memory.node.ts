import { WorkflowState } from "../state";
import { vectorService } from "@/services/vector.service";
import { memoryService } from "@/services/memory.service";

export async function retrieveMemoryNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  try {
    const similar = await vectorService.searchSimilar(state.prompt);
    if (similar.length > 0 && similar[0].score > 0.8) {
      const pastMemory = (await memoryService.loadProjectMemory(similar[0].memoryHash)) as Partial<WorkflowState>;
      if (pastMemory) {
         const memoryContext = `\n\n[System] Memory Conditioned Generation. Found similar past project (Memory Hash: ${similar[0].memoryHash}):\nArchitecture Approach: ${pastMemory.architecture || "None"}\n`;
         return {
           prompt: state.prompt + memoryContext
         };
      }
    }
  } catch (e) {
    console.error("Retrieve Memory Error:", e);
  }
  return {};
}
