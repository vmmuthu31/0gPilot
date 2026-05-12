import fs from "fs";
import path from "path";
import { computeService } from "./compute.service";

interface VectorRecord {
  projectId: string;
  memoryHash: string;
  prompt: string;
  vector: number[];
}

const DB_PATH = path.join(process.cwd(), ".data", "vectors.json");

export class VectorService {
  constructor() {
    if (!fs.existsSync(path.dirname(DB_PATH))) {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify([]));
    }
  }

  private readDb(): VectorRecord[] {
    try {
      return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
    } catch {
      return [];
    }
  }

  private writeDb(data: VectorRecord[]) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  }

  async indexMemory(projectId: string, prompt: string, memoryHash: string) {
    const res = await computeService.embeddings(prompt);
    if (!res.success || !res.vectors) return;
    const db = this.readDb();
    db.push({ projectId, memoryHash, prompt, vector: res.vectors[0] });
    this.writeDb(db);
  }

  async searchSimilar(prompt: string, topK = 1) {
    const res = await computeService.embeddings(prompt);
    if (!res.success || !res.vectors) return [];
    const queryVector = res.vectors[0];
    const db = this.readDb();
    
    const dotProduct = (a: number[], b: number[]) => a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitude = (v: number[]) => Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));

    const scored = db.map(record => {
      const dp = dotProduct(queryVector, record.vector);
      const mag = magnitude(queryVector) * magnitude(record.vector);
      return { ...record, score: mag === 0 ? 0 : dp / mag };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
  }
}

export const vectorService = new VectorService();
