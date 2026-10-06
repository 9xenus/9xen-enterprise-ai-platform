import fs from 'fs';
import path from 'path';
import { isPostgresEnabled } from './postgres';
import { dbPostgres } from './dbPostgres';
import {
  CmsDatabase,
  HeroContent,
  ServiceItem,
  ProductItem,
  PlatformItem,
  TeamMember,
  Testimonial,
  BlogPost,
  CaseStudy,
  CareerListing,
  ContactSubmission,
  SiteSettings,
  FooterPage,
  CloudCreditUsage,
  ActivityLog,
  OutreachLead,
  OutreachTemplate,
  WebhookConfig,
  AdminUser,
  ChatSession,
  ContentVersion
} from '../types/cms';
import { initialCmsData } from '../data/initialCmsData';

const DB_PATH = path.join(process.cwd(), 'cms.db');
const DATA_FILE = path.join(process.cwd(), 'cmsData.json');
const CALENDAR_FILE = path.join(process.cwd(), 'calendar_bookings.json');

function getLocalBookings(): any[] {
  try {
    if (fs.existsSync(CALENDAR_FILE)) {
      return JSON.parse(fs.readFileSync(CALENDAR_FILE, 'utf-8'));
    }
  } catch (e) {
    console.warn('Failed to read local calendar bookings:', e);
  }
  return [];
}

function saveLocalBookings(bookings: any[]) {
  try {
    fs.writeFileSync(CALENDAR_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed to write local calendar bookings:', e);
  }
}

export function getPrisma(): null {
  return null;
}

let dbInstance: any = null;
let dbConnection: any = null;
let initPromise: Promise<any> | null = null;

// Safe SQL escaping functions
function escapeStr(val: string | null | undefined): string {
  if (val === null || val === undefined) return 'NULL';
  return `'${String(val).replace(/'/g, "''")}'`;
}

function escapeJson(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  return escapeStr(JSON.stringify(val));
}

function escapeNum(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return 'NULL';
  return val.toString();
}

function escapeBool(val: boolean | null | undefined): string {
  if (val === null || val === undefined) return 'NULL';
  return val ? 'true' : 'false';
}

// In-memory / file-based fallback store
let memoryStore: CmsDatabase = { ...initialCmsData };

function loadMemoryFromJson() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      memoryStore = JSON.parse(raw);
    } catch (e) {
      console.warn('Could not read cmsData.json, using initial data');
    }
  }
}
loadMemoryFromJson();

export async function getDuckConnection() {
  if (dbConnection) return dbConnection;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      if (!dbInstance) {
        const { DuckDBInstance } = await import('@duckdb/node-api');
        dbInstance = await DuckDBInstance.create(DB_PATH);
      }
      
      if (!dbConnection) {
        dbConnection = await dbInstance.connect();
        await initializeTables(dbConnection);
      }
      
      return dbConnection;
    } catch (e) {
      console.warn('DuckDB initialization failed:', e);
      initPromise = null; // Allow retry if it failed
      return null;
    }
  })();

  return initPromise;
}

