import pg from 'pg';
import fs from 'fs';
import path from 'path';

/**
 * 9xen Enterprise Platform — Postgres / Supabase connection layer.
 *
 * The built-in CMS database is redesigned to run on PostgreSQL (deployable on Supabase).
 * Connection is configured via DATABASE_URL (or SUPABASE_DATABASE_URL).
 * When no DATABASE_URL is present, the system falls back to the local DuckDB/file engine.
 */

let pool: pg.Pool | null = null;
let initError: string | null = null;
let migrationDone = false;

export function getPostgresUrl(): string | null {
  return process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL || null;
}

export function isPostgresEnabled(): boolean {
  return Boolean(getPostgresUrl());
}

export function getPostgresPool(): pg.Pool | null {
  const url = getPostgresUrl();
  if (!url) return null;
  if (pool) return pool;
  try {
    pool = new pg.Pool({
      connectionString: url,
      // Supabase requires SSL; self-hosted Postgres may not.
      ssl: /supabase|postgres\.supabase\.io/i.test(url) ? { rejectUnauthorized: false } : false,
      max: 12,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      keepAlive: true,
    });
    pool.on('error', (err) => {
      console.error('[9xen:postgres] unexpected pool error:', err.message);
    });
    return pool;
  } catch (err: any) {
    initError = err?.message || String(err);
    console.error('[9xen:postgres] pool creation failed:', initError);
    return null;
  }
}

/** Execute a parameterized query against Postgres. */
export async function query(text: string, params: any[] = []): Promise<pg.QueryResult> {
  const p = getPostgresPool();
  if (!p) throw new Error('Postgres is not configured (DATABASE_URL missing)');
  const client = await p.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

/** Execute a query returning rows. */
export async function rows<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const res = await query(text, params);
  return (res.rows || []) as T[];
}

/** Execute a query returning a single row or null. */
export async function one<T = any>(text: string, params: any[] = []): Promise<T | null> {
  const list = await rows<T>(text, params);
  return list.length > 0 ? list[0] : null;
}

/** Test the Postgres connection. */
export async function testPostgresConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    const r = await query('SELECT NOW() AS now, current_database() AS db');
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}

/**
 * Apply the bundled DDL schema to Postgres (idempotent).
 * Creates every CMS table the platform uses.
 */
export async function migratePostgresSchema(): Promise<void> {
  if (migrationDone) return;
  if (!isPostgresEnabled()) return;
  // Schema candidates: dev (source tree) and production (bundled into dist/).
  const candidates = [
    path.join(process.cwd(), 'src/server/db/schema.sql'),
    path.join(process.cwd(), 'dist/schema.sql'),
  ];
  let sql: string | null = null;
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        sql = fs.readFileSync(p, 'utf-8');
        break;
      }
    } catch {
      // try next candidate
    }
  }
  if (!sql) {
    console.warn('[9xen:postgres] schema.sql not found, skipping bundled migration');
    migrationDone = true;
    return;
  }
  const p = getPostgresPool();
  if (!p) return;
  const client = await p.connect();
  try {
    // Enable vector extension (harmless if the host disallows it, e.g. restricted Supabase plans).
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS vector');
    } catch (e) {
      // Non-fatal: RAG vectors are stored in the project folder per platform policy.
    }
    await client.query(sql);
    migrationDone = true;
    console.log('[9xen:postgres] schema migration complete');
  } catch (err: any) {
    console.error('[9xen:postgres] schema migration failed:', err?.message || err);
  } finally {
    client.release();
  }
}

/** Graceful shutdown. */
export async function closePostgres(): Promise<void> {
  if (pool) {
    await pool.end().catch(() => {});
    pool = null;
  }
}
