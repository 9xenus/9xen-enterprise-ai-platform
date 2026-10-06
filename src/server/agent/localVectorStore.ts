import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * 9xen Enterprise Platform — Local file-based vector store.
 *
 * Per platform policy, NO third-party RAG or vector database is used.
 * All embeddings are persisted as JSON files inside the project folder
 * (data/vectors/), making the RAG layer fully self-contained and portable.
 *
 * Embeddings are produced by Google's Gemini embedding model via LangChain.
 */

export interface VectorDocument {
  id: string;
  text: string;
  embedding: number[];
  metadata: {
    contentType: string;
    contentId: string;
    title: string;
    section?: string;
    updatedAt: string;
  };
}

export interface VectorSearchResult {
  doc: VectorDocument;
  score: number;
}

const VECTORS_DIR = path.join(process.cwd(), 'data', 'vectors');
const INDEX_FILE = path.join(VECTORS_DIR, 'index.json');

function ensureDir() {
  if (!fs.existsSync(VECTORS_DIR)) {
    fs.mkdirSync(VECTORS_DIR, { recursive: true });
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

/** Load the full in-memory index from disk. */
export function loadVectorIndex(): VectorDocument[] {
  ensureDir();
  try {
    if (fs.existsSync(INDEX_FILE)) {
      const raw = fs.readFileSync(INDEX_FILE, 'utf-8');
      return JSON.parse(raw) as VectorDocument[];
    }
  } catch (e) {
    console.warn('[9xen:vectorStore] failed to load index:', e);
  }
  return [];
}

/** Persist the full index to disk. */
export function saveVectorIndex(docs: VectorDocument[]): void {
  ensureDir();
  try {
    fs.writeFileSync(INDEX_FILE, JSON.stringify(docs), 'utf-8');
  } catch (e) {
    console.warn('[9xen:vectorStore] failed to persist index:', e);
  }
}

/** Upsert documents (replace by id). */
export function upsertVectorDocuments(newDocs: VectorDocument[]): void {
  const index = loadVectorIndex();
  const map = new Map(index.map((d) => [d.id, d]));
  for (const d of newDocs) map.set(d.id, d);
  saveVectorIndex(Array.from(map.values()));
}

/** Remove documents by content type / id. */
export function removeVectorDocuments(contentType: string, contentId?: string): void {
  const index = loadVectorIndex();
  const filtered = index.filter(
    (d) => !(d.metadata.contentType === contentType && (!contentId || d.metadata.contentId === contentId))
  );
  saveVectorIndex(filtered);
}

/** Search the local index with a query embedding. */
export function searchVectorIndex(queryEmbedding: number[], topK = 5, contentType?: string): VectorSearchResult[] {
  const index = loadVectorIndex();
  return index
    .filter((d) => !contentType || d.metadata.contentType === contentType)
    .map((d) => ({ doc: d, score: cosineSimilarity(queryEmbedding, d.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/** Generate an embedding for a text using Gemini via LangChain. */
export async function embedText(text: string): Promise<number[]> {
  const { GoogleGenerativeAIEmbeddings } = await import('@langchain/google-genai');
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'text-embedding-004',
  });
  const result = await embeddings.embedQuery(text);
  return result;
}

/** Generate embeddings for multiple texts (batched). */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const { GoogleGenerativeAIEmbeddings } = await import('@langchain/google-genai');
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'text-embedding-004',
  });
  return embeddings.embedDocuments(texts);
}

/** Build a stable id for a chunk. */
export function makeChunkId(contentType: string, contentId: string, section: string, index: number): string {
  const raw = `${contentType}:${contentId}:${section}:${index}`;
  return `chunk-${crypto.createHash('sha1').update(raw).digest('hex').slice(0, 16)}`;
}

/** Stats for admin display. */
export function getVectorStoreStats(): { totalChunks: number; byType: Record<string, number>; indexFile: string } {
  const index = loadVectorIndex();
  const byType: Record<string, number> = {};
  for (const d of index) {
    byType[d.metadata.contentType] = (byType[d.metadata.contentType] || 0) + 1;
  }
  return { totalChunks: index.length, byType, indexFile: INDEX_FILE };
}