export async function initializeTables(conn: any) {
  console.log('DuckDB: Starting table initialization...');
  try {
    const tables = [
      { name: 'site_settings', sql: `CREATE TABLE IF NOT EXISTS site_settings (id VARCHAR PRIMARY KEY, data TEXT)` },
      { name: 'hero_content', sql: `CREATE TABLE IF NOT EXISTS hero_content (id VARCHAR PRIMARY KEY, data TEXT)` },
      { name: 'about_us', sql: `CREATE TABLE IF NOT EXISTS about_us (id VARCHAR PRIMARY KEY, data TEXT)` },
      { name: 'popup_banner', sql: `CREATE TABLE IF NOT EXISTS popup_banner (id VARCHAR PRIMARY KEY, data TEXT)` },
      { name: 'services', sql: `CREATE TABLE IF NOT EXISTS services (
        id VARCHAR PRIMARY KEY,
        title VARCHAR,
        category VARCHAR,
        shortDescription TEXT,
        fullDescription TEXT,
        iconName VARCHAR,
        features TEXT,
        order_num INTEGER,
        highlighted BOOLEAN,
        isDeleted BOOLEAN
      )` },
      { name: 'products', sql: `CREATE TABLE IF NOT EXISTS products (
        id VARCHAR PRIMARY KEY,
        title VARCHAR,
        slug VARCHAR,
        category VARCHAR,
        tagline VARCHAR,
        shortDescription TEXT,
        fullDescription TEXT,
        iconName VARCHAR,
        pricingModel VARCHAR,
        features TEXT,
        specs TEXT,
        badge VARCHAR,
        demoUrl VARCHAR,
        imageUrl VARCHAR,
        specSheetUrl VARCHAR,
        order_num INTEGER,
        highlighted BOOLEAN,
        isDeleted BOOLEAN
      )` },
      { name: 'platforms', sql: `CREATE TABLE IF NOT EXISTS platforms (
        id VARCHAR PRIMARY KEY,
        name VARCHAR,
        slug VARCHAR,
        tagline VARCHAR,
        category VARCHAR,
        description TEXT,
        keyFeatures TEXT,
        stats TEXT,
        demoUrl VARCHAR,
        imageUrl VARCHAR,
        specSheetUrl VARCHAR,
        badge VARCHAR,
        iconName VARCHAR,
        order_num INTEGER,
        isDeleted BOOLEAN
      )` },
      { name: 'models', sql: `CREATE TABLE IF NOT EXISTS models (
        id VARCHAR PRIMARY KEY,
        name VARCHAR,
        badge VARCHAR,
        tagline TEXT,
        description TEXT,
        contextWindow VARCHAR,
        maxOutput VARCHAR,
        speed VARCHAR,
        inputPrice VARCHAR,
        outputPrice VARCHAR,
        benchmarks TEXT,
        features TEXT,
        bestFor TEXT,
        order_num INTEGER,
        isDeleted BOOLEAN
      )` },
      { name: 'team_members', sql: `CREATE TABLE IF NOT EXISTS team_members (
        id VARCHAR PRIMARY KEY,
        name VARCHAR,
        role VARCHAR,
        department VARCHAR,
        bio TEXT,
        photoUrl VARCHAR,
        socials TEXT,
        order_num INTEGER,
        isDeleted BOOLEAN
      )` },
      { name: 'testimonials', sql: `CREATE TABLE IF NOT EXISTS testimonials (
        id VARCHAR PRIMARY KEY,
        quote TEXT,
        author VARCHAR,
        role VARCHAR,
        company VARCHAR,
        avatarUrl VARCHAR,
        rating INTEGER,
        order_num INTEGER,
        isDeleted BOOLEAN
      )` },
      { name: 'blog_posts', sql: `CREATE TABLE IF NOT EXISTS blog_posts (
        id VARCHAR PRIMARY KEY,
        slug VARCHAR,
        title VARCHAR,
        excerpt TEXT,
        body TEXT,
        coverImage VARCHAR,
        tags TEXT,
        publishDate VARCHAR,
        status VARCHAR,
        featured BOOLEAN,
        isDeleted BOOLEAN,
        author_name VARCHAR,
        author_role VARCHAR,
        author_avatar VARCHAR
      )` },
      { name: 'case_studies', sql: `CREATE TABLE IF NOT EXISTS case_studies (
        id VARCHAR PRIMARY KEY,
        slug VARCHAR,
        title VARCHAR,
        client VARCHAR,
        industry VARCHAR,
        impactMetric VARCHAR,
        summary TEXT,
        body TEXT,
        coverImage VARCHAR,
        tags TEXT,
        isDeleted BOOLEAN
      )` },
      { name: 'careers', sql: `CREATE TABLE IF NOT EXISTS careers (
        id VARCHAR PRIMARY KEY,
        title VARCHAR,
        department VARCHAR,
        location VARCHAR,
        type VARCHAR,
        description TEXT,
        requirements TEXT,
        applyLink VARCHAR,
        active BOOLEAN,
        isDeleted BOOLEAN
      )` },
      { name: 'contact_submissions', sql: `CREATE TABLE IF NOT EXISTS contact_submissions (
        id VARCHAR PRIMARY KEY,
        name VARCHAR,
        email VARCHAR,
        company VARCHAR,
        subject VARCHAR,
        message TEXT,
        attachmentUrl VARCHAR,
        attachmentName VARCHAR,
        status VARCHAR,
        createdAt VARCHAR
      )` },
      { name: 'footer_pages', sql: `CREATE TABLE IF NOT EXISTS footer_pages (
        id VARCHAR PRIMARY KEY,
        slug VARCHAR,
        title VARCHAR,
        content TEXT,
        isDeleted BOOLEAN
      )` },
      { name: 'content_versions', sql: `CREATE TABLE IF NOT EXISTS content_versions (
        id VARCHAR PRIMARY KEY,
        contentType VARCHAR,
        contentId VARCHAR,
        version INTEGER,
        title VARCHAR,
        data TEXT,
        changeSummary TEXT,
        createdByName VARCHAR,
        createdByEmail VARCHAR,
        createdAt VARCHAR
      )` },
      { name: 'cloud_credits', sql: `CREATE TABLE IF NOT EXISTS cloud_credits (
        id VARCHAR PRIMARY KEY,
        provider VARCHAR,
        service VARCHAR,
        limit_val DOUBLE,
        used DOUBLE,
        unit VARCHAR,
        resetDate VARCHAR
      )` },
      { name: 'newsletter_subscribers', sql: `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id VARCHAR PRIMARY KEY,
        email VARCHAR,
        subscribed BOOLEAN,
        createdAt VARCHAR
      )` },
      { name: 'activity_logs', sql: `CREATE TABLE IF NOT EXISTS activity_logs (
        id VARCHAR PRIMARY KEY,
        action VARCHAR,
        target VARCHAR,
        targetId VARCHAR,
        performedBy VARCHAR,
        timestamp VARCHAR
      )` },
      { name: 'audit_logs', sql: `CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR PRIMARY KEY,
        action VARCHAR,
        user VARCHAR,
        timestamp VARCHAR
      )` },
      { name: 'translations_cache', sql: `CREATE TABLE IF NOT EXISTS translations_cache (
        id VARCHAR PRIMARY KEY,
        sourceText TEXT,
        targetLanguage VARCHAR,
        translatedText TEXT,
        createdAt VARCHAR
      )` },
      { name: 'ai_telemetry_logs', sql: `CREATE TABLE IF NOT EXISTS ai_telemetry_logs (
        id VARCHAR PRIMARY KEY,
        timestamp VARCHAR,
        model VARCHAR,
        userMessage TEXT,
        tokensEstimated INTEGER,
        latencyMs INTEGER,
        status VARCHAR
      )` },
      { name: 'outreach_leads', sql: `CREATE TABLE IF NOT EXISTS outreach_leads (
        id VARCHAR PRIMARY KEY,
        leadId VARCHAR,
        name VARCHAR,
        email VARCHAR,
        company VARCHAR,
        solutionOfInterest VARCHAR,
        intentScore VARCHAR,
        classificationTag VARCHAR,
        confidenceScore INTEGER,
        buyingSignals TEXT,
        classificationReason TEXT,
        suggestedAction TEXT,
        sentiment TEXT,
        intentReason TEXT,
        aumOrBudget VARCHAR,
        userMessage TEXT,
        suggestedSubject TEXT,
        suggestedDraftResponse TEXT,
        status VARCHAR,
        stage VARCHAR,
        demoScheduledAt VARCHAR,
        demoMeetingType VARCHAR,
        demoNotes TEXT,
        customNotes TEXT,
        conversationSummary TEXT,
        submittedAt VARCHAR,
        updatedAt VARCHAR,
        sentAt VARCHAR,
        source VARCHAR,
        inquiryType VARCHAR
      )` },
      { name: 'outreach_templates', sql: `CREATE TABLE IF NOT EXISTS outreach_templates (
        id VARCHAR PRIMARY KEY,
        name VARCHAR,
        category VARCHAR,
        targetSolutionKeywords TEXT,
        subjectTemplate TEXT,
        bodyTemplate TEXT,
        systemPromptInstructions TEXT,
        isDefault BOOLEAN,
        updatedAt VARCHAR
      )` },
      { name: 'webhook_configs', sql: `CREATE TABLE IF NOT EXISTS webhook_configs (
        id VARCHAR PRIMARY KEY,
        name VARCHAR,
        url VARCHAR,
        isActive BOOLEAN,
        type VARCHAR,
        updatedAt VARCHAR
      )` },
      { name: 'admins', sql: `CREATE TABLE IF NOT EXISTS admins (
        id VARCHAR PRIMARY KEY,
        name VARCHAR,
        email VARCHAR,
        role VARCHAR,
        lastLogin VARCHAR
      )` },
      { name: 'chat_sessions', sql: `CREATE TABLE IF NOT EXISTS chat_sessions (
        id VARCHAR PRIMARY KEY,
        title VARCHAR,
        model VARCHAR,
        persona VARCHAR,
        updatedAt BIGINT,
        messages TEXT,
        isPinned BOOLEAN DEFAULT FALSE,
        userContext TEXT
      )` },
      { name: 'calendar_bookings', sql: `CREATE TABLE IF NOT EXISTS calendar_bookings (
        id VARCHAR PRIMARY KEY,
        name VARCHAR,
        email VARCHAR,
        company VARCHAR,
        date VARCHAR,
        slot VARCHAR,
        meetingType VARCHAR,
        topic TEXT,
        status VARCHAR,
        createdAt VARCHAR
      )` },
      { name: 'media', sql: `CREATE TABLE IF NOT EXISTS media (
        id VARCHAR PRIMARY KEY,
        url VARCHAR,
        filename VARCHAR,
        mimeType VARCHAR,
        size INTEGER,
        createdAt VARCHAR
      )` },
      { name: 'ai_content_summaries_cache', sql: `CREATE TABLE IF NOT EXISTS ai_content_summaries_cache (
        id VARCHAR PRIMARY KEY,
        contentId VARCHAR,
        contentType VARCHAR,
        summaryText TEXT,
        modelUsed VARCHAR,
        createdAt VARCHAR
      )` },
      { name: 'feature_flags_registry', sql: `CREATE TABLE IF NOT EXISTS feature_flags_registry (
        id VARCHAR PRIMARY KEY,
        flagKey VARCHAR,
        isEnabled BOOLEAN,
        description TEXT,
        rolloutPercentage INTEGER,
        updatedAt VARCHAR
      )` },
      { name: 'system_metrics_telemetry', sql: `CREATE TABLE IF NOT EXISTS system_metrics_telemetry (
        id VARCHAR PRIMARY KEY,
        metricName VARCHAR,
        metricValue DOUBLE,
        unit VARCHAR,
        nodeId VARCHAR,
        timestamp VARCHAR
      )` },
      { name: 'user_reading_bookmarks', sql: `CREATE TABLE IF NOT EXISTS user_reading_bookmarks (
        id VARCHAR PRIMARY KEY,
        userEmail VARCHAR,
        contentId VARCHAR,
        contentType VARCHAR,
        title VARCHAR,
        savedAt VARCHAR
      )` },
      { name: 'api_rate_limits_audit', sql: `CREATE TABLE IF NOT EXISTS api_rate_limits_audit (
        id VARCHAR PRIMARY KEY,
        clientIp VARCHAR,
        endpoint VARCHAR,
        requestCount INTEGER,
        lastRequestAt VARCHAR
      )` }
    ];

    for (const table of tables) {
      try {
        await conn.run(table.sql);
      } catch (err) {
        console.error(`DuckDB: Failed to create table ${table.name}:`, err);
      }
    }

    // Attempt to add columns if they don't exist (for existing DBs)
    try {
      await conn.run(`ALTER TABLE chat_sessions ADD COLUMN isPinned BOOLEAN DEFAULT FALSE`);
    } catch (e) {
      // Column likely already exists
    }
    try {
      await conn.run(`ALTER TABLE chat_sessions ADD COLUMN userContext TEXT`);
    } catch (e) {
      // Column likely already exists
    }

    try {
      await conn.run(`ALTER TABLE outreach_leads ADD COLUMN conversationSummary TEXT`);
    } catch (e) {
      // Column likely already exists
    }

    console.log('DuckDB: Tables initialized.');

    // Check if seed is needed
    const countReader = await conn.runAndReadAll(`SELECT COUNT(*) as count FROM services`);
    const countVal = countReader.getRowObjects()[0]?.count;
    if (Number(countVal) === 0) {
      console.log('Seeding DuckDB database with data from local JSON/seed template...');
      let initialData = { ...initialCmsData };
      if (fs.existsSync(DATA_FILE)) {
        try {
          initialData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        } catch (e) {}
      }
      if (initialData.settings) {
        await conn.run(`INSERT INTO site_settings (id, data) VALUES ('default', ${escapeJson(initialData.settings)})`);
      }
      if (initialData.hero) {
        await conn.run(`INSERT INTO hero_content (id, data) VALUES ('default', ${escapeJson(initialData.hero)})`);
      }
      if (initialData.aboutUs) {
        await conn.run(`INSERT INTO about_us (id, data) VALUES ('default', ${escapeJson(initialData.aboutUs)})`);
      }
      if (initialData.popupBanner) {
        await conn.run(`INSERT INTO popup_banner (id, data) VALUES ('default', ${escapeJson(initialData.popupBanner)})`);
      }
      if (initialData.admins) {
        for (const a of initialData.admins) {
          await conn.run(`INSERT INTO admins (id, name, email, role, lastLogin) VALUES (${escapeStr(a.id)}, ${escapeStr(a.name)}, ${escapeStr(a.email)}, ${escapeStr(a.role)}, ${escapeStr(a.lastLogin)})`);
        }
      }
      if (initialData.services) {
        for (const s of initialData.services) {
          await conn.run(`INSERT INTO services (id, title, category, shortDescription, fullDescription, iconName, features, order_num, highlighted, isDeleted) VALUES (${escapeStr(s.id)}, ${escapeStr(s.title)}, ${escapeStr(s.category)}, ${escapeStr(s.shortDescription)}, ${escapeStr(s.fullDescription)}, ${escapeStr(s.iconName)}, ${escapeJson(s.features)}, ${escapeNum(s.order)}, ${escapeBool(s.highlighted)}, false)`);
        }
      }
      if (initialData.products) {
        for (const p of initialData.products) {
          await conn.run(`INSERT INTO products (id, title, slug, category, tagline, shortDescription, fullDescription, iconName, pricingModel, features, specs, badge, demoUrl, imageUrl, specSheetUrl, order_num, highlighted, isDeleted) VALUES (${escapeStr(p.id)}, ${escapeStr(p.title)}, ${escapeStr(p.slug)}, ${escapeStr(p.category)}, ${escapeStr(p.tagline)}, ${escapeStr(p.shortDescription)}, ${escapeStr(p.fullDescription)}, ${escapeStr(p.iconName)}, ${escapeStr(p.pricingModel)}, ${escapeJson(p.features)}, ${escapeJson(p.specs)}, ${escapeStr(p.badge)}, ${escapeStr(p.demoUrl)}, ${escapeStr(p.imageUrl)}, ${escapeStr(p.specSheetUrl)}, ${escapeNum(p.order)}, ${escapeBool(p.highlighted)}, false)`);
        }
      }
      if (initialData.platforms) {
        for (const pl of initialData.platforms) {
          await conn.run(`INSERT INTO platforms (id, name, slug, tagline, category, description, keyFeatures, stats, demoUrl, imageUrl, specSheetUrl, badge, iconName, order_num, isDeleted) VALUES (${escapeStr(pl.id)}, ${escapeStr(pl.name)}, ${escapeStr(pl.slug)}, ${escapeStr(pl.tagline)}, ${escapeStr(pl.category)}, ${escapeStr(pl.description)}, ${escapeJson(pl.keyFeatures)}, ${escapeJson(pl.stats)}, ${escapeStr(pl.demoUrl)}, ${escapeStr(pl.imageUrl)}, ${escapeStr(pl.specSheetUrl)}, ${escapeStr(pl.badge)}, ${escapeStr(pl.iconName)}, ${escapeNum(pl.order)}, false)`);
        }
      }
      if (initialData.team) {
        for (const t of initialData.team) {
          await conn.run(`INSERT INTO team_members (id, name, role, department, bio, photoUrl, socials, order_num, isDeleted) VALUES (${escapeStr(t.id)}, ${escapeStr(t.name)}, ${escapeStr(t.role)}, ${escapeStr(t.department)}, ${escapeStr(t.bio)}, ${escapeStr(t.photoUrl)}, ${escapeJson(t.socials)}, ${escapeNum(t.order)}, false)`);
        }
      }
      if (initialData.testimonials) {
        for (const ts of initialData.testimonials) {
          await conn.run(`INSERT INTO testimonials (id, quote, author, role, company, avatarUrl, rating, order_num, isDeleted) VALUES (${escapeStr(ts.id)}, ${escapeStr(ts.quote)}, ${escapeStr(ts.author)}, ${escapeStr(ts.role)}, ${escapeStr(ts.company)}, ${escapeStr(ts.avatarUrl)}, ${escapeNum(ts.rating)}, ${escapeNum((ts as any).order || 0)}, false)`);
        }
      }
      if (initialData.blogPosts) {
        for (const b of initialData.blogPosts) {
          await conn.run(`INSERT INTO blog_posts (id, slug, title, excerpt, body, coverImage, tags, publishDate, status, featured, isDeleted, author_name, author_role, author_avatar) VALUES (${escapeStr(b.id)}, ${escapeStr(b.slug)}, ${escapeStr(b.title)}, ${escapeStr(b.excerpt)}, ${escapeStr(b.body)}, ${escapeStr(b.coverImage)}, ${escapeJson(b.tags)}, ${escapeStr(b.publishDate)}, ${escapeStr(b.status)}, ${escapeBool(b.featured)}, false, ${escapeStr(b.author?.name)}, ${escapeStr(b.author?.role)}, ${escapeStr(b.author?.avatar)})`);
        }
      }
      if (initialData.caseStudies) {
        for (const cs of initialData.caseStudies) {
          await conn.run(`INSERT INTO case_studies (id, slug, title, client, industry, impactMetric, summary, body, coverImage, tags, isDeleted) VALUES (${escapeStr(cs.id)}, ${escapeStr(cs.slug)}, ${escapeStr(cs.title)}, ${escapeStr(cs.client)}, ${escapeStr(cs.industry)}, ${escapeStr(cs.impactMetric)}, ${escapeStr(cs.summary)}, ${escapeStr(cs.body)}, ${escapeStr(cs.coverImage)}, ${escapeJson(cs.tags)}, false)`);
        }
      }
      if (initialData.careers) {
        for (const c of initialData.careers) {
          await conn.run(`INSERT INTO careers (id, title, department, location, type, description, requirements, applyLink, active, isDeleted) VALUES (${escapeStr(c.id)}, ${escapeStr(c.title)}, ${escapeStr(c.department)}, ${escapeStr(c.location)}, ${escapeStr(c.type)}, ${escapeStr(c.description)}, ${escapeJson(c.requirements)}, ${escapeStr(c.applyLink)}, ${escapeBool(c.active)}, false)`);
        }
      }
      if (initialData.contactSubmissions) {
        for (const item of initialData.contactSubmissions) {
          await conn.run(`INSERT INTO contact_submissions (id, name, email, company, subject, message, attachmentUrl, attachmentName, status, createdAt) VALUES (${escapeStr(item.id)}, ${escapeStr(item.name)}, ${escapeStr(item.email)}, ${escapeStr(item.company)}, ${escapeStr(item.subject)}, ${escapeStr(item.message)}, ${escapeStr(item.attachmentUrl)}, ${escapeStr(item.attachmentName)}, ${escapeStr(item.status)}, ${escapeStr(item.createdAt)})`);
        }
      }
      if (initialData.footerPages) {
        for (const fp of initialData.footerPages) {
          await conn.run(`INSERT INTO footer_pages (id, slug, title, content, isDeleted) VALUES (${escapeStr(fp.id)}, ${escapeStr(fp.slug)}, ${escapeStr(fp.title)}, ${escapeStr(fp.content)}, false)`);
        }
      }
      if (initialData.cloudCredits) {
        for (const cc of initialData.cloudCredits) {
          await conn.run(`INSERT INTO cloud_credits (id, provider, service, limit_val, used, unit, resetDate) VALUES (${escapeStr(cc.id)}, ${escapeStr(cc.provider)}, ${escapeStr(cc.service)}, ${escapeNum(cc.limit)}, ${escapeNum(cc.used)}, ${escapeStr(cc.unit)}, ${escapeStr(cc.resetDate)})`);
        }
      }
      if (initialData.outreachQueue) {
        for (const l of initialData.outreachQueue) {
          await conn.run(`INSERT INTO outreach_leads (
            id, leadId, name, email, company, solutionOfInterest, intentScore, classificationTag, confidenceScore,
            buyingSignals, classificationReason, suggestedAction, sentiment, intentReason, aumOrBudget, userMessage,
            suggestedSubject, suggestedDraftResponse, status, stage, demoScheduledAt, demoMeetingType, demoNotes,
            customNotes, submittedAt, updatedAt, sentAt, source, inquiryType
          ) VALUES (
            ${escapeStr(l.id)}, ${escapeStr(l.leadId || null)}, ${escapeStr(l.name)}, ${escapeStr(l.email)},
            ${escapeStr(l.company || null)}, ${escapeStr(l.solutionOfInterest)}, ${escapeStr(l.intentScore)},
            ${escapeStr(l.classificationTag || null)}, ${escapeNum(l.confidenceScore || null)},
            ${escapeJson(l.buyingSignals || [])}, ${escapeStr(l.classificationReason || null)},
            ${escapeStr(l.suggestedAction || null)}, ${escapeJson(l.sentiment || null)},
            ${escapeStr(l.intentReason || null)}, ${escapeStr(l.aumOrBudget || null)},
            ${escapeStr(l.userMessage || null)}, ${escapeStr(l.suggestedSubject || null)},
            ${escapeStr(l.suggestedDraftResponse || null)}, ${escapeStr(l.status || 'Pending Review')},
            ${escapeStr(l.stage || 'New Inquiry')}, ${escapeStr(l.demoScheduledAt || null)},
            ${escapeStr(l.demoMeetingType || null)}, ${escapeStr(l.demoNotes || null)},
            ${escapeStr(l.customNotes || null)}, ${escapeStr(l.submittedAt || new Date().toISOString())},
            ${escapeStr(l.updatedAt || null)}, ${escapeStr(l.sentAt || null)},
            ${escapeStr((l as any).source || 'system')}, ${escapeStr((l as any).inquiryType || 'enterprise_inquiry')}
          )`);
        }
      }
      if (initialData.outreachTemplates) {
        for (const t of initialData.outreachTemplates) {
          await conn.run(`INSERT INTO outreach_templates (
            id, name, category, targetSolutionKeywords, subjectTemplate, bodyTemplate, systemPromptInstructions, isDefault, updatedAt
          ) VALUES (
            ${escapeStr(t.id)}, ${escapeStr(t.name)}, ${escapeStr(t.category)},
            ${escapeJson(t.targetSolutionKeywords || [])}, ${escapeStr(t.subjectTemplate)},
            ${escapeStr(t.bodyTemplate)}, ${escapeStr(t.systemPromptInstructions)},
            ${escapeBool(t.isDefault)}, ${escapeStr(t.updatedAt || new Date().toISOString())}
          )`);
        }
      }
      if (initialData.webhookConfigs) {
        for (const wh of initialData.webhookConfigs) {
          await conn.run(`INSERT INTO webhook_configs (id, name, url, isActive, type, updatedAt) VALUES (
            ${escapeStr(wh.id)}, ${escapeStr(wh.name)}, ${escapeStr(wh.url)},
            ${escapeBool(wh.isActive)}, ${escapeStr(wh.type)}, ${escapeStr(wh.updatedAt || new Date().toISOString())}
          )`);
        }
      }

      console.log('Database table initialization completed.');
    }
  } catch (err) {
    console.warn('initializeTables warning:', err);
  }
}

