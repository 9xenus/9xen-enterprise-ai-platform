import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './src/server/apiRouter';
import { owaspSecurityHeadersMiddleware, xssSanitizerMiddleware, apiRateLimiter } from './src/server/security';
import { migratePostgresSchema, isPostgresEnabled, testPostgresConnection } from './src/lib/postgres';
import { seedPostgresFromInitialData } from './src/lib/dbPostgres';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Built-in CMS database: migrate + seed Postgres (Supabase) when configured.
  if (isPostgresEnabled()) {
    const conn = await testPostgresConnection();
    if (conn.ok) {
      await migratePostgresSchema();
      await seedPostgresFromInitialData();
      console.log('9xen CMS database: PostgreSQL (Supabase) connected and migrated');
    } else {
      console.warn('9xen CMS database: Postgres unreachable, falling back to local DuckDB engine:', conn.error);
    }
  } else {
    console.log('9xen CMS database: local DuckDB engine (set DATABASE_URL to use Supabase Postgres)');
  }

  // OWASP Security Headers globally
  app.use(owaspSecurityHeadersMiddleware);

  // Global rate limiter for API
  app.use('/api', apiRateLimiter);

  // Reasonable global body size limit (2MB), with larger limit handled specifically on upload routes
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // XSS Sanitizer middleware
  app.use(xssSanitizerMiddleware);

  // API Routes FIRST
  app.use('/api', apiRouter);

  // Vite middleware in development vs static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`9xen Enterprise Platform server listening on port ${PORT}`);
  });
}

startServer();

