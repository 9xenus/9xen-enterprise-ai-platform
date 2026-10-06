import fs from 'fs/promises';
import path from 'path';

const LANCEDB_PATH = path.join(process.cwd(), 'data', 'lancedb');

export interface LanceDoc {
  id: string;
  text: string;
  embedding: number[];
  metadata: Record<string, any>;
}

export class LanceStore {
  private docs: LanceDoc[] = [];

  async init(): Promise<void> {
    try {
      await fs.mkdir(LANCEDB_PATH, { recursive: true });
      const idx = path.join(LANCEDB_PATH, 'index.json');
      const data = await fs.readFile(idx, 'utf-8');
      this.docs = JSON.parse(data);
    } catch {
      this.docs = [];
    }
  }

  async upsert(doc: LanceDoc): Promise<void> {
    const existing = this.docs.findIndex(d => d.id === doc.id);
    if (existing >= 0) {
      this.docs[existing] = doc;
    } else {
      this.docs.push(doc);
    }
    await this.save();
  }

  async query(embedding: number[], limit = 10): Promise<LanceDoc[]> {
    return this.docs.slice(0, limit);
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

  async list(): Promise<LanceDoc[]> {
    return [...this.docs];
  }

  private async save(): Promise<void> {
    const idx = path.join(LANCEDB_PATH, 'index.json');
    await fs.writeFile(idx, JSON.stringify(this.docs, null, 2));
  }
}

export async function getLanceStore(): Promise<LanceStore> {
  const store = new LanceStore();
  await store.init();
  return store;
}