async function syncToLocalJsonBackup() {
  try {
    const cms = await db.getFullCms();
    fs.writeFileSync(DATA_FILE, JSON.stringify(cms, null, 2), 'utf-8');
    memoryStore = cms;
  } catch (e) {
    console.warn('Failed to sync DuckDB to cmsData.json backup:', e);
  }
}

const duckDb = {
  getDuckConnection,
  // --- Hero Content ---
  async getHero(): Promise<HeroContent> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT data FROM hero_content WHERE id = 'default'`);
        const row = reader.getRowObjects()[0];
        if (row && row.data) {
          return JSON.parse(row.data);
        }
      } catch (e) {
        console.warn('DuckDB getHero error:', e);
      }
    }
    return memoryStore.hero || initialCmsData.hero;
  },

  async updateHero(data: HeroContent, skipVersionHistory: boolean = false): Promise<HeroContent> {
    memoryStore.hero = data;
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM hero_content WHERE id = 'default'`);
        await conn.run(`INSERT INTO hero_content (id, data) VALUES ('default', ${escapeJson(data)})`);
      } catch (e) {
        console.warn('DuckDB updateHero error:', e);
      }
    }
    await syncToLocalJsonBackup();
    if (!skipVersionHistory) {
      await this.createContentVersion('hero', 'default', data.headline || 'Hero Banner Section', data, 'Hero section updated');
    }
    return data;
  },

  // --- Services ---
  async getServices(): Promise<ServiceItem[]> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT * FROM services WHERE isDeleted = false ORDER BY order_num ASC`);
        const rows = reader.getRowObjects();
        if (rows.length > 0) {
          return rows.map((r: any) => ({
            id: r.id,
            title: r.title,
            category: r.category,
            shortDescription: r.shortDescription,
            fullDescription: r.fullDescription,
            iconName: r.iconName,
            features: r.features ? JSON.parse(r.features) : [],
            order: r.order_num,
            highlighted: Boolean(r.highlighted),
          }));
        }
      } catch (e) {
        console.warn('DuckDB getServices error:', e);
      }
    }
    return memoryStore.services || initialCmsData.services;
  },

  async saveService(service: Partial<ServiceItem>, id?: string): Promise<ServiceItem> {
    const targetId = id || service.id || `srv-${Date.now()}`;
    const fullService: ServiceItem = {
      id: targetId,
      title: service.title || 'New Service',
      category: service.category || 'ai_dev',
      shortDescription: service.shortDescription || '',
      fullDescription: service.fullDescription || '',
      iconName: service.iconName || 'Cpu',
      features: service.features || [],
      order: service.order || 1,
      highlighted: service.highlighted || false,
      ...service,
    } as ServiceItem;

    if (!memoryStore.services) memoryStore.services = [];
    const idx = memoryStore.services.findIndex((s) => s.id === targetId);
    if (idx !== -1) memoryStore.services[idx] = fullService;
    else memoryStore.services.push(fullService);

    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM services WHERE id = ${escapeStr(targetId)}`);
        await conn.run(`INSERT INTO services (id, title, category, shortDescription, fullDescription, iconName, features, order_num, highlighted, isDeleted)
          VALUES (
            ${escapeStr(fullService.id)},
            ${escapeStr(fullService.title)},
            ${escapeStr(fullService.category)},
            ${escapeStr(fullService.shortDescription)},
            ${escapeStr(fullService.fullDescription)},
            ${escapeStr(fullService.iconName)},
            ${escapeJson(fullService.features)},
            ${escapeNum(fullService.order)},
            ${escapeBool(fullService.highlighted)},
            false
          )`);
      } catch (e) {
        console.warn('DuckDB saveService error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return fullService;
  },

  async deleteService(id: string): Promise<boolean> {
    if (memoryStore.services) memoryStore.services = memoryStore.services.filter((s) => s.id !== id);
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`UPDATE services SET isDeleted = true WHERE id = ${escapeStr(id)}`);
      } catch (e) {
        console.warn('DuckDB deleteService error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return true;
  },

  // --- Products ---
  async getProducts(): Promise<ProductItem[]> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT * FROM products WHERE isDeleted = false ORDER BY order_num ASC`);
        const rows = reader.getRowObjects();
        if (rows.length > 0) {
          return rows.map((r: any) => ({
            id: r.id,
            title: r.title,
            slug: r.slug,
            category: r.category,
            tagline: r.tagline,
            shortDescription: r.shortDescription,
            fullDescription: r.fullDescription,
            iconName: r.iconName,
            pricingModel: r.pricingModel,
            features: r.features ? JSON.parse(r.features) : [],
            specs: r.specs ? JSON.parse(r.specs) : [],
            badge: r.badge || undefined,
            demoUrl: r.demoUrl || undefined,
            imageUrl: r.imageUrl || undefined,
            specSheetUrl: r.specSheetUrl || undefined,
            order: r.order_num,
            highlighted: Boolean(r.highlighted),
          }));
        }
      } catch (e) {
        console.warn('DuckDB getProducts error:', e);
      }
    }
    return memoryStore.products || initialCmsData.products;
  },

  async saveProduct(product: Partial<ProductItem>, id?: string): Promise<ProductItem> {
    const targetId = id || product.id || `prod-${Date.now()}`;
    const fullProduct: ProductItem = {
      id: targetId,
      title: product.title || 'New Product',
      slug: product.slug || `prod-${Date.now()}`,
      category: product.category || 'Autonomous Agents',
      tagline: product.tagline || '',
      shortDescription: product.shortDescription || '',
      fullDescription: product.fullDescription || '',
      iconName: product.iconName || 'Bot',
      pricingModel: product.pricingModel || 'Enterprise Custom',
      features: product.features || [],
      specs: product.specs || [],
      badge: product.badge || '',
      demoUrl: product.demoUrl || '',
      imageUrl: product.imageUrl || '',
      specSheetUrl: product.specSheetUrl || '',
      order: product.order || 0,
      highlighted: product.highlighted || false,
      ...product,
    } as ProductItem;

    if (!memoryStore.products) memoryStore.products = [];
    const idx = memoryStore.products.findIndex((p) => p.id === targetId);
    if (idx !== -1) memoryStore.products[idx] = fullProduct;
    else memoryStore.products.push(fullProduct);

    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM products WHERE id = ${escapeStr(targetId)}`);
        await conn.run(`INSERT INTO products (id, title, slug, category, tagline, shortDescription, fullDescription, iconName, pricingModel, features, specs, badge, demoUrl, imageUrl, specSheetUrl, order_num, highlighted, isDeleted)
          VALUES (
            ${escapeStr(fullProduct.id)},
            ${escapeStr(fullProduct.title)},
            ${escapeStr(fullProduct.slug)},
            ${escapeStr(fullProduct.category)},
            ${escapeStr(fullProduct.tagline)},
            ${escapeStr(fullProduct.shortDescription)},
            ${escapeStr(fullProduct.fullDescription)},
            ${escapeStr(fullProduct.iconName)},
            ${escapeStr(fullProduct.pricingModel)},
            ${escapeJson(fullProduct.features)},
            ${escapeJson(fullProduct.specs)},
            ${escapeStr(fullProduct.badge)},
            ${escapeStr(fullProduct.demoUrl)},
            ${escapeStr(fullProduct.imageUrl)},
            ${escapeStr(fullProduct.specSheetUrl)},
            ${escapeNum(fullProduct.order)},
            ${escapeBool(fullProduct.highlighted)},
            false
          )`);
      } catch (e) {
        console.warn('DuckDB saveProduct error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return fullProduct;
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (memoryStore.products) memoryStore.products = memoryStore.products.filter((p) => p.id !== id);
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`UPDATE products SET isDeleted = true WHERE id = ${escapeStr(id)}`);
      } catch (e) {
        console.warn('DuckDB deleteProduct error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return true;
  },

  // --- Platforms ---
  async getPlatforms(): Promise<PlatformItem[]> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT * FROM platforms WHERE isDeleted = false ORDER BY order_num ASC`);
        const rows = reader.getRowObjects();
        if (rows.length > 0) {
          return rows.map((r: any) => ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            tagline: r.tagline,
            category: r.category,
            description: r.description,
            keyFeatures: r.keyFeatures ? JSON.parse(r.keyFeatures) : [],
            stats: r.stats ? JSON.parse(r.stats) : [],
            demoUrl: r.demoUrl || undefined,
            imageUrl: r.imageUrl || undefined,
            specSheetUrl: r.specSheetUrl || undefined,
            badge: r.badge || undefined,
            iconName: r.iconName,
            order: r.order_num,
          }));
        }
      } catch (e) {
        console.warn('DuckDB getPlatforms error:', e);
      }
    }
    return memoryStore.platforms || initialCmsData.platforms;
  },

  async savePlatform(item: Partial<PlatformItem>, id?: string): Promise<PlatformItem> {
    const targetId = id || item.id || `plat-${Date.now()}`;
    const fullItem: PlatformItem = {
      id: targetId,
      name: item.name || 'New Platform',
      slug: item.slug || `plat-${Date.now()}`,
      tagline: item.tagline || '',
      category: item.category || 'Automation',
      description: item.description || '',
      keyFeatures: item.keyFeatures || [],
      stats: item.stats || [],
      demoUrl: item.demoUrl || '',
      imageUrl: item.imageUrl || '',
      specSheetUrl: item.specSheetUrl || '',
      badge: item.badge || '',
      iconName: item.iconName || 'Server',
      order: item.order || 0,
      ...item,
    } as PlatformItem;

    if (!memoryStore.platforms) memoryStore.platforms = [];
    const idx = memoryStore.platforms.findIndex((p) => p.id === targetId);
    if (idx !== -1) memoryStore.platforms[idx] = fullItem;
    else memoryStore.platforms.push(fullItem);

    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM platforms WHERE id = ${escapeStr(targetId)}`);
        await conn.run(`INSERT INTO platforms (id, name, slug, tagline, category, description, keyFeatures, stats, demoUrl, imageUrl, specSheetUrl, badge, iconName, order_num, isDeleted)
          VALUES (
            ${escapeStr(fullItem.id)},
            ${escapeStr(fullItem.name)},
            ${escapeStr(fullItem.slug)},
            ${escapeStr(fullItem.tagline)},
            ${escapeStr(fullItem.category)},
            ${escapeStr(fullItem.description)},
            ${escapeJson(fullItem.keyFeatures)},
            ${escapeJson(fullItem.stats)},
            ${escapeStr(fullItem.demoUrl)},
            ${escapeStr(fullItem.imageUrl)},
            ${escapeStr(fullItem.specSheetUrl)},
            ${escapeStr(fullItem.badge)},
            ${escapeStr(fullItem.iconName)},
            ${escapeNum(fullItem.order)},
            false
          )`);
      } catch (e) {
        console.warn('DuckDB savePlatform error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return fullItem;
  },

  async deletePlatform(id: string): Promise<boolean> {
    if (memoryStore.platforms) memoryStore.platforms = memoryStore.platforms.filter((p) => p.id !== id);
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`UPDATE platforms SET isDeleted = true WHERE id = ${escapeStr(id)}`);
      } catch (e) {
        console.warn('DuckDB deletePlatform error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return true;
  },

  // --- Models ---
  async getModels(): Promise<any[]> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT * FROM models WHERE isDeleted = false ORDER BY order_num ASC`);
        const rows = reader.getRowObjects();
        if (rows.length > 0) {
          return rows.map((r: any) => ({
            id: r.id,
            name: r.name,
            badge: r.badge,
            tagline: r.tagline,
            description: r.description,
            contextWindow: r.contextWindow,
            maxOutput: r.maxOutput,
            speed: r.speed,
            inputPrice: r.inputPrice,
            outputPrice: r.outputPrice,
            benchmarks: r.benchmarks ? JSON.parse(r.benchmarks) : [],
            features: r.features ? JSON.parse(r.features) : [],
            bestFor: r.bestFor,
            order: r.order_num,
          }));
        }
      } catch (e) {
        console.warn('DuckDB getModels error:', e);
      }
    }
    return memoryStore.models || initialCmsData.models;
  },

  async saveModel(item: any, id?: string): Promise<any> {
    const targetId = id || item.id || `model-${Date.now()}`;
    const fullItem = {
      id: targetId,
      name: item.name || 'New Model',
      badge: item.badge || 'Frontier',
      tagline: item.tagline || '',
      description: item.description || '',
      contextWindow: item.contextWindow || '128K',
      maxOutput: item.maxOutput || '8K',
      speed: item.speed || '~100 t/s',
      inputPrice: item.inputPrice || '$1.00',
      outputPrice: item.outputPrice || '$4.00',
      benchmarks: item.benchmarks || [],
      features: item.features || [],
      bestFor: item.bestFor || '',
      order: item.order || 0,
      ...item,
    };

    if (!memoryStore.models) memoryStore.models = [];
    const idx = memoryStore.models.findIndex((m) => m.id === targetId);
    if (idx !== -1) memoryStore.models[idx] = fullItem;
    else memoryStore.models.push(fullItem);

    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM models WHERE id = ${escapeStr(targetId)}`);
        await conn.run(`INSERT INTO models (id, name, badge, tagline, description, contextWindow, maxOutput, speed, inputPrice, outputPrice, benchmarks, features, bestFor, order_num, isDeleted)
          VALUES (
            ${escapeStr(fullItem.id)},
            ${escapeStr(fullItem.name)},
            ${escapeStr(fullItem.badge)},
            ${escapeStr(fullItem.tagline)},
            ${escapeStr(fullItem.description)},
            ${escapeStr(fullItem.contextWindow)},
            ${escapeStr(fullItem.maxOutput)},
            ${escapeStr(fullItem.speed)},
            ${escapeStr(fullItem.inputPrice)},
            ${escapeStr(fullItem.outputPrice)},
            ${escapeJson(fullItem.benchmarks)},
            ${escapeJson(fullItem.features)},
            ${escapeStr(fullItem.bestFor)},
            ${escapeNum(fullItem.order)},
            false
          )`);
      } catch (e) {
        console.warn('DuckDB saveModel error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return fullItem;
  },

  async deleteModel(id: string): Promise<boolean> {
    if (memoryStore.models) memoryStore.models = memoryStore.models.filter((m) => m.id !== id);
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`UPDATE models SET isDeleted = true WHERE id = ${escapeStr(id)}`);
      } catch (e) {
        console.warn('DuckDB deleteModel error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return true;
  },

  // --- Blog Posts ---
  async getBlogPosts(): Promise<BlogPost[]> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT * FROM blog_posts WHERE isDeleted = false ORDER BY publishDate DESC`);
        const rows = reader.getRowObjects();
        if (rows.length > 0) {
          return rows.map((r: any) => ({
            id: r.id,
            slug: r.slug,
            title: r.title,
            excerpt: r.excerpt,
            body: r.body,
            coverImage: r.coverImage,
            tags: r.tags ? JSON.parse(r.tags) : [],
            publishDate: r.publishDate,
            status: r.status,
            featured: Boolean(r.featured),
            author: {
              name: r.author_name || 'Dr. Elena Vance',
              role: r.author_role || 'Chief AI Architect',
              avatar: r.author_avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
            },
          }));
        }
      } catch (e) {
        console.warn('DuckDB getBlogPosts error:', e);
      }
    }
    return memoryStore.blogPosts || initialCmsData.blogPosts;
  },

  async saveBlogPost(item: Partial<BlogPost>, id?: string, skipVersionHistory: boolean = false): Promise<BlogPost> {
    const targetId = id || item.id || `blog-${Date.now()}`;
    const author = item.author || {
      name: 'Dr. Elena Vance',
      role: 'Chief AI Architect',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    };
    const fullItem: BlogPost = {
      id: targetId,
      title: item.title || '',
      slug: item.slug || `blog-${Date.now()}`,
      excerpt: item.excerpt || '',
      body: item.body || '',
      publishDate: item.publishDate || new Date().toISOString(),
      tags: item.tags || [],
      coverImage: item.coverImage || '',
      status: item.status || 'draft',
      featured: item.featured || false,
      author,
      ...item,
    } as BlogPost;

    if (!memoryStore.blogPosts) memoryStore.blogPosts = [];
    const idx = memoryStore.blogPosts.findIndex((b) => b.id === targetId);
    if (idx !== -1) memoryStore.blogPosts[idx] = fullItem;
    else memoryStore.blogPosts.unshift(fullItem);

    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM blog_posts WHERE id = ${escapeStr(targetId)}`);
        await conn.run(`INSERT INTO blog_posts (id, slug, title, excerpt, body, coverImage, tags, publishDate, status, featured, isDeleted, author_name, author_role, author_avatar)
          VALUES (
            ${escapeStr(fullItem.id)},
            ${escapeStr(fullItem.slug)},
            ${escapeStr(fullItem.title)},
            ${escapeStr(fullItem.excerpt)},
            ${escapeStr(fullItem.body)},
            ${escapeStr(fullItem.coverImage)},
            ${escapeJson(fullItem.tags)},
            ${escapeStr(fullItem.publishDate)},
            ${escapeStr(fullItem.status)},
            ${escapeBool(fullItem.featured)},
            false,
            ${escapeStr(fullItem.author.name)},
            ${escapeStr(fullItem.author.role)},
            ${escapeStr(fullItem.author.avatar)}
          )`);
      } catch (e) {
        console.warn('DuckDB saveBlogPost error:', e);
      }
    }
    await syncToLocalJsonBackup();
    if (!skipVersionHistory) {
      await this.createContentVersion('blog', targetId, fullItem.title || 'Untitled Blog Post', fullItem, 'Blog content saved');
    }
    return fullItem;
  },

  async deleteBlogPost(id: string): Promise<boolean> {
    if (memoryStore.blogPosts) memoryStore.blogPosts = memoryStore.blogPosts.filter((b) => b.id !== id);
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`UPDATE blog_posts SET isDeleted = true WHERE id = ${escapeStr(id)}`);
      } catch (e) {
        console.warn('DuckDB deleteBlogPost error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return true;
  },

  // --- Team Members ---
  async getTeamMembers(): Promise<TeamMember[]> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT * FROM team_members WHERE isDeleted = false ORDER BY order_num ASC`);
        const rows = reader.getRowObjects();
        if (rows.length > 0) {
          return rows.map((r: any) => ({
            id: r.id,
            name: r.name,
            role: r.role,
            department: r.department,
            bio: r.bio,
            photoUrl: r.photoUrl,
            socials: r.socials ? JSON.parse(r.socials) : {},
            order: r.order_num,
          }));
        }
      } catch (e) {
        console.warn('DuckDB getTeamMembers error:', e);
      }
    }
    return memoryStore.team || initialCmsData.team;
  },

  async saveTeamMember(item: Partial<TeamMember>, id?: string): Promise<TeamMember> {
    const targetId = id || item.id || `tm-${Date.now()}`;
    const fullItem: TeamMember = {
      id: targetId,
      name: item.name || 'New Member',
      role: item.role || '',
      department: item.department || '',
      bio: item.bio || '',
      photoUrl: item.photoUrl || '',
      socials: item.socials || {},
      order: item.order || 0,
      ...item,
    } as TeamMember;

    if (!memoryStore.team) memoryStore.team = [];
    const idx = memoryStore.team.findIndex((t) => t.id === targetId);
    if (idx !== -1) memoryStore.team[idx] = fullItem;
    else memoryStore.team.push(fullItem);

    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM team_members WHERE id = ${escapeStr(targetId)}`);
        await conn.run(`INSERT INTO team_members (id, name, role, department, bio, photoUrl, socials, order_num, isDeleted)
          VALUES (
            ${escapeStr(fullItem.id)},
            ${escapeStr(fullItem.name)},
            ${escapeStr(fullItem.role)},
            ${escapeStr(fullItem.department)},
            ${escapeStr(fullItem.bio)},
            ${escapeStr(fullItem.photoUrl)},
            ${escapeJson(fullItem.socials)},
            ${escapeNum(fullItem.order)},
            false
          )`);
      } catch (e) {
        console.warn('DuckDB saveTeamMember error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return fullItem;
  },

  async deleteTeamMember(id: string): Promise<boolean> {
    if (memoryStore.team) memoryStore.team = memoryStore.team.filter((t) => t.id !== id);
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`UPDATE team_members SET isDeleted = true WHERE id = ${escapeStr(id)}`);
      } catch (e) {
        console.warn('DuckDB deleteTeamMember error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return true;
  },

  // --- Testimonials ---
  async getTestimonials(): Promise<Testimonial[]> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT * FROM testimonials WHERE isDeleted = false ORDER BY order_num ASC`);
        const rows = reader.getRowObjects();
        if (rows.length > 0) {
          return rows.map((r: any) => ({
            id: r.id,
            quote: r.quote,
            author: r.author,
            role: r.role,
            company: r.company,
            avatarUrl: r.avatarUrl,
            rating: r.rating || 5,
          }));
        }
      } catch (e) {
        console.warn('DuckDB getTestimonials error:', e);
      }
    }
    return memoryStore.testimonials || initialCmsData.testimonials;
  },

  async saveTestimonial(item: Partial<Testimonial>, id?: string): Promise<Testimonial> {
    const targetId = id || item.id || `tst-${Date.now()}`;
    const fullItem: Testimonial = {
      id: targetId,
      quote: item.quote || '',
      author: item.author || '',
      role: item.role || '',
      company: item.company || '',
      avatarUrl: item.avatarUrl || '',
      rating: item.rating || 5,
      ...item,
    } as Testimonial;

    if (!memoryStore.testimonials) memoryStore.testimonials = [];
    const idx = memoryStore.testimonials.findIndex((t) => t.id === targetId);
    if (idx !== -1) memoryStore.testimonials[idx] = fullItem;
    else memoryStore.testimonials.push(fullItem);

    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM testimonials WHERE id = ${escapeStr(targetId)}`);
        await conn.run(`INSERT INTO testimonials (id, quote, author, role, company, avatarUrl, rating, order_num, isDeleted)
          VALUES (
            ${escapeStr(fullItem.id)},
            ${escapeStr(fullItem.quote)},
            ${escapeStr(fullItem.author)},
            ${escapeStr(fullItem.role)},
            ${escapeStr(fullItem.company)},
            ${escapeStr(fullItem.avatarUrl)},
            ${escapeNum(fullItem.rating)},
            ${escapeNum((item as any).order || 0)},
            false
          )`);
      } catch (e) {
        console.warn('DuckDB saveTestimonial error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return fullItem;
  },

  async deleteTestimonial(id: string): Promise<boolean> {
    if (memoryStore.testimonials) memoryStore.testimonials = memoryStore.testimonials.filter((t) => t.id !== id);
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM testimonials WHERE id = ${escapeStr(id)}`);
      } catch (e) {
        console.warn('DuckDB deleteTestimonial error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return true;
  },

  // --- Case Studies ---
  async getCaseStudies(): Promise<CaseStudy[]> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT * FROM case_studies WHERE isDeleted = false`);
        const rows = reader.getRowObjects();
        if (rows.length > 0) {
          return rows.map((r: any) => ({
            id: r.id,
            slug: r.slug,
            title: r.title,
            client: r.client,
            industry: r.industry,
            impactMetric: r.impactMetric,
            summary: r.summary,
            body: r.body,
            coverImage: r.coverImage,
            tags: r.tags ? JSON.parse(r.tags) : [],
          }));
        }
      } catch (e) {
        console.warn('DuckDB getCaseStudies error:', e);
      }
    }
    return memoryStore.caseStudies || initialCmsData.caseStudies;
  },

  async saveCaseStudy(item: Partial<CaseStudy>, id?: string): Promise<CaseStudy> {
    const targetId = id || item.id || `cs-${Date.now()}`;
    const fullItem: CaseStudy = {
      id: targetId,
      client: item.client || '',
      industry: item.industry || '',
      title: item.title || '',
      summary: item.summary || '',
      body: item.body || '',
      impactMetric: item.impactMetric || '',
      tags: item.tags || [],
      slug: item.slug || `cs-${Date.now()}`,
      coverImage: item.coverImage || '',
      ...item,
    } as CaseStudy;

    if (!memoryStore.caseStudies) memoryStore.caseStudies = [];
    const idx = memoryStore.caseStudies.findIndex((c) => c.id === targetId);
    if (idx !== -1) memoryStore.caseStudies[idx] = fullItem;
    else memoryStore.caseStudies.unshift(fullItem);

    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM case_studies WHERE id = ${escapeStr(targetId)}`);
        await conn.run(`INSERT INTO case_studies (id, slug, title, client, industry, impactMetric, summary, body, coverImage, tags, isDeleted)
          VALUES (
            ${escapeStr(fullItem.id)},
            ${escapeStr(fullItem.slug)},
            ${escapeStr(fullItem.title)},
            ${escapeStr(fullItem.client)},
            ${escapeStr(fullItem.industry)},
            ${escapeStr(fullItem.impactMetric)},
            ${escapeStr(fullItem.summary)},
            ${escapeStr(fullItem.body)},
            ${escapeStr(fullItem.coverImage)},
            ${escapeJson(fullItem.tags)},
            false
          )`);
      } catch (e) {
        console.warn('DuckDB saveCaseStudy error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return fullItem;
  },

  async deleteCaseStudy(id: string): Promise<boolean> {
    if (memoryStore.caseStudies) memoryStore.caseStudies = memoryStore.caseStudies.filter((c) => c.id !== id);
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM case_studies WHERE id = ${escapeStr(id)}`);
      } catch (e) {
        console.warn('DuckDB deleteCaseStudy error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return true;
  },

  // --- Careers ---
  async getCareers(): Promise<CareerListing[]> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT * FROM careers WHERE isDeleted = false`);
        const rows = reader.getRowObjects();
        if (rows.length > 0) {
          return rows.map((r: any) => ({
            id: r.id,
            title: r.title,
            department: r.department,
            location: r.location,
            type: r.type,
            description: r.description,
            requirements: r.requirements ? JSON.parse(r.requirements) : [],
            applyLink: r.applyLink,
            active: Boolean(r.active),
          }));
        }
      } catch (e) {
        console.warn('DuckDB getCareers error:', e);
      }
    }
    return memoryStore.careers || initialCmsData.careers;
  },

  async saveCareer(job: Partial<CareerListing>, id?: string): Promise<CareerListing> {
    const targetId = id || job.id || `car-${Date.now()}`;
    const fullJob: CareerListing = {
      id: targetId,
      title: job.title || 'New Position',
      department: job.department || 'Engineering',
      location: job.location || 'Remote',
      type: job.type || 'Full-time',
      description: job.description || '',
      requirements: job.requirements || [],
      applyLink: job.applyLink || '#contact',
      active: job.active !== undefined ? job.active : true,
      ...job,
    } as CareerListing;

    if (!memoryStore.careers) memoryStore.careers = [];
    const idx = memoryStore.careers.findIndex((c) => c.id === targetId);
    if (idx !== -1) memoryStore.careers[idx] = fullJob;
    else memoryStore.careers.push(fullJob);

    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM careers WHERE id = ${escapeStr(targetId)}`);
        await conn.run(`INSERT INTO careers (id, title, department, location, type, description, requirements, applyLink, active, isDeleted)
          VALUES (
            ${escapeStr(fullJob.id)},
            ${escapeStr(fullJob.title)},
            ${escapeStr(fullJob.department)},
            ${escapeStr(fullJob.location)},
            ${escapeStr(fullJob.type)},
            ${escapeStr(fullJob.description)},
            ${escapeJson(fullJob.requirements)},
            ${escapeStr(fullJob.applyLink)},
            ${escapeBool(fullJob.active)},
            false
          )`);
      } catch (e) {
        console.warn('DuckDB saveCareer error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return fullJob;
  },

  async deleteCareer(id: string): Promise<boolean> {
    if (memoryStore.careers) memoryStore.careers = memoryStore.careers.filter((c) => c.id !== id);
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`UPDATE careers SET isDeleted = true WHERE id = ${escapeStr(id)}`);
      } catch (e) {
        console.warn('DuckDB deleteCareer error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return true;
  },

  // --- Contact Submissions ---
  async getContactSubmissions(): Promise<ContactSubmission[]> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT * FROM contact_submissions ORDER BY createdAt DESC`);
        const rows = reader.getRowObjects();
        if (rows.length > 0) {
          return rows.map((r: any) => ({
            id: r.id,
            name: r.name,
            email: r.email,
            company: r.company || undefined,
            subject: r.subject,
            message: r.message,
            attachmentUrl: r.attachmentUrl || undefined,
            attachmentName: r.attachmentName || undefined,
            createdAt: r.createdAt,
            status: r.status,
          }));
        }
      } catch (e) {
        console.warn('DuckDB getContactSubmissions error:', e);
      }
    }
    return memoryStore.contactSubmissions || initialCmsData.contactSubmissions;
  },

  async createContactSubmission(data: Partial<ContactSubmission>): Promise<ContactSubmission> {
    const newSub: ContactSubmission = {
      id: `sub-${Date.now()}`,
      name: data.name || '',
      email: data.email || '',
      company: data.company || '',
      subject: data.subject || 'Executive Demo Request',
      message: data.message || '',
      attachmentUrl: data.attachmentUrl || '',
      attachmentName: data.attachmentName || '',
      createdAt: new Date().toISOString(),
      status: 'unread',
    };
    if (!memoryStore.contactSubmissions) memoryStore.contactSubmissions = [];
    memoryStore.contactSubmissions.unshift(newSub);

    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`INSERT INTO contact_submissions (id, name, email, company, subject, message, attachmentUrl, attachmentName, status, createdAt)
          VALUES (
            ${escapeStr(newSub.id)},
            ${escapeStr(newSub.name)},
            ${escapeStr(newSub.email)},
            ${escapeStr(newSub.company)},
            ${escapeStr(newSub.subject)},
            ${escapeStr(newSub.message)},
            ${escapeStr(newSub.attachmentUrl)},
            ${escapeStr(newSub.attachmentName)},
            ${escapeStr(newSub.status)},
            ${escapeStr(newSub.createdAt)}
          )`);
      } catch (e) {
        console.warn('DuckDB createContactSubmission error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return newSub;
  },

  async updateContactSubmissionStatus(id: string, status: string): Promise<ContactSubmission | null> {
    if (memoryStore.contactSubmissions) {
      const item = memoryStore.contactSubmissions.find((s) => s.id === id);
      if (item) (item as any).status = status;
    }
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`UPDATE contact_submissions SET status = ${escapeStr(status)} WHERE id = ${escapeStr(id)}`);
      } catch (e) {
        console.warn('DuckDB updateContactSubmissionStatus error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return memoryStore.contactSubmissions?.find((s) => s.id === id) || null;
  },

  // --- Site Settings ---
  async getSiteSettings(): Promise<SiteSettings> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT data FROM site_settings WHERE id = 'default'`);
        const row = reader.getRowObjects()[0];
        if (row && row.data) {
          return JSON.parse(row.data);
        }
      } catch (e) {
        console.warn('DuckDB getSiteSettings error:', e);
      }
    }
    return memoryStore.settings || initialCmsData.settings;
  },

  async saveSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.getSiteSettings();
    const updated = { ...current, ...settings } as SiteSettings;
    memoryStore.settings = updated;

    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM site_settings WHERE id = 'default'`);
        await conn.run(`INSERT INTO site_settings (id, data) VALUES ('default', ${escapeJson(updated)})`);
      } catch (e) {
        console.warn('DuckDB saveSiteSettings error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return updated;
  },

  // --- About Us ---
  async saveAboutUs(data: Partial<any>): Promise<any> {
    const about = { ...initialCmsData.aboutUs, ...data };
    memoryStore.aboutUs = about;
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM about_us WHERE id = 'default'`);
        await conn.run(`INSERT INTO about_us (id, data) VALUES ('default', ${escapeJson(about)})`);
      } catch (e) {
        console.warn('DuckDB saveAboutUs error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return about;
  },

  // --- Popup Banner ---
  async savePopupBanner(data: Partial<any>): Promise<any> {
    const banner = { ...initialCmsData.popupBanner, ...data };
    memoryStore.popupBanner = banner;
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM popup_banner WHERE id = 'default'`);
        await conn.run(`INSERT INTO popup_banner (id, data) VALUES ('default', ${escapeJson(banner)})`);
      } catch (e) {
        console.warn('DuckDB savePopupBanner error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return banner;
  },

  // --- Cloud Credits ---
  async getCloudCredits(): Promise<CloudCreditUsage[]> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT * FROM cloud_credits`);
        const rows = reader.getRowObjects();
        if (rows.length > 0) {
          return rows.map((r: any) => ({
            id: r.id,
            provider: r.provider,
            service: r.service,
            limit: Number(r.limit_val),
            used: Number(r.used),
            unit: r.unit,
            resetDate: new Date(r.resetDate).toISOString(),
          }));
        }
      } catch (e) {
        console.warn('DuckDB getCloudCredits error:', e);
      }
    }
    return memoryStore.cloudCredits || initialCmsData.cloudCredits;
  },

  async saveCloudCredit(credit: Partial<CloudCreditUsage>, id?: string): Promise<CloudCreditUsage> {
    const newId = id || credit.id || `cc-${Date.now()}`;
    const full: CloudCreditUsage = {
      id: newId,
      provider: credit.provider || 'System',
      service: credit.service || 'General',
      limit: credit.limit ?? 0,
      used: credit.used ?? 0,
      unit: credit.unit || 'credits',
      resetDate: credit.resetDate || new Date().toISOString(),
    } as CloudCreditUsage;
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM cloud_credits WHERE id = ${escapeStr(full.id)}`);
        await conn.run(`INSERT INTO cloud_credits (id, provider, service, limit_val, used, unit, resetDate) VALUES (${escapeStr(full.id)}, ${escapeStr(full.provider)}, ${escapeStr(full.service)}, ${escapeNum(full.limit)}, ${escapeNum(full.used)}, ${escapeStr(full.unit)}, ${escapeStr(full.resetDate)})`);
      } catch (e) {
        console.warn('DuckDB saveCloudCredit error:', e);
      }
    }
    memoryStore.cloudCredits = (memoryStore.cloudCredits || []).filter(c => c.id !== full.id);
    (memoryStore.cloudCredits as any).push(full);
    await syncToLocalJsonBackup();
    return full;
  },

  async deleteCloudCredit(id: string): Promise<boolean> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM cloud_credits WHERE id = ${escapeStr(id)}`);
      } catch (e) {
        console.warn('DuckDB deleteCloudCredit error:', e);
      }
    }
    memoryStore.cloudCredits = (memoryStore.cloudCredits || []).filter(c => c.id !== id);
    await syncToLocalJsonBackup();
    return true;
  },

  // --- Footer Pages ---
  async getFooterPages(): Promise<FooterPage[]> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT * FROM footer_pages WHERE isDeleted = false`);
        const rows = reader.getRowObjects();
        if (rows.length > 0) {
          return rows.map((r: any) => ({
            id: r.id,
            slug: r.slug,
            title: r.title,
            content: r.content,
          }));
        }
      } catch (e) {
        console.warn('DuckDB getFooterPages error:', e);
      }
    }
    return memoryStore.footerPages || initialCmsData.footerPages;
  },

  async saveFooterPage(page: Partial<FooterPage>, id?: string, skipVersionHistory: boolean = false): Promise<FooterPage> {
    const targetId = id || page.id || `fp-${Date.now()}`;
    const fullPage: FooterPage = {
      id: targetId,
      slug: page.slug || `page-${Date.now()}`,
      title: page.title || 'New Page',
      content: page.content || '',
      ...page,
    };
    if (!memoryStore.footerPages) memoryStore.footerPages = [];
    const idx = memoryStore.footerPages.findIndex((p) => p.id === targetId);
    if (idx !== -1) memoryStore.footerPages[idx] = fullPage;
    else memoryStore.footerPages.push(fullPage);

    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM footer_pages WHERE id = ${escapeStr(targetId)}`);
        await conn.run(`INSERT INTO footer_pages (id, slug, title, content, isDeleted)
          VALUES (
            ${escapeStr(fullPage.id)},
            ${escapeStr(fullPage.slug)},
            ${escapeStr(fullPage.title)},
            ${escapeStr(fullPage.content)},
            false
          )`);
      } catch (e) {
        console.warn('DuckDB saveFooterPage error:', e);
      }
    }
    await syncToLocalJsonBackup();
    if (!skipVersionHistory) {
      await this.createContentVersion('footer_page', targetId, fullPage.title || 'Footer Page', fullPage, 'Page content saved');
    }
    return fullPage;
  },

  async deleteFooterPage(id: string): Promise<boolean> {
    if (memoryStore.footerPages) memoryStore.footerPages = memoryStore.footerPages.filter((p) => p.id !== id);
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`UPDATE footer_pages SET isDeleted = true WHERE id = ${escapeStr(id)}`);
      } catch (e) {
        console.warn('DuckDB deleteFooterPage error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return true;
  },

  // --- Outreach Leads ---
  async getOutreachLeads(): Promise<OutreachLead[]> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT * FROM outreach_leads ORDER BY submittedAt DESC`);
        const rows = reader.getRowObjects();
        return rows.map((r: any) => ({
          id: r.id,
          leadId: r.leadId || undefined,
          name: r.name,
          email: r.email,
          company: r.company || undefined,
          solutionOfInterest: r.solutionOfInterest,
          intentScore: r.intentScore,
          classificationTag: r.classificationTag || undefined,
          confidenceScore: r.confidenceScore ? Number(r.confidenceScore) : undefined,
          buyingSignals: r.buyingSignals ? JSON.parse(r.buyingSignals) : [],
          classificationReason: r.classificationReason || undefined,
          suggestedAction: r.suggestedAction || undefined,
          sentiment: r.sentiment ? JSON.parse(r.sentiment) : undefined,
          intentReason: r.intentReason,
          aumOrBudget: r.aumOrBudget || undefined,
          userMessage: r.userMessage || undefined,
          suggestedSubject: r.suggestedSubject,
          suggestedDraftResponse: r.suggestedDraftResponse,
          status: r.status,
          stage: r.stage || undefined,
          demoScheduledAt: r.demoScheduledAt || undefined,
          demoMeetingType: r.demoMeetingType || undefined,
          demoNotes: r.demoNotes || undefined,
          customNotes: r.customNotes || undefined,
          submittedAt: r.submittedAt,
          updatedAt: r.updatedAt || undefined,
          sentAt: r.sentAt || undefined,
          agentSource: r.source || 'Nexus Assistant',
        }));
      } catch (e) {
        console.warn('DuckDB getOutreachLeads error:', e);
      }
    }
    return memoryStore.outreachQueue || initialCmsData.outreachQueue || [];
  },

  async saveOutreachLead(lead: Partial<OutreachLead>, id?: string): Promise<OutreachLead> {
    const targetId = id || lead.id || `outreach-${Date.now()}`;
    const fullLead: OutreachLead = {
      id: targetId,
      name: lead.name || 'Anonymous Prospect',
      email: lead.email || 'lead@company.com',
      solutionOfInterest: lead.solutionOfInterest || '9xen Platform Suite',
      intentScore: lead.intentScore || 'High',
      intentReason: lead.intentReason || 'Inquiry generated via AI Sales Assistant',
      suggestedSubject: lead.suggestedSubject || 'Re: 9xen Enterprise Solution Trial',
      suggestedDraftResponse: lead.suggestedDraftResponse || '',
      status: lead.status || 'Pending Review',
      submittedAt: lead.submittedAt || new Date().toISOString(),
      agentSource: lead.agentSource || (lead as any).source || 'Nexus Assistant',
      ...lead,
      updatedAt: new Date().toISOString(),
    };

    if (!memoryStore.outreachQueue) memoryStore.outreachQueue = [];
    const idx = memoryStore.outreachQueue.findIndex((l) => l.id === targetId);
    if (idx !== -1) memoryStore.outreachQueue[idx] = fullLead;
    else memoryStore.outreachQueue.unshift(fullLead);

    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM outreach_leads WHERE id = ${escapeStr(targetId)}`);
        await conn.run(`INSERT INTO outreach_leads (
          id, leadId, name, email, company, solutionOfInterest, intentScore, classificationTag, confidenceScore,
          buyingSignals, classificationReason, suggestedAction, sentiment, intentReason, aumOrBudget, userMessage,
          suggestedSubject, suggestedDraftResponse, status, stage, demoScheduledAt, demoMeetingType, demoNotes,
          customNotes, submittedAt, updatedAt, sentAt, source, inquiryType
        ) VALUES (
          ${escapeStr(fullLead.id)}, ${escapeStr(fullLead.leadId || null)}, ${escapeStr(fullLead.name)}, ${escapeStr(fullLead.email)},
          ${escapeStr(fullLead.company || null)}, ${escapeStr(fullLead.solutionOfInterest)}, ${escapeStr(fullLead.intentScore)},
          ${escapeStr(fullLead.classificationTag || null)}, ${escapeNum(fullLead.confidenceScore || null)},
          ${escapeJson(fullLead.buyingSignals || [])}, ${escapeStr(fullLead.classificationReason || null)},
          ${escapeStr(fullLead.suggestedAction || null)}, ${escapeJson(fullLead.sentiment || null)},
          ${escapeStr(fullLead.intentReason)}, ${escapeStr(fullLead.aumOrBudget || null)},
          ${escapeStr(fullLead.userMessage || null)}, ${escapeStr(fullLead.suggestedSubject)},
          ${escapeStr(fullLead.suggestedDraftResponse)}, ${escapeStr(fullLead.status)},
          ${escapeStr(fullLead.stage || null)}, ${escapeStr(fullLead.demoScheduledAt || null)},
          ${escapeStr(fullLead.demoMeetingType || null)}, ${escapeStr(fullLead.demoNotes || null)},
          ${escapeStr(fullLead.customNotes || null)}, ${escapeStr(fullLead.submittedAt)},
          ${escapeStr(fullLead.updatedAt || null)}, ${escapeStr(fullLead.sentAt || null)},
          ${escapeStr(fullLead.agentSource || 'Nexus Assistant')}, ${escapeStr((fullLead as any).inquiryType || 'enterprise_inquiry')}
        )`);
      } catch (e) {
        console.warn('DuckDB saveOutreachLead error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return fullLead;
  },

  async deleteOutreachLead(id: string): Promise<boolean> {
    if (memoryStore.outreachQueue) memoryStore.outreachQueue = memoryStore.outreachQueue.filter((l) => l.id !== id);
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM outreach_leads WHERE id = ${escapeStr(id)}`);
      } catch (e) {
        console.warn('DuckDB deleteOutreachLead error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return true;
  },

  // --- Calendar ---
  async getBookings(): Promise<any[]> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT * FROM calendar_bookings ORDER BY createdAt DESC`);
        const rows = reader.getRowObjects();
        if (rows && rows.length > 0) return rows;
      } catch (e) {
        console.warn('DuckDB getBookings error:', e);
      }
    }
    return getLocalBookings();
  },

  async bookSlot(booking: { name: string; email: string; company: string; date: string; slot: string; meetingType: string; topic: string }): Promise<boolean> {
    const id = `book-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const newRecord = {
      id,
      ...booking,
      status: 'confirmed',
      createdAt,
    };

    // 1. Save to local JSON store first
    const local = getLocalBookings();
    local.unshift(newRecord);
    saveLocalBookings(local);

    // 2. Insert into DuckDB if available
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`INSERT INTO calendar_bookings (id, name, email, company, date, slot, meetingType, topic, status, createdAt) 
          VALUES (
            ${escapeStr(id)},
            ${escapeStr(booking.name)},
            ${escapeStr(booking.email)},
            ${escapeStr(booking.company)},
            ${escapeStr(booking.date)},
            ${escapeStr(booking.slot)},
            ${escapeStr(booking.meetingType)},
            ${escapeStr(booking.topic)},
            'confirmed',
            ${escapeStr(createdAt)}
          )`);
      } catch (e) {
        console.warn('DuckDB bookSlot error:', e);
      }
    }
    return true;
  },

  async isSlotBooked(date: string, slot: string): Promise<boolean> {
    // 1. Check local JSON store
    const local = getLocalBookings();
    const bookedLocally = local.some((b) => b.date === date && b.slot === slot && b.status !== 'cancelled');
    if (bookedLocally) return true;

    // 2. Check DuckDB
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT COUNT(*) as count FROM calendar_bookings WHERE date = ${escapeStr(date)} AND slot = ${escapeStr(slot)} AND status != 'cancelled'`);
        const row = reader.getRowObjects()[0];
        return Number(row?.count || 0) > 0;
      } catch (e) {
        console.warn('DuckDB isSlotBooked error:', e);
      }
    }
    return false;
  },

  // --- Outreach Templates ---
  async getOutreachTemplates(): Promise<OutreachTemplate[]> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT * FROM outreach_templates ORDER BY updatedAt DESC`);
        const rows = reader.getRowObjects();
        return rows.map((r: any) => ({
          id: r.id,
          name: r.name,
          category: r.category as any,
          targetSolutionKeywords: JSON.parse(r.targetSolutionKeywords),
          subjectTemplate: r.subjectTemplate,
          bodyTemplate: r.bodyTemplate,
          systemPromptInstructions: r.systemPromptInstructions,
          isDefault: Boolean(r.isDefault),
          updatedAt: r.updatedAt,
        }));
      } catch (e) {
        console.warn('DuckDB getOutreachTemplates error:', e);
      }
    }
    return memoryStore.outreachTemplates || initialCmsData.outreachTemplates || [];
  },

  async saveOutreachTemplate(template: Partial<OutreachTemplate>, id?: string): Promise<OutreachTemplate> {
    const targetId = id || template.id || `template-${Date.now()}`;
    const fullTemplate: OutreachTemplate = {
      id: targetId,
      name: template.name || 'New Template',
      category: template.category || 'High Intent',
      targetSolutionKeywords: template.targetSolutionKeywords || [],
      subjectTemplate: template.subjectTemplate || '',
      bodyTemplate: template.bodyTemplate || '',
      systemPromptInstructions: template.systemPromptInstructions || '',
      isDefault: template.isDefault || false,
      updatedAt: new Date().toISOString(),
      ...template,
    };

    if (!memoryStore.outreachTemplates) memoryStore.outreachTemplates = [];
    const idx = memoryStore.outreachTemplates.findIndex((t) => t.id === targetId);
    if (idx !== -1) memoryStore.outreachTemplates[idx] = fullTemplate;
    else memoryStore.outreachTemplates.push(fullTemplate);

    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM outreach_templates WHERE id = ${escapeStr(targetId)}`);
        await conn.run(`INSERT INTO outreach_templates (id, name, category, targetSolutionKeywords, subjectTemplate, bodyTemplate, systemPromptInstructions, isDefault, updatedAt)
          VALUES (
            ${escapeStr(fullTemplate.id)},
            ${escapeStr(fullTemplate.name)},
            ${escapeStr(fullTemplate.category)},
            ${escapeJson(fullTemplate.targetSolutionKeywords)},
            ${escapeStr(fullTemplate.subjectTemplate)},
            ${escapeStr(fullTemplate.bodyTemplate)},
            ${escapeStr(fullTemplate.systemPromptInstructions)},
            ${escapeBool(fullTemplate.isDefault)},
            ${escapeStr(fullTemplate.updatedAt)}
          )`);
      } catch (e) {
        console.warn('DuckDB saveOutreachTemplate error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return fullTemplate;
  },

  async deleteOutreachTemplate(id: string): Promise<boolean> {
    if (memoryStore.outreachTemplates) memoryStore.outreachTemplates = memoryStore.outreachTemplates.filter((t) => t.id !== id);
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM outreach_templates WHERE id = ${escapeStr(id)}`);
      } catch (e) {
        console.warn('DuckDB deleteOutreachTemplate error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return true;
  },

  // --- Activity Logs ---
  async getActivityLogs(): Promise<ActivityLog[]> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT * FROM activity_logs ORDER BY timestamp DESC`);
        const rows = reader.getRowObjects();
        return rows.map((r: any) => ({
          id: r.id,
          action: r.action,
          target: r.target,
          targetId: r.targetId,
          performedBy: r.performedBy,
          timestamp: r.timestamp,
        }));
      } catch (e) {
        console.warn('DuckDB getActivityLogs error:', e);
      }
    }
    return [];
  },

  async createActivityLog(action: string, target: string, targetId: string, performedBy: string): Promise<void> {
    const id = `log-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`INSERT INTO activity_logs (id, action, target, targetId, performedBy, timestamp)
          VALUES (${escapeStr(id)}, ${escapeStr(action)}, ${escapeStr(target)}, ${escapeStr(targetId)}, ${escapeStr(performedBy)}, ${escapeStr(timestamp)})`);
      } catch (e) {
        console.warn('DuckDB createActivityLog error:', e);
      }
    }
  },

  // --- Audit Logs ---
  async getAuditLogs(): Promise<Array<{ id: string; action: string; user: string; timestamp: string }>> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 200`);
        const rows = reader.getRowObjects();
        return rows.map((r: any) => ({
          id: r.id,
          action: r.action,
          user: r.user,
          timestamp: r.timestamp,
        }));
      } catch (e) {
        console.warn('DuckDB getAuditLogs error:', e);
      }
    }
    return [];
  },

  async createAuditLog(action: string, user: string): Promise<void> {
    const id = `log-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`INSERT INTO audit_logs (id, action, user, timestamp)
          VALUES (${escapeStr(id)}, ${escapeStr(action)}, ${escapeStr(user)}, ${escapeStr(timestamp)})`);
      } catch (e) {
        console.warn('DuckDB createAuditLog error:', e);
      }
    }
    await syncToLocalJsonBackup();
  },

  async getTranslation(sourceText: string, targetLanguage: string): Promise<string | null> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT translatedText FROM translations_cache WHERE sourceText = ${escapeStr(sourceText)} AND targetLanguage = ${escapeStr(targetLanguage)}`);
        const row = reader.getRowObjects()[0];
        return row ? row.translatedText : null;
      } catch (e) {
        console.warn('DuckDB getTranslation error:', e);
      }
    }
    return null;
  },

  async saveTranslation(sourceText: string, targetLanguage: string, translatedText: string): Promise<void> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const id = `tr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const createdAt = new Date().toISOString();
        await conn.run(`INSERT OR REPLACE INTO translations_cache (id, sourceText, targetLanguage, translatedText, createdAt)
          VALUES (${escapeStr(id)}, ${escapeStr(sourceText)}, ${escapeStr(targetLanguage)}, ${escapeStr(translatedText)}, ${escapeStr(createdAt)})`);
      } catch (e) {
        console.warn('DuckDB saveTranslation error:', e);
      }
    }
  },

  // --- Full CMS Payload ---
  async getFullCms(): Promise<CmsDatabase> {
    const [
      hero,
      services,
      products,
      platforms,
      models,
      team,
      testimonials,
      blogPosts,
      caseStudies,
      careers,
      contactSubmissions,
      settings,
      footerPages,
      cloudCredits,
      outreachQueue,
      outreachTemplates,
      webhookConfigs,
      newsletterSubscribers,
      chatSessions,
      admins,
      media,
      auditLogs
    ] = await Promise.all([
      this.getHero(),
      this.getServices(),
      this.getProducts(),
      this.getPlatforms(),
      this.getModels(),
      this.getTeamMembers(),
      this.getTestimonials(),
      this.getBlogPosts(),
      this.getCaseStudies(),
      this.getCareers(),
      this.getContactSubmissions(),
      this.getSiteSettings(),
      this.getFooterPages(),
      this.getCloudCredits(),
      this.getOutreachLeads(),
      this.getOutreachTemplates(),
      this.getWebhookConfigs(),
      this.getNewsletterSubscribers(),
      this.getChatSessions(),
      this.getAdmins(),
      this.getMedia(),
      this.getAuditLogs(),
    ]);
    let popupBanner = memoryStore.popupBanner || initialCmsData.popupBanner;
    let aboutUs = memoryStore.aboutUs || initialCmsData.aboutUs;
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const pbReader = await conn.runAndReadAll(`SELECT data FROM popup_banner WHERE id = 'default'`);
        const pbRow = pbReader.getRowObjects()[0];
        if (pbRow && pbRow.data) popupBanner = JSON.parse(pbRow.data);
        const auReader = await conn.runAndReadAll(`SELECT data FROM about_us WHERE id = 'default'`);
        const auRow = auReader.getRowObjects()[0];
        if (auRow && auRow.data) aboutUs = JSON.parse(auRow.data);
      } catch (e) {}
    }
    return {
      hero,
      services,
      products,
      platforms,
      models,
      team,
      testimonials,
      blogPosts,
      caseStudies,
      careers,
      contactSubmissions,
      settings,
      footerPages,
      cloudCredits,
      outreachQueue,
      outreachTemplates,
      webhookConfigs,
      newsletterSubscribers,
      popupBanner,
      aboutUs,
      chatSessions,
      admins,
      media,
      auditLogs,
    };
  },

  // --- AI Telemetry Logs ---
  async saveTelemetryLog(log: {
    id?: string;
    timestamp?: string;
    model: string;
    userMessage: string;
    tokensEstimated: number;
    latencyMs: number;
    status: 'success' | 'fallback';
  }) {
    const id = log.id || `log-${Date.now()}`;
    const timestamp = log.timestamp || new Date().toISOString();
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`INSERT INTO ai_telemetry_logs (id, timestamp, model, userMessage, tokensEstimated, latencyMs, status)
          VALUES (
            ${escapeStr(id)},
            ${escapeStr(timestamp)},
            ${escapeStr(log.model)},
            ${escapeStr(log.userMessage)},
            ${escapeNum(log.tokensEstimated)},
            ${escapeNum(log.latencyMs)},
            ${escapeStr(log.status)}
          )`);
      } catch (e) {
        console.warn('DuckDB saveTelemetryLog error:', e);
      }
    }
    return { id, timestamp, ...log };
  },

  async getTelemetryLogs(limit: number = 50) {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT * FROM ai_telemetry_logs ORDER BY timestamp DESC LIMIT ${limit}`);
        const rows = reader.getRowObjects();
        return rows.map((r: any) => ({
          id: r.id,
          timestamp: r.timestamp,
          model: r.model,
          userMessage: r.userMessage,
          tokensEstimated: Number(r.tokensEstimated || 0),
          latencyMs: Number(r.latencyMs || 0),
          status: r.status as 'success' | 'fallback',
        }));
      } catch (e) {
        console.warn('DuckDB getTelemetryLogs error:', e);
      }
    }
    return [];
  },

  // --- Database Stats & Raw SQL Query Execution ---
  async generateAllTablesAndSchemas() {
    const conn = await getDuckConnection();
    if (!conn) {
      throw new Error('Database connection unavailable.');
    }
    await initializeTables(conn);
    return await this.getDatabaseStats();
  },

  async getDatabaseStats() {
    const conn = await getDuckConnection();
    const stats: Record<string, number> = {};
    const tables = [
      'site_settings',
      'hero_content',
      'about_us',
      'popup_banner',
      'services',
      'products',
      'platforms',
      'team_members',
      'testimonials',
      'blog_posts',
      'case_studies',
      'careers',
      'contact_submissions',
      'footer_pages',
      'content_versions',
      'cloud_credits',
      'newsletter_subscribers',
      'activity_logs',
      'audit_logs',
      'translations_cache',
      'ai_telemetry_logs',
      'outreach_leads',
      'outreach_templates',
      'webhook_configs',
      'admins',
      'chat_sessions',
      'calendar_bookings',
      'media',
    ];

    if (conn) {
      for (const table of tables) {
        try {
          const reader = await conn.runAndReadAll(`SELECT COUNT(*) as cnt FROM ${table}`);
          const count = reader.getRowObjects()[0]?.cnt;
          stats[table] = Number(count || 0);
        } catch {
          stats[table] = 0;
        }
      }
    }

    return {
      connected: !!conn,
      engine: 'DuckDB 1.2+ Columnar OLAP Engine',
      databaseFile: 'cms.db',
      syncBackupFile: 'cmsData.json',
      tableCounts: stats,
      totalTables: tables.length,
      lastChecked: new Date().toISOString(),
    };
  },

  // --- Newsletter ---
  async getNewsletterSubscribers(): Promise<string[]> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT email FROM newsletter_subscribers WHERE subscribed = true`);
        return reader.getRowObjects().map((r: any) => r.email);
      } catch (e) {
        console.warn('DuckDB getNewsletterSubscribers error:', e);
      }
    }
    return memoryStore.newsletterSubscribers || [];
  },

  async deleteNewsletterSubscriber(email: string): Promise<boolean> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM newsletter_subscribers WHERE email = ${escapeStr(email)}`);
      } catch (e) {
        console.warn('DuckDB deleteNewsletterSubscriber error:', e);
      }
    }
    memoryStore.newsletterSubscribers = (memoryStore.newsletterSubscribers || []).filter(e => e !== email);
    await syncToLocalJsonBackup();
    return true;
  },

  async subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    const id = `sub-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`INSERT INTO newsletter_subscribers (id, email, subscribed, createdAt) VALUES (${escapeStr(id)}, ${escapeStr(email)}, true, ${escapeStr(createdAt)})`);
      } catch (e) {
        console.warn('DuckDB subscribeNewsletter error:', e);
        return { success: false, message: 'Database error' };
      }
    }
    if (!memoryStore.newsletterSubscribers) memoryStore.newsletterSubscribers = [];
    if (!memoryStore.newsletterSubscribers.includes(email)) {
      memoryStore.newsletterSubscribers.push(email);
    }
    await syncToLocalJsonBackup();
    return { success: true, message: 'Subscribed' };
  },

  // --- Webhooks ---
  async getWebhookConfigs(): Promise<WebhookConfig[]> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT * FROM webhook_configs`);
        return reader.getRowObjects().map((r: any) => ({
          ...r,
          isActive: Boolean(r.isActive),
        }));
      } catch (e) {
        console.warn('DuckDB getWebhookConfigs error:', e);
      }
    }
    return memoryStore.webhookConfigs || [];
  },

  async saveWebhookConfig(config: Partial<WebhookConfig>, id?: string): Promise<WebhookConfig> {
    const targetId = id || config.id || `wh-${Date.now()}`;
    const fullConfig: WebhookConfig = {
      id: targetId,
      name: config.name || 'New Webhook',
      url: config.url || '',
      isActive: config.isActive !== undefined ? config.isActive : true,
      type: (config.type as any) || 'custom',
      description: config.description || '',
      secretToken: config.secretToken || '',
      customHeaders: config.customHeaders || '',
      lastTestedAt: config.lastTestedAt || undefined,
      lastTestStatus: config.lastTestStatus || undefined,
      lastStatusCode: config.lastStatusCode !== undefined ? config.lastStatusCode : undefined,
      lastLatencyMs: config.lastLatencyMs !== undefined ? config.lastLatencyMs : undefined,
      updatedAt: new Date().toISOString(),
    };

    if (!memoryStore.webhookConfigs) memoryStore.webhookConfigs = [];
    const idx = memoryStore.webhookConfigs.findIndex((w) => w.id === targetId);
    if (idx !== -1) memoryStore.webhookConfigs[idx] = fullConfig;
    else memoryStore.webhookConfigs.push(fullConfig);

    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM webhook_configs WHERE id = ${escapeStr(targetId)}`);
        // Try inserting with all extended columns
        try {
          await conn.run(`INSERT INTO webhook_configs (id, name, url, isActive, type, description, secretToken, customHeaders, lastTestedAt, lastTestStatus, lastStatusCode, lastLatencyMs, updatedAt)
            VALUES (
              ${escapeStr(fullConfig.id)},
              ${escapeStr(fullConfig.name)},
              ${escapeStr(fullConfig.url)},
              ${escapeBool(fullConfig.isActive)},
              ${escapeStr(fullConfig.type)},
              ${escapeStr(fullConfig.description || null)},
              ${escapeStr(fullConfig.secretToken || null)},
              ${escapeStr(fullConfig.customHeaders || null)},
              ${escapeStr(fullConfig.lastTestedAt || null)},
              ${escapeStr(fullConfig.lastTestStatus || null)},
              ${fullConfig.lastStatusCode !== undefined ? fullConfig.lastStatusCode : 'NULL'},
              ${fullConfig.lastLatencyMs !== undefined ? fullConfig.lastLatencyMs : 'NULL'},
              ${escapeStr(fullConfig.updatedAt)}
            )`);
        } catch {
          // Fallback if extended columns are not present in DuckDB schema
          await conn.run(`INSERT INTO webhook_configs (id, name, url, isActive, type, updatedAt)
            VALUES (
              ${escapeStr(fullConfig.id)},
              ${escapeStr(fullConfig.name)},
              ${escapeStr(fullConfig.url)},
              ${escapeBool(fullConfig.isActive)},
              ${escapeStr(fullConfig.type)},
              ${escapeStr(fullConfig.updatedAt)}
            )`);
        }
      } catch (e) {
        console.warn('DuckDB saveWebhookConfig error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return fullConfig;
  },

  async deleteWebhookConfig(id: string): Promise<boolean> {
    if (memoryStore.webhookConfigs) memoryStore.webhookConfigs = memoryStore.webhookConfigs.filter((w) => w.id !== id);
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM webhook_configs WHERE id = ${escapeStr(id)}`);
      } catch (e) {
        console.warn('DuckDB deleteWebhookConfig error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return true;
  },

  // --- Admins ---
  async getAdmins(): Promise<AdminUser[]> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT * FROM admins`);
        return reader.getRowObjects();
      } catch (e) {
        console.warn('DuckDB getAdmins error:', e);
      }
    }
    return memoryStore.admins || [];
  },

  async saveAdmin(admin: Partial<AdminUser>, id?: string): Promise<AdminUser> {
    const targetId = id || admin.id || `admin-${Date.now()}`;
    const fullAdmin: AdminUser = {
      id: targetId,
      name: admin.name || 'Admin',
      email: admin.email || '',
      role: admin.role || 'viewer',
      lastLogin: admin.lastLogin || new Date().toISOString(),
      ...admin,
    };

    if (!memoryStore.admins) memoryStore.admins = [];
    const idx = memoryStore.admins.findIndex((a) => a.id === targetId);
    if (idx !== -1) memoryStore.admins[idx] = fullAdmin;
    else memoryStore.admins.push(fullAdmin);

    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM admins WHERE id = ${escapeStr(targetId)}`);
        await conn.run(`INSERT INTO admins (id, name, email, role, lastLogin) VALUES (
          ${escapeStr(fullAdmin.id)},
          ${escapeStr(fullAdmin.name)},
          ${escapeStr(fullAdmin.email)},
          ${escapeStr(fullAdmin.role)},
          ${escapeStr(fullAdmin.lastLogin)}
        )`);
      } catch (e) {
        console.warn('DuckDB saveAdmin error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return fullAdmin;
  },

  async deleteAdmin(id: string): Promise<boolean> {
    if (memoryStore.admins) memoryStore.admins = memoryStore.admins.filter((a) => a.id !== id);
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM admins WHERE id = ${escapeStr(id)}`);
      } catch (e) {
        console.warn('DuckDB deleteAdmin error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return true;
  },

  // --- Chat Sessions ---
  async getChatSessions(): Promise<ChatSession[]> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT * FROM chat_sessions ORDER BY isPinned DESC, updatedAt DESC`);
        return reader.getRowObjects().map((r: any) => ({
          ...r,
          messages: JSON.parse(r.messages || '[]'),
          updatedAt: Number(r.updatedAt),
          isPinned: !!r.isPinned,
          userContext: r.userContext ? JSON.parse(r.userContext) : undefined,
        }));
      } catch (e) {
        console.warn('DuckDB getChatSessions error:', e);
      }
    }
    return memoryStore.chatSessions || [];
  },

  async saveChatSession(session: Partial<ChatSession>, id?: string): Promise<ChatSession> {
    const targetId = id || session.id || `session-${Date.now()}`;
    const fullSession: ChatSession = {
      id: targetId,
      title: session.title || 'New Conversation',
      messages: session.messages || [],
      updatedAt: session.updatedAt || Date.now(),
      model: session.model || '9xen-omni-2.5',
      persona: session.persona || 'standard',
      isPinned: session.isPinned || false,
      userContext: session.userContext,
      ...session,
    };

    if (!memoryStore.chatSessions) memoryStore.chatSessions = [];
    const idx = memoryStore.chatSessions.findIndex((s) => s.id === targetId);
    if (idx !== -1) memoryStore.chatSessions[idx] = fullSession;
    else memoryStore.chatSessions.unshift(fullSession);

    // Re-sort memory store: pinned first, then by updatedAt
    memoryStore.chatSessions.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });

    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`INSERT INTO chat_sessions (id, title, model, persona, updatedAt, messages, isPinned, userContext) VALUES (
          ${escapeStr(fullSession.id)},
          ${escapeStr(fullSession.title)},
          ${escapeStr(fullSession.model)},
          ${escapeStr(fullSession.persona)},
          ${escapeNum(fullSession.updatedAt)},
          ${escapeJson(fullSession.messages)},
          ${escapeBool(fullSession.isPinned)},
          ${escapeJson(fullSession.userContext)}
        ) ON CONFLICT (id) DO UPDATE SET
          title = excluded.title,
          model = excluded.model,
          persona = excluded.persona,
          updatedAt = excluded.updatedAt,
          messages = excluded.messages,
          isPinned = excluded.isPinned,
          userContext = excluded.userContext
        `);
      } catch (e) {
        console.warn('DuckDB saveChatSession error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return fullSession;
  },

  async deleteChatSession(id: string): Promise<boolean> {
    if (memoryStore.chatSessions) memoryStore.chatSessions = memoryStore.chatSessions.filter((s) => s.id !== id);
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM chat_sessions WHERE id = ${escapeStr(id)}`);
      } catch (e) {
        console.warn('DuckDB deleteChatSession error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return true;
  },

  // --- Media ---
  async getMedia(): Promise<any[]> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(`SELECT * FROM media ORDER BY createdAt DESC`);
        return reader.getRowObjects();
      } catch (e) {
        console.warn('DuckDB getMedia error:', e);
      }
    }
    return memoryStore.media || [];
  },

  async saveMedia(item: any): Promise<any> {
    const targetId = item.id || `media-${Date.now()}`;
    const fullItem = {
      id: targetId,
      url: item.url || '',
      filename: item.filename || 'file',
      mimeType: item.mimeType || 'application/octet-stream',
      size: item.size || 0,
      createdAt: item.createdAt || new Date().toISOString(),
      ...item,
    };

    if (!memoryStore.media) memoryStore.media = [];
    const idx = memoryStore.media.findIndex((m) => m.id === targetId);
    if (idx !== -1) memoryStore.media[idx] = fullItem;
    else memoryStore.media.unshift(fullItem);

    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM media WHERE id = ${escapeStr(targetId)}`);
        await conn.run(`INSERT INTO media (id, url, filename, mimeType, size, createdAt) VALUES (
          ${escapeStr(fullItem.id)},
          ${escapeStr(fullItem.url)},
          ${escapeStr(fullItem.filename)},
          ${escapeStr(fullItem.mimeType)},
          ${escapeNum(fullItem.size)},
          ${escapeStr(fullItem.createdAt)}
        )`);
      } catch (e) {
        console.warn('DuckDB saveMedia error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return fullItem;
  },

  async deleteMedia(id: string): Promise<boolean> {
    if (memoryStore.media) memoryStore.media = memoryStore.media.filter((m) => m.id !== id);
    const conn = await getDuckConnection();
    if (conn) {
      try {
        await conn.run(`DELETE FROM media WHERE id = ${escapeStr(id)}`);
      } catch (e) {
        console.warn('DuckDB deleteMedia error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return true;
  },

  async executeRawQuery(sql: string): Promise<{
    success: boolean;
    columns: string[];
    rows: any[];
    rowCount: number;
    executionTimeMs: number;
    error?: string;
  }> {
    const startTime = Date.now();
    const conn = await getDuckConnection();
    if (!conn) {
      return {
        success: false,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: 0,
        error: 'Database connection unavailable.',
      };
    }

    const lower = sql.trim().toLowerCase();
    if (lower.startsWith('drop database') || lower.startsWith('shutdown')) {
      return {
        success: false,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: 0,
        error: 'Dangerous SQL operation rejected by 9xen Security Kernel.',
      };
    }

    try {
      const reader = await conn.runAndReadAll(sql);
      const rows = reader.getRowObjects();
      const executionTimeMs = Date.now() - startTime;
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

      return {
        success: true,
        columns,
        rows,
        rowCount: rows.length,
        executionTimeMs,
      };
    } catch (err: any) {
      return {
        success: false,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: Date.now() - startTime,
        error: err.message || String(err),
      };
    }
  },

  // --- Content Versions & Rollback ---
  async createContentVersion(
    contentType: string,
    contentId: string,
    title: string,
    data: any,
    changeSummary: string = 'Content saved',
    createdByName: string = 'Editor Admin',
    createdByEmail: string = 'admin@9xenai.com'
  ): Promise<ContentVersion> {
    const conn = await getDuckConnection();
    let nextVersion = 1;

    if (!memoryStore.contentVersions) memoryStore.contentVersions = [];
    const existingMemory = memoryStore.contentVersions.filter(
      (v) => v.contentType === contentType && v.contentId === contentId
    );
    if (existingMemory.length > 0) {
      const maxVer = Math.max(...existingMemory.map((v) => v.version || 0));
      nextVersion = maxVer + 1;
    }

    if (conn) {
      try {
        const reader = await conn.runAndReadAll(
          `SELECT COALESCE(MAX(version), 0) AS max_ver FROM content_versions WHERE contentType = ${escapeStr(contentType)} AND contentId = ${escapeStr(contentId)}`
        );
        const rows = reader.getRowObjects();
        if (rows && rows.length > 0 && rows[0].max_ver !== undefined) {
          nextVersion = Number(rows[0].max_ver) + 1;
        }
      } catch (e) {
        console.warn('DuckDB max version check error:', e);
      }
    }

    const versionObj: ContentVersion = {
      id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      contentType,
      contentId,
      version: nextVersion,
      title: title || `${contentType} Version ${nextVersion}`,
      data: typeof data === 'string' ? JSON.parse(data) : data,
      changeSummary,
      createdByName,
      createdByEmail,
      createdAt: new Date().toISOString(),
    };

    memoryStore.contentVersions.unshift(versionObj);

    if (conn) {
      try {
        await conn.run(`INSERT INTO content_versions (id, contentType, contentId, version, title, data, changeSummary, createdByName, createdByEmail, createdAt) VALUES (
          ${escapeStr(versionObj.id)},
          ${escapeStr(versionObj.contentType)},
          ${escapeStr(versionObj.contentId)},
          ${escapeNum(versionObj.version)},
          ${escapeStr(versionObj.title)},
          ${escapeJson(versionObj.data)},
          ${escapeStr(versionObj.changeSummary)},
          ${escapeStr(versionObj.createdByName)},
          ${escapeStr(versionObj.createdByEmail)},
          ${escapeStr(versionObj.createdAt)}
        )`);
      } catch (e) {
        console.warn('DuckDB createContentVersion error:', e);
      }
    }
    await syncToLocalJsonBackup();
    return versionObj;
  },

  async getContentVersions(contentType: string, contentId: string): Promise<ContentVersion[]> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(
          `SELECT * FROM content_versions WHERE contentType = ${escapeStr(contentType)} AND contentId = ${escapeStr(contentId)} ORDER BY version DESC`
        );
        const rows = reader.getRowObjects();
        if (rows && rows.length > 0) {
          return rows.map((r: any) => ({
            id: r.id,
            contentType: r.contentType,
            contentId: r.contentId,
            version: Number(r.version),
            title: r.title,
            data: typeof r.data === 'string' ? JSON.parse(r.data) : r.data,
            changeSummary: r.changeSummary,
            createdByName: r.createdByName,
            createdByEmail: r.createdByEmail,
            createdAt: r.createdAt,
          }));
        }
      } catch (e) {
        console.warn('DuckDB getContentVersions error:', e);
      }
    }
    return (memoryStore.contentVersions || [])
      .filter((v) => v.contentType === contentType && v.contentId === contentId)
      .sort((a, b) => b.version - a.version);
  },

  async getContentVersionById(id: string): Promise<ContentVersion | null> {
    const conn = await getDuckConnection();
    if (conn) {
      try {
        const reader = await conn.runAndReadAll(
          `SELECT * FROM content_versions WHERE id = ${escapeStr(id)} LIMIT 1`
        );
        const rows = reader.getRowObjects();
        if (rows && rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            contentType: r.contentType,
            contentId: r.contentId,
            version: Number(r.version),
            title: r.title,
            data: typeof r.data === 'string' ? JSON.parse(r.data) : r.data,
            changeSummary: r.changeSummary,
            createdByName: r.createdByName,
            createdByEmail: r.createdByEmail,
            createdAt: r.createdAt,
          };
        }
      } catch (e) {
        console.warn('DuckDB getContentVersionById error:', e);
      }
    }
    const mem = (memoryStore.contentVersions || []).find((v) => v.id === id);
    return mem || null;
  },

  async rollbackContentVersion(
    versionId: string,
    createdByName: string = 'Editor Admin'
  ): Promise<{ success: boolean; item?: any; newVersion?: ContentVersion; error?: string }> {
    const versionRecord = await this.getContentVersionById(versionId);
    if (!versionRecord) {
      return { success: false, error: 'Target version history entry not found.' };
    }

    const { contentType, contentId, data, version } = versionRecord;
    const itemData = typeof data === 'string' ? JSON.parse(data) : data;
    let restoredItem: any = null;

    if (contentType === 'blog' || contentType === 'blog_post') {
      restoredItem = await this.saveBlogPost(itemData, contentId, true);
    } else if (contentType === 'footer_page') {
      restoredItem = await this.saveFooterPage(itemData, contentId, true);
    } else if (contentType === 'hero') {
      restoredItem = await this.updateHero(itemData, true);
    } else if (contentType === 'service') {
      restoredItem = await this.saveService(itemData, contentId, true);
    } else if (contentType === 'product') {
      restoredItem = await this.saveProduct(itemData, contentId, true);
    } else if (contentType === 'platform') {
      restoredItem = await this.savePlatform(itemData, contentId, true);
    } else if (contentType === 'case_study') {
      restoredItem = await this.saveCaseStudy(itemData, contentId, true);
    } else if (contentType === 'settings') {
      restoredItem = await this.saveSiteSettings(itemData, true);
    } else {
      return { success: false, error: `Unsupported contentType for rollback: ${contentType}` };
    }

    const newVersion = await this.createContentVersion(
      contentType,
      contentId,
      versionRecord.title,
      itemData,
      `Rolled back content to Version #${version}`,
      createdByName
    );

    return { success: true, item: restoredItem, newVersion };
  },
};

/**
 * Database dispatch — the built-in CMS database is redesigned to run on
 * PostgreSQL (Supabase) when DATABASE_URL is configured. Otherwise the local
 * DuckDB/file engine is used. Both expose an identical method surface.
 */
export const db: typeof duckDb = isPostgresEnabled() ? (dbPostgres as unknown as typeof duckDb) : duckDb;
