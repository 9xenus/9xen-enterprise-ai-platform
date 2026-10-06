import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const VECTORS_FILE = path.join(DATA_DIR, 'vectors', 'index.json');
const LANCEDB_PATH = path.join(DATA_DIR, 'lancedb');

export interface VectorDoc {
  id: string;
  text: string;
  embedding: number[];
  metadata: Record<string, any>;
}

export class SimpleEmbedding {
  async embed(text: string): Promise<number[]> {
    const hash = crypto.createHash('sha256').update(text).digest('hex');
    const vec = Array.from({ length: 384 }, (_, i) => 
      (parseInt(hash.slice(i * 2, i * 2 + 2), 16) / 255 - 0.5)
    );
    return vec;
  }
}

export class VectorStore {
  private docs: VectorDoc[] = [];
  private embedder = new SimpleEmbedding();

  async init(): Promise<void> {
    try {
      await fs.mkdir(path.join(DATA_DIR, 'vectors'), { recursive: true });
      const data = await fs.readFile(VECTORS_FILE, 'utf-8');
      this.docs = JSON.parse(data);
    } catch {
      this.docs = [];
    }
  }

  async upsert(text: string, metadata: Record<string, any> = {}): Promise<string> {
    const embedding = await this.embedder.embed(text);
    const id = crypto.createHash('md5').update(text + JSON.stringify(metadata)).digest('hex');
    const existing = this.docs.findIndex(d => d.id === id);
    const doc: VectorDoc = { id, text, embedding, metadata: { ...metadata, timestamp: Date.now() } };
    if (existing >= 0) {
      this.docs[existing] = doc;
    } else {
      this.docs.push(doc);
    }
    await this.save();
    return id;
  }

  async search(query: string, limit = 5): Promise<VectorDoc[]> {
    const queryEmb = await this.embedder.embed(query);
    const results = this.docs.map(doc => ({
      doc,
      score: this.cosineSimilarity(queryEmb, doc.embedding)
    }));
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit).map(r => r.doc);
  }

  async delete(id: string): Promise<boolean> {
    const before = this.docs.length;
    this.docs = this.docs.filter(d => d.id !== id);
    if (this.docs.length !== before) {
      await this.save();
      return true;
    }
    return false;
  }

  async list(): Promise<VectorDoc[]> {
    return [...this.docs];
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
  }

  private async save(): Promise<void> {
    await fs.writeFile(VECTORS_FILE, JSON.stringify(this.docs, null, 2));
  }
}

export async function getVectorStore(): Promise<VectorStore> {
  const vs = new VectorStore();
  await vs.init();
  return vs;
}
