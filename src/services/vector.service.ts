import "server-only";
import { connection } from "@/server/queue/redis";
import { computeService } from "./compute.service";

interface VectorRecord {
  projectId: string;
  memoryHash: string;
  prompt: string;
  vector: number[];
  score?: number;
}

const INDEX_KEY = "0gpilot:vectors:index";

function recordKey(projectId: string, memoryHash: string): string {
  return `0gpilot:vectors:${projectId}:${memoryHash}`;
}

function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

function magnitude(v: number[]): number {
  return Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
}

function cosineSimilarity(a: number[], b: number[]): number {
  const mag = magnitude(a) * magnitude(b);
  return mag === 0 ? 0 : dotProduct(a, b) / mag;
}

export class VectorService {
  async indexMemory(projectId: string, prompt: string, memoryHash: string): Promise<void> {
    const res = await computeService.embeddings(prompt);
    if (!res.success || !res.vectors?.[0]) return;

    const key = recordKey(projectId, memoryHash);

    await connection.hset(key, {
      projectId,
      memoryHash,
      prompt,
      vector: JSON.stringify(res.vectors[0]),
      indexedAt: Date.now().toString(),
    });

    await connection.sadd(INDEX_KEY, key);
  }

  async searchSimilar(prompt: string, topK = 1): Promise<VectorRecord[]> {
    const res = await computeService.embeddings(prompt);
    if (!res.success || !res.vectors?.[0]) return [];

    const queryVector = res.vectors[0];
    const keys = await connection.smembers(INDEX_KEY);
    if (keys.length === 0) return [];

    const pipeline = connection.pipeline();
    for (const key of keys) {
      pipeline.hgetall(key);
    }

    const results = await pipeline.exec();
    if (!results) return [];

    const scored: VectorRecord[] = [];

    for (const result of results) {
      if (!result || result[0]) continue;
      const raw = result[1] as Record<string, string> | null;
      if (!raw?.vector) continue;

      try {
        const vector = JSON.parse(raw.vector) as number[];
        scored.push({
          projectId: raw.projectId,
          memoryHash: raw.memoryHash,
          prompt: raw.prompt,
          vector,
          score: cosineSimilarity(queryVector, vector),
        });
      } catch {
        continue;
      }
    }

    return scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, topK);
  }
}

export const vectorService = new VectorService();
