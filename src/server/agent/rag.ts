import { db } from '../../lib/db';
import {
  VectorDocument,
  embedTexts,
  upsertVectorDocuments,
  removeVectorDocuments,
  makeChunkId,
  searchVectorIndex,
  embedText,
  getVectorStoreStats,
} from './localVectorStore';

/**
 * 9xen Enterprise Platform — RAG pipeline.
 *
 * Chunks all CMS content (products, services, platforms, models, blog posts,
 * case studies, careers, footer pages) and indexes embeddings into the local
 * project-folder vector store. Retrieval feeds the deep agent's context.
 */

const CHUNK_SIZE = 600;
const CHUNK_OVERLAP = 80;

function chunkText(text: string, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP): string[] {
  if (!text) return [];
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= size) return [clean];
  const chunks: string[] = [];
  let start = 0;
  while (start < clean.length) {
    const end = Math.min(start + size, clean.length);
    chunks.push(clean.slice(start, end));
    if (end >= clean.length) break;
    start = end - overlap;
  }
  return chunks;
}

interface IndexableItem {
  id: string;
  title: string;
  fields: Array<{ section: string; text: string }>;
}

function toIndexableItems(contentType: string, items: any[]): IndexableItem[] {
  return items
    .filter((it) => it && !it.isDeleted)
    .map((it) => {
      const fields: Array<{ section: string; text: string }> = [];
      const push = (section: string, text: any) => {
        if (text && typeof text === 'string' && text.trim()) fields.push({ section, text: text.trim() });
        else if (Array.isArray(text)) {
          const joined = text.filter((x) => typeof x === 'string').join(', ');
          if (joined) fields.push({ section, text: joined });
        }
      };
      push('title', it.title || it.name);
      push('tagline', it.tagline);
      push('summary', it.summary || it.shortDescription || it.excerpt);
      push('description', it.description || it.fullDescription || it.body || it.content);
      push('features', it.features || it.keyFeatures || it.requirements);
      push('specs', it.specs);
      push('pricing', it.pricingModel || it.inputPrice || it.outputPrice);
      push('author', it.author?.name || it.author_name);
      return { id: it.id, title: it.title || it.name || contentType, fields };
    });
}

/** Index all CMS content into the local vector store. */
export async function indexAllCmsContent(): Promise<{ indexed: number; errors: string[] }> {
  const errors: string[] = [];
  let indexed = 0;

  const jobs: Array<{ contentType: string; items: any[] }> = [
    { contentType: 'product', items: await safe(() => db.getProducts(), 'products') },
    { contentType: 'service', items: await safe(() => db.getServices(), 'services') },
    { contentType: 'platform', items: await safe(() => db.getPlatforms(), 'platforms') },
    { contentType: 'model', items: await safe(() => db.getModels(), 'models') },
    { contentType: 'blog', items: await safe(() => db.getBlogPosts(), 'blog') },
    { contentType: 'case_study', items: await safe(() => db.getCaseStudies(), 'case_studies') },
    { contentType: 'career', items: await safe(() => db.getCareers(), 'careers') },
    { contentType: 'footer_page', items: await safe(() => db.getFooterPages(), 'footer_pages') },
  ];

  for (const job of jobs) {
    try {
      const items = toIndexableItems(job.contentType, job.items);
      // Remove stale chunks for this content type, then re-index.
      removeVectorDocuments(job.contentType);

      const allChunks: Array<{ id: string; text: string; metadata: VectorDocument['metadata'] }> = [];
      for (const item of items) {
        for (const field of item.fields) {
          const chunks = chunkText(field.text);
          chunks.forEach((text, i) => {
            allChunks.push({
              id: makeChunkId(job.contentType, item.id, field.section, i),
              text: `[${item.title} — ${field.section}] ${text}`,
              metadata: {
                contentType: job.contentType,
                contentId: item.id,
                title: item.title,
                section: field.section,
                updatedAt: new Date().toISOString(),
              },
            });
          });
        }
      }

      if (allChunks.length === 0) continue;

      // Embed in batches to respect API limits.
      const BATCH = 32;
      const docs: VectorDocument[] = [];
      for (let i = 0; i < allChunks.length; i += BATCH) {
        const batch = allChunks.slice(i, i + BATCH);
        const embeddings = await embedTexts(batch.map((c) => c.text));
        for (let j = 0; j < batch.length; j++) {
          docs.push({ id: batch[j].id, text: batch[j].text, embedding: embeddings[j], metadata: batch[j].metadata });
        }
      }
      upsertVectorDocuments(docs);
      indexed += docs.length;
    } catch (e: any) {
      errors.push(`${job.contentType}: ${e?.message || e}`);
    }
  }

  return { indexed, errors };
}

async function safe<T>(fn: () => Promise<T>, label: string): Promise<T> {
  try {
    return await fn();
  } catch (e: any) {
    console.warn(`[9xen:rag] failed to load ${label}:`, e?.message || e);
    return [] as unknown as T;
  }
}

/** Retrieve relevant context chunks for a query. */
export async function retrieveContext(query: string, topK = 6): Promise<string[]> {
  try {
    const queryEmbedding = await embedText(query);
    const results = searchVectorIndex(queryEmbedding, topK);
    return results.map((r) => r.doc.text);
  } catch (e: any) {
    console.warn('[9xen:rag] retrieval failed:', e?.message || e);
    return [];
  }
}

/** Retrieve structured results (with metadata) for agent tool use. */
export async function retrieveChunks(query: string, topK = 6, contentType?: string) {
  try {
    const queryEmbedding = await embedText(query);
    return searchVectorIndex(queryEmbedding, topK, contentType);
  } catch {
    return [];
  }
}

export function getRagStats() {
  return getVectorStoreStats();
}
