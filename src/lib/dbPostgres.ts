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
  ContentVersion,
} from '../types/cms';
import { initialCmsData } from '../data/initialCmsData';
import { rows, one, query, migratePostgresSchema } from './postgres';

/**
 * 9xen Enterprise Platform — PostgreSQL / Supabase CMS database.
 *
 * Drop-in replacement for the DuckDB-backed `db` object with an identical
 * method surface, so the API router and admin portal work unchanged.
 * All queries are parameterized (pg $1..$n) — no string interpolation.
 */

const J = (v: any) => (v === null || v === undefined ? null : JSON.stringify(v));

async function ensureReady(): Promise<void> {
  await migratePostgresSchema();
}

// ---------------------------------------------------------------------------
// Document-style tables
// ---------------------------------------------------------------------------

async function getDoc<T>(table: string, fallback: T): Promise<T> {
  await ensureReady();
  const r = await one<{ data: T }>(`SELECT data FROM ${table} WHERE id = 'default' LIMIT 1`);
  return r?.data ?? fallback;
}

async function setDoc(table: string, data: any): Promise<void> {
  await ensureReady();
  await query(
    `INSERT INTO ${table} (id, data, updated_at) VALUES ('default', $1::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
    [J(data)]
  );
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

async function getHero(): Promise<HeroContent> {
  return getDoc<HeroContent>('hero_content', initialCmsData.hero);
}

async function updateHero(data: HeroContent, skipVersionHistory = false): Promise<HeroContent> {
  await setDoc('hero_content', data);
  if (!skipVersionHistory) {
    await createContentVersion('hero', 'default', data.headline || 'Hero Banner Section', data, 'Hero section updated');
  }
  return data;
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

async function getServices(): Promise<ServiceItem[]> {
  await ensureReady();
  const rs = await rows<any>(
    `SELECT * FROM services WHERE is_deleted = FALSE ORDER BY order_num ASC`
  );
  if (rs.length === 0) return initialCmsData.services;
  return rs.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    shortDescription: r.short_description,
    fullDescription: r.full_description,
    iconName: r.icon_name,
    features: r.features ?? [],
    order: r.order_num,
    highlighted: Boolean(r.highlighted),
  }));
}

async function saveService(service: Partial<ServiceItem>, id?: string): Promise<ServiceItem> {
  const targetId = id || service.id || `srv-${Date.now()}`;
  const full: ServiceItem = {
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
  await ensureReady();
  await query(
    `INSERT INTO services (id, title, category, short_description, full_description, icon_name, features, order_num, highlighted, is_deleted)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,FALSE)
     ON CONFLICT (id) DO UPDATE SET title=$2, category=$3, short_description=$4, full_description=$5,
       icon_name=$6, features=$7::jsonb, order_num=$8, highlighted=$9, is_deleted=FALSE`,
    [full.id, full.title, full.category, full.shortDescription, full.fullDescription, full.iconName, J(full.features), full.order, full.highlighted]
  );
  return full;
}

async function deleteService(id: string): Promise<boolean> {
  await ensureReady();
  await query(`UPDATE services SET is_deleted = TRUE WHERE id = $1`, [id]);
  return true;
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

async function getProducts(): Promise<ProductItem[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM products WHERE is_deleted = FALSE ORDER BY order_num ASC`);
  if (rs.length === 0) return initialCmsData.products;
  return rs.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    category: r.category,
    tagline: r.tagline,
    shortDescription: r.short_description,
    fullDescription: r.full_description,
    iconName: r.icon_name,
    pricingModel: r.pricing_model,
    features: r.features ?? [],
    specs: r.specs ?? [],
    badge: r.badge || undefined,
    demoUrl: r.demo_url || undefined,
    imageUrl: r.image_url || undefined,
    specSheetUrl: r.spec_sheet_url || undefined,
    order: r.order_num,
    highlighted: Boolean(r.highlighted),
  }));
}

async function saveProduct(product: Partial<ProductItem>, id?: string): Promise<ProductItem> {
  const targetId = id || product.id || `prod-${Date.now()}`;
  const full: ProductItem = {
    id: targetId,
    title: product.title || 'New Product',
    slug: product.slug || `prod-${Date.now()}`,
    category: product.category || 'ai_platform',
    tagline: product.tagline || '',
    shortDescription: product.shortDescription || '',
    fullDescription: product.fullDescription || '',
    iconName: product.iconName || 'Cpu',
    pricingModel: product.pricingModel || 'Enterprise License',
    features: product.features || [],
    specs: product.specs || [],
    badge: product.badge || undefined,
    demoUrl: product.demoUrl || undefined,
    imageUrl: product.imageUrl || undefined,
    specSheetUrl: product.specSheetUrl || undefined,
    order: product.order || 1,
    highlighted: product.highlighted || false,
    ...product,
  } as ProductItem;
  await ensureReady();
  await query(
    `INSERT INTO products (id, title, slug, category, tagline, short_description, full_description, icon_name,
        pricing_model, features, specs, badge, demo_url, image_url, spec_sheet_url, order_num, highlighted, is_deleted)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11::jsonb,$12,$13,$14,$15,$16,$17,FALSE)
     ON CONFLICT (id) DO UPDATE SET title=$2, slug=$3, category=$4, tagline=$5, short_description=$6,
       full_description=$7, icon_name=$8, pricing_model=$9, features=$10::jsonb, specs=$11::jsonb, badge=$12,
       demo_url=$13, image_url=$14, spec_sheet_url=$15, order_num=$16, highlighted=$17, is_deleted=FALSE`,
    [full.id, full.title, full.slug, full.category, full.tagline, full.shortDescription, full.fullDescription,
     full.iconName, full.pricingModel, J(full.features), J(full.specs), full.badge, full.demoUrl, full.imageUrl,
     full.specSheetUrl, full.order, full.highlighted]
  );
  return full;
}

async function deleteProduct(id: string): Promise<boolean> {
  await ensureReady();
  await query(`UPDATE products SET is_deleted = TRUE WHERE id = $1`, [id]);
  return true;
}

// ---------------------------------------------------------------------------
// Platforms
// ---------------------------------------------------------------------------

async function getPlatforms(): Promise<PlatformItem[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM platforms WHERE is_deleted = FALSE ORDER BY order_num ASC`);
  if (rs.length === 0) return initialCmsData.platforms;
  return rs.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    tagline: r.tagline,
    category: r.category,
    description: r.description,
    keyFeatures: r.key_features ?? [],
    stats: r.stats ?? [],
    demoUrl: r.demo_url || undefined,
    imageUrl: r.image_url || undefined,
    specSheetUrl: r.spec_sheet_url || undefined,
    badge: r.badge || undefined,
    iconName: r.icon_name,
    order: r.order_num,
  }));
}

async function savePlatform(item: Partial<PlatformItem>, id?: string): Promise<PlatformItem> {
  const targetId = id || item.id || `plat-${Date.now()}`;
  const full: PlatformItem = {
    id: targetId,
    name: item.name || 'New Platform',
    slug: item.slug || `plat-${Date.now()}`,
    tagline: item.tagline || '',
    category: item.category || 'Enterprise OS',
    description: item.description || '',
    keyFeatures: item.keyFeatures || [],
    stats: item.stats || [],
    demoUrl: item.demoUrl || undefined,
    imageUrl: item.imageUrl || undefined,
    specSheetUrl: item.specSheetUrl || undefined,
    badge: item.badge || undefined,
    iconName: item.iconName || 'Cpu',
    order: item.order || 1,
    ...item,
  } as PlatformItem;
  await ensureReady();
  await query(
    `INSERT INTO platforms (id, name, slug, tagline, category, description, key_features, stats, demo_url,
        image_url, spec_sheet_url, badge, icon_name, order_num, is_deleted)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,$10,$11,$12,$13,$14,FALSE)
     ON CONFLICT (id) DO UPDATE SET name=$2, slug=$3, tagline=$4, category=$5, description=$6,
       key_features=$7::jsonb, stats=$8::jsonb, demo_url=$9, image_url=$10, spec_sheet_url=$11, badge=$12,
       icon_name=$13, order_num=$14, is_deleted=FALSE`,
    [full.id, full.name, full.slug, full.tagline, full.category, full.description, J(full.keyFeatures), J(full.stats),
     full.demoUrl, full.imageUrl, full.specSheetUrl, full.badge, full.iconName, full.order]
  );
  return full;
}

async function deletePlatform(id: string): Promise<boolean> {
  await ensureReady();
  await query(`UPDATE platforms SET is_deleted = TRUE WHERE id = $1`, [id]);
  return true;
}

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------

async function getModels(): Promise<any[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM models WHERE is_deleted = FALSE ORDER BY order_num ASC`);
  if (rs.length === 0) return initialCmsData.models;
  return rs.map((r) => ({
    id: r.id,
    name: r.name,
    badge: r.badge,
    tagline: r.tagline,
    description: r.description,
    contextWindow: r.context_window,
    maxOutput: r.max_output,
    speed: r.speed,
    inputPrice: r.input_price,
    outputPrice: r.output_price,
    benchmarks: r.benchmarks ?? [],
    features: r.features ?? [],
    bestFor: r.best_for ?? [],
    order: r.order_num,
  }));
}

async function saveModel(item: any, id?: string): Promise<any> {
  const targetId = id || item.id || `mdl-${Date.now()}`;
  const full = {
    id: targetId,
    name: item.name || 'New Model',
    badge: item.badge || undefined,
    tagline: item.tagline || '',
    description: item.description || '',
    contextWindow: item.contextWindow || '',
    maxOutput: item.maxOutput || '',
    speed: item.speed || '',
    inputPrice: item.inputPrice || '',
    outputPrice: item.outputPrice || '',
    benchmarks: item.benchmarks || [],
    features: item.features || [],
    bestFor: item.bestFor || [],
    order: item.order || 1,
    ...item,
  };
  await ensureReady();
  await query(
    `INSERT INTO models (id, name, badge, tagline, description, context_window, max_output, speed, input_price,
        output_price, benchmarks, features, best_for, order_num, is_deleted)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12::jsonb,$13::jsonb,$14,FALSE)
     ON CONFLICT (id) DO UPDATE SET name=$2, badge=$3, tagline=$4, description=$5, context_window=$6,
       max_output=$7, speed=$8, input_price=$9, output_price=$10, benchmarks=$11::jsonb, features=$12::jsonb,
       best_for=$13::jsonb, order_num=$14, is_deleted=FALSE`,
    [full.id, full.name, full.badge, full.tagline, full.description, full.contextWindow, full.maxOutput, full.speed,
     full.inputPrice, full.outputPrice, J(full.benchmarks), J(full.features), J(full.bestFor), full.order]
  );
  return full;
}

async function deleteModel(id: string): Promise<boolean> {
  await ensureReady();
  await query(`UPDATE models SET is_deleted = TRUE WHERE id = $1`, [id]);
  return true;
}

// ---------------------------------------------------------------------------
// Blog posts
// ---------------------------------------------------------------------------

async function getBlogPosts(): Promise<BlogPost[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM blog_posts WHERE is_deleted = FALSE ORDER BY publish_date DESC`);
  if (rs.length === 0) return initialCmsData.blogPosts;
  return rs.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    body: r.body,
    coverImage: r.cover_image,
    tags: r.tags ?? [],
    publishDate: r.publish_date,
    status: r.status,
    featured: Boolean(r.featured),
    author: r.author_name
      ? { name: r.author_name, role: r.author_role, avatar: r.author_avatar }
      : undefined,
  }));
}

async function saveBlogPost(item: Partial<BlogPost>, id?: string, skipVersionHistory = false): Promise<BlogPost> {
  const targetId = id || item.id || `blog-${Date.now()}`;
  const full: BlogPost = {
    id: targetId,
    slug: item.slug || `blog-${Date.now()}`,
    title: item.title || 'New Post',
    excerpt: item.excerpt || '',
    body: item.body || '',
    coverImage: item.coverImage || '',
    tags: item.tags || [],
    publishDate: item.publishDate || new Date().toISOString().slice(0, 10),
    status: item.status || 'published',
    featured: item.featured || false,
    author: item.author,
    ...item,
  } as BlogPost;
  await ensureReady();
  await query(
    `INSERT INTO blog_posts (id, slug, title, excerpt, body, cover_image, tags, publish_date, status, featured,
        is_deleted, author_name, author_role, author_avatar)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,FALSE,$11,$12,$13)
     ON CONFLICT (id) DO UPDATE SET slug=$2, title=$3, excerpt=$4, body=$5, cover_image=$6, tags=$7::jsonb,
       publish_date=$8, status=$9, featured=$10, is_deleted=FALSE, author_name=$11, author_role=$12, author_avatar=$13`,
    [full.id, full.slug, full.title, full.excerpt, full.body, full.coverImage, J(full.tags), full.publishDate,
     full.status, full.featured, full.author?.name, full.author?.role, full.author?.avatar]
  );
  if (!skipVersionHistory) {
    await createContentVersion('blog', targetId, full.title, full, 'Blog post saved');
  }
  return full;
}

async function deleteBlogPost(id: string): Promise<boolean> {
  await ensureReady();
  await query(`UPDATE blog_posts SET is_deleted = TRUE WHERE id = $1`, [id]);
  return true;
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

async function getTeamMembers(): Promise<TeamMember[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM team_members WHERE is_deleted = FALSE ORDER BY order_num ASC`);
  if (rs.length === 0) return initialCmsData.team;
  return rs.map((r) => ({
    id: r.id,
    name: r.name,
    role: r.role,
    department: r.department,
    bio: r.bio,
    photoUrl: r.photo_url,
    socials: r.socials ?? {},
    order: r.order_num,
  }));
}

async function saveTeamMember(item: Partial<TeamMember>, id?: string): Promise<TeamMember> {
  const targetId = id || item.id || `team-${Date.now()}`;
  const full: TeamMember = {
    id: targetId,
    name: item.name || 'New Member',
    role: item.role || '',
    department: item.department || '',
    bio: item.bio || '',
    photoUrl: item.photoUrl || '',
    socials: item.socials || {},
    order: item.order || 1,
    ...item,
  } as TeamMember;
  await ensureReady();
  await query(
    `INSERT INTO team_members (id, name, role, department, bio, photo_url, socials, order_num, is_deleted)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,FALSE)
     ON CONFLICT (id) DO UPDATE SET name=$2, role=$3, department=$4, bio=$5, photo_url=$6, socials=$7::jsonb,
       order_num=$8, is_deleted=FALSE`,
    [full.id, full.name, full.role, full.department, full.bio, full.photoUrl, J(full.socials), full.order]
  );
  return full;
}

async function deleteTeamMember(id: string): Promise<boolean> {
  await ensureReady();
  await query(`UPDATE team_members SET is_deleted = TRUE WHERE id = $1`, [id]);
  return true;
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

async function getTestimonials(): Promise<Testimonial[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM testimonials WHERE is_deleted = FALSE ORDER BY order_num ASC`);
  if (rs.length === 0) return initialCmsData.testimonials;
  return rs.map((r) => ({
    id: r.id,
    quote: r.quote,
    author: r.author,
    role: r.role,
    company: r.company,
    avatarUrl: r.avatar_url,
    rating: r.rating,
  }));
}

async function saveTestimonial(item: Partial<Testimonial>, id?: string): Promise<Testimonial> {
  const targetId = id || item.id || `test-${Date.now()}`;
  const full: Testimonial = {
    id: targetId,
    quote: item.quote || '',
    author: item.author || '',
    role: item.role || '',
    company: item.company || '',
    avatarUrl: item.avatarUrl || '',
    rating: item.rating || 5,
    ...item,
  } as Testimonial;
  await ensureReady();
  await query(
    `INSERT INTO testimonials (id, quote, author, role, company, avatar_url, rating, is_deleted)
     VALUES ($1,$2,$3,$4,$5,$6,$7,FALSE)
     ON CONFLICT (id) DO UPDATE SET quote=$2, author=$3, role=$4, company=$5, avatar_url=$6, rating=$7,
       is_deleted=FALSE`,
    [full.id, full.quote, full.author, full.role, full.company, full.avatarUrl, full.rating]
  );
  return full;
}

async function deleteTestimonial(id: string): Promise<boolean> {
  await ensureReady();
  await query(`UPDATE testimonials SET is_deleted = TRUE WHERE id = $1`, [id]);
  return true;
}

// ---------------------------------------------------------------------------
// Case studies
// ---------------------------------------------------------------------------

async function getCaseStudies(): Promise<CaseStudy[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM case_studies WHERE is_deleted = FALSE ORDER BY title ASC`);
  if (rs.length === 0) return initialCmsData.caseStudies;
  return rs.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    client: r.client,
    industry: r.industry,
    impactMetric: r.impact_metric,
    summary: r.summary,
    body: r.body,
    coverImage: r.cover_image,
    tags: r.tags ?? [],
  }));
}

async function saveCaseStudy(item: Partial<CaseStudy>, id?: string): Promise<CaseStudy> {
  const targetId = id || item.id || `cs-${Date.now()}`;
  const full: CaseStudy = {
    id: targetId,
    slug: item.slug || `cs-${Date.now()}`,
    title: item.title || 'New Case Study',
    client: item.client || '',
    industry: item.industry || '',
    impactMetric: item.impactMetric || '',
    summary: item.summary || '',
    body: item.body || '',
    coverImage: item.coverImage || '',
    tags: item.tags || [],
    ...item,
  } as CaseStudy;
  await ensureReady();
  await query(
    `INSERT INTO case_studies (id, slug, title, client, industry, impact_metric, summary, body, cover_image, tags, is_deleted)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,FALSE)
     ON CONFLICT (id) DO UPDATE SET slug=$2, title=$3, client=$4, industry=$5, impact_metric=$6, summary=$7,
       body=$8, cover_image=$9, tags=$10::jsonb, is_deleted=FALSE`,
    [full.id, full.slug, full.title, full.client, full.industry, full.impactMetric, full.summary, full.body,
     full.coverImage, J(full.tags)]
  );
  return full;
}

async function deleteCaseStudy(id: string): Promise<boolean> {
  await ensureReady();
  await query(`UPDATE case_studies SET is_deleted = TRUE WHERE id = $1`, [id]);
  return true;
}

// ---------------------------------------------------------------------------
// Careers
// ---------------------------------------------------------------------------

async function getCareers(): Promise<CareerListing[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM careers WHERE is_deleted = FALSE AND active = TRUE ORDER BY title ASC`);
  if (rs.length === 0) return initialCmsData.careers;
  return rs.map((r) => ({
    id: r.id,
    title: r.title,
    department: r.department,
    location: r.location,
    type: r.type,
    description: r.description,
    requirements: r.requirements ?? [],
    applyLink: r.apply_link,
    active: Boolean(r.active),
  }));
}

async function saveCareer(job: Partial<CareerListing>, id?: string): Promise<CareerListing> {
  const targetId = id || job.id || `job-${Date.now()}`;
  const full: CareerListing = {
    id: targetId,
    title: job.title || 'New Role',
    department: job.department || '',
    location: job.location || '',
    type: job.type || 'Full-time',
    description: job.description || '',
    requirements: job.requirements || [],
    applyLink: job.applyLink || '',
    active: job.active ?? true,
    ...job,
  } as CareerListing;
  await ensureReady();
  await query(
    `INSERT INTO careers (id, title, department, location, type, description, requirements, apply_link, active, is_deleted)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,FALSE)
     ON CONFLICT (id) DO UPDATE SET title=$2, department=$3, location=$4, type=$5, description=$6,
       requirements=$7::jsonb, apply_link=$8, active=$9, is_deleted=FALSE`,
    [full.id, full.title, full.department, full.location, full.type, full.description, J(full.requirements),
     full.applyLink, full.active]
  );
  return full;
}

async function deleteCareer(id: string): Promise<boolean> {
  await ensureReady();
  await query(`UPDATE careers SET is_deleted = TRUE WHERE id = $1`, [id]);
  return true;
}

// ---------------------------------------------------------------------------
// Contact submissions
// ---------------------------------------------------------------------------

async function getContactSubmissions(): Promise<ContactSubmission[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM contact_submissions ORDER BY created_at DESC`);
  return rs.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    company: r.company,
    subject: r.subject,
    message: r.message,
    attachmentUrl: r.attachment_url || undefined,
    attachmentName: r.attachment_name || undefined,
    status: r.status,
    createdAt: r.created_at,
  }));
}

async function createContactSubmission(data: Partial<ContactSubmission>): Promise<ContactSubmission> {
  const id = data.id || `sub-${Date.now()}`;
  const full: ContactSubmission = {
    id,
    name: data.name || '',
    email: data.email || '',
    company: data.company || '',
    subject: data.subject || '',
    message: data.message || '',
    attachmentUrl: data.attachmentUrl || undefined,
    attachmentName: data.attachmentName || undefined,
    status: data.status || 'new',
    createdAt: data.createdAt || new Date().toISOString(),
    ...data,
  } as ContactSubmission;
  await ensureReady();
  await query(
    `INSERT INTO contact_submissions (id, name, email, company, subject, message, attachment_url, attachment_name, status, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     ON CONFLICT (id) DO UPDATE SET status=$9`,
    [full.id, full.name, full.email, full.company, full.subject, full.message, full.attachmentUrl,
     full.attachmentName, full.status, full.createdAt]
  );
  return full;
}

async function updateContactSubmissionStatus(id: string, status: string): Promise<ContactSubmission | null> {
  await ensureReady();
  await query(`UPDATE contact_submissions SET status = $1 WHERE id = $2`, [status, id]);
  const r = await one<any>(`SELECT * FROM contact_submissions WHERE id = $1`, [id]);
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    company: r.company,
    subject: r.subject,
    message: r.message,
    attachmentUrl: r.attachment_url || undefined,
    attachmentName: r.attachment_name || undefined,
    status: r.status,
    createdAt: r.created_at,
  };
}

// ---------------------------------------------------------------------------
// Site settings / cloud credits / footer pages
// ---------------------------------------------------------------------------

async function getSiteSettings(): Promise<SiteSettings> {
  return getDoc<SiteSettings>('site_settings', initialCmsData.settings);
}

async function saveAboutUs(data: Partial<any>): Promise<any> {
  const about = { ...initialCmsData.aboutUs, ...data };
  await setDoc('about_us', about);
  return about;
}

async function savePopupBanner(data: Partial<any>): Promise<any> {
  const banner = { ...initialCmsData.popupBanner, ...data };
  await setDoc('popup_banner', banner);
  return banner;
}

async function saveSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const updated = { ...current, ...settings } as SiteSettings;
  await setDoc('site_settings', updated);
  return updated;
}

async function getCloudCredits(): Promise<CloudCreditUsage[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM cloud_credits`);
  if (rs.length === 0) return initialCmsData.cloudCredits;
  return rs.map((r) => ({
    id: r.id,
    provider: r.provider,
    service: r.service,
    limit: Number(r.limit_val),
    used: Number(r.used),
    unit: r.unit,
    resetDate: new Date(r.reset_date).toISOString(),
  }));
}

async function saveCloudCredit(credit: Partial<CloudCreditUsage>, id?: string): Promise<CloudCreditUsage> {
  await ensureReady();
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
  await query(`DELETE FROM cloud_credits WHERE id = $1`, [full.id]);
  await query(
    `INSERT INTO cloud_credits (id, provider, service, limit_val, used, unit, reset_date) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [full.id, full.provider, full.service, full.limit, full.used, full.unit, full.resetDate]
  );
  return full;
}

async function deleteCloudCredit(id: string): Promise<boolean> {
  await ensureReady();
  await query(`DELETE FROM cloud_credits WHERE id = $1`, [id]);
  return true;
}

async function getFooterPages(): Promise<FooterPage[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM footer_pages WHERE is_deleted = FALSE ORDER BY title ASC`);
  if (rs.length === 0) return initialCmsData.footerPages;
  return rs.map((r) => ({ id: r.id, slug: r.slug, title: r.title, content: r.content }));
}

async function saveFooterPage(page: Partial<FooterPage>, id?: string, skipVersionHistory = false): Promise<FooterPage> {
  const targetId = id || page.id || `page-${Date.now()}`;
  const full: FooterPage = {
    id: targetId,
    slug: page.slug || `page-${Date.now()}`,
    title: page.title || 'New Page',
    content: page.content || '',
    ...page,
  } as FooterPage;
  await ensureReady();
  await query(
    `INSERT INTO footer_pages (id, slug, title, content, is_deleted)
     VALUES ($1,$2,$3,$4,FALSE)
     ON CONFLICT (id) DO UPDATE SET slug=$2, title=$3, content=$4, is_deleted=FALSE`,
    [full.id, full.slug, full.title, full.content]
  );
  if (!skipVersionHistory) {
    await createContentVersion('footer_page', targetId, full.title, full, 'Footer page saved');
  }
  return full;
}

async function deleteFooterPage(id: string): Promise<boolean> {
  await ensureReady();
  await query(`UPDATE footer_pages SET is_deleted = TRUE WHERE id = $1`, [id]);
  return true;
}

// ---------------------------------------------------------------------------
// Outreach leads
// ---------------------------------------------------------------------------

async function getOutreachLeads(): Promise<OutreachLead[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM outreach_leads ORDER BY submitted_at DESC`);
  if (rs.length === 0) return initialCmsData.outreachQueue || [];
  return rs.map((r) => ({
    id: r.id,
    leadId: r.lead_id || undefined,
    name: r.name,
    email: r.email,
    company: r.company || undefined,
    solutionOfInterest: r.solution_of_interest,
    intentScore: r.intent_score,
    classificationTag: r.classification_tag || undefined,
    confidenceScore: r.confidence_score ? Number(r.confidence_score) : undefined,
    buyingSignals: r.buying_signals ?? [],
    classificationReason: r.classification_reason || undefined,
    suggestedAction: r.suggested_action || undefined,
    sentiment: r.sentiment ?? undefined,
    intentReason: r.intent_reason,
    aumOrBudget: r.aum_or_budget || undefined,
    userMessage: r.user_message || undefined,
    suggestedSubject: r.suggested_subject,
    suggestedDraftResponse: r.suggested_draft_response,
    status: r.status,
    stage: r.stage || undefined,
    demoScheduledAt: r.demo_scheduled_at || undefined,
    demoMeetingType: r.demo_meeting_type || undefined,
    demoNotes: r.demo_notes || undefined,
    customNotes: r.custom_notes || undefined,
    submittedAt: r.submitted_at,
    updatedAt: r.updated_at || undefined,
    sentAt: r.sent_at || undefined,
    agentSource: r.source || 'Nexus Assistant',
  }));
}

async function saveOutreachLead(lead: Partial<OutreachLead>, id?: string): Promise<OutreachLead> {
  const targetId = id || lead.id || `lead-${Date.now()}`;
  const full: OutreachLead = {
    id: targetId,
    leadId: lead.leadId || targetId,
    name: lead.name || '',
    email: lead.email || '',
    company: lead.company || undefined,
    solutionOfInterest: lead.solutionOfInterest || '',
    intentScore: lead.intentScore || 'Medium',
    classificationTag: lead.classificationTag || undefined,
    confidenceScore: lead.confidenceScore || undefined,
    buyingSignals: lead.buyingSignals || [],
    classificationReason: lead.classificationReason || undefined,
    suggestedAction: lead.suggestedAction || undefined,
    sentiment: lead.sentiment || undefined,
    intentReason: lead.intentReason || '',
    aumOrBudget: lead.aumOrBudget || undefined,
    userMessage: lead.userMessage || undefined,
    suggestedSubject: lead.suggestedSubject || '',
    suggestedDraftResponse: lead.suggestedDraftResponse || '',
    status: lead.status || 'Pending Review',
    stage: lead.stage || 'New Inquiry',
    demoScheduledAt: lead.demoScheduledAt || undefined,
    demoMeetingType: lead.demoMeetingType || undefined,
    demoNotes: lead.demoNotes || undefined,
    customNotes: lead.customNotes || undefined,
    submittedAt: lead.submittedAt || new Date().toISOString(),
    updatedAt: lead.updatedAt || undefined,
    sentAt: lead.sentAt || undefined,
    agentSource: lead.agentSource || 'Nexus Assistant',
    ...lead,
  } as OutreachLead;
  await ensureReady();
  await query(
    `INSERT INTO outreach_leads (id, lead_id, name, email, company, solution_of_interest, intent_score,
        classification_tag, confidence_score, buying_signals, classification_reason, suggested_action, sentiment,
        intent_reason, aum_or_budget, user_message, suggested_subject, suggested_draft_response, status, stage,
        demo_scheduled_at, demo_meeting_type, demo_notes, custom_notes, submitted_at,
        updated_at, sent_at, source)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28)
     ON CONFLICT (id) DO UPDATE SET name=$3, email=$4, company=$5, solution_of_interest=$6, intent_score=$7,
       classification_tag=$8, confidence_score=$9, buying_signals=$10::jsonb, classification_reason=$11,
       suggested_action=$12, sentiment=$13, intent_reason=$14, aum_or_budget=$15, user_message=$16,
       suggested_subject=$17, suggested_draft_response=$18, status=$19, stage=$20, demo_scheduled_at=$21,
       demo_meeting_type=$22, demo_notes=$23, custom_notes=$24, updated_at=$25,
       sent_at=$26, source=$27`,
    [full.id, full.leadId, full.name, full.email, full.company, full.solutionOfInterest, full.intentScore,
     full.classificationTag, full.confidenceScore, J(full.buyingSignals), full.classificationReason, full.suggestedAction,
     J(full.sentiment), full.intentReason, full.aumOrBudget, full.userMessage, full.suggestedSubject,
     full.suggestedDraftResponse, full.status, full.stage, full.demoScheduledAt, full.demoMeetingType,
     full.demoNotes, full.customNotes, full.submittedAt, full.updatedAt, full.sentAt,
     full.agentSource]
  );
  return full;
}

async function deleteOutreachLead(id: string): Promise<boolean> {
  await ensureReady();
  await query(`DELETE FROM outreach_leads WHERE id = $1`, [id]);
  return true;
}

// ---------------------------------------------------------------------------
// Calendar bookings
// ---------------------------------------------------------------------------

async function getBookings(): Promise<any[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM calendar_bookings ORDER BY created_at DESC`);
  return rs.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    company: r.company,
    date: r.date,
    slot: r.slot,
    meetingType: r.meeting_type,
    topic: r.topic,
    status: r.status,
    createdAt: r.created_at,
  }));
}

async function bookSlot(booking: {
  name: string;
  email: string;
  company: string;
  date: string;
  slot: string;
  meetingType: string;
  topic: string;
}): Promise<boolean> {
  const id = `book-${Date.now()}`;
  const createdAt = new Date().toISOString();
  await ensureReady();
  await query(
    `INSERT INTO calendar_bookings (id, name, email, company, date, slot, meeting_type, topic, status, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'confirmed',$9)`,
    [id, booking.name, booking.email, booking.company, booking.date, booking.slot, booking.meetingType, booking.topic, createdAt]
  );
  return true;
}

async function isSlotBooked(date: string, slot: string): Promise<boolean> {
  await ensureReady();
  const r = await one<{ c: number }>(
    `SELECT COUNT(*)::int AS c FROM calendar_bookings WHERE date = $1 AND slot = $2 AND status != 'cancelled'`,
    [date, slot]
  );
  return (r?.c ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// Outreach templates
// ---------------------------------------------------------------------------

async function getOutreachTemplates(): Promise<OutreachTemplate[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM outreach_templates ORDER BY updated_at DESC`);
  if (rs.length === 0) return initialCmsData.outreachTemplates || [];
  return rs.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    targetSolutionKeywords: r.target_solution_keywords ?? [],
    subjectTemplate: r.subject_template,
    bodyTemplate: r.body_template,
    systemPromptInstructions: r.system_prompt_instructions,
    isDefault: Boolean(r.is_default),
    updatedAt: r.updated_at,
  }));
}

async function saveOutreachTemplate(template: Partial<OutreachTemplate>, id?: string): Promise<OutreachTemplate> {
  const targetId = id || template.id || `tpl-${Date.now()}`;
  const full: OutreachTemplate = {
    id: targetId,
    name: template.name || 'New Template',
    category: template.category || 'general',
    targetSolutionKeywords: template.targetSolutionKeywords || [],
    subjectTemplate: template.subjectTemplate || '',
    bodyTemplate: template.bodyTemplate || '',
    systemPromptInstructions: template.systemPromptInstructions || '',
    isDefault: template.isDefault || false,
    updatedAt: new Date().toISOString(),
    ...template,
  } as OutreachTemplate;
  await ensureReady();
  await query(
    `INSERT INTO outreach_templates (id, name, category, target_solution_keywords, subject_template, body_template,
        system_prompt_instructions, is_default, updated_at)
     VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7,$8,$9)
     ON CONFLICT (id) DO UPDATE SET name=$2, category=$3, target_solution_keywords=$4::jsonb, subject_template=$5,
       body_template=$6, system_prompt_instructions=$7, is_default=$8, updated_at=$9`,
    [full.id, full.name, full.category, J(full.targetSolutionKeywords), full.subjectTemplate, full.bodyTemplate,
     full.systemPromptInstructions, full.isDefault, full.updatedAt]
  );
  return full;
}

async function deleteOutreachTemplate(id: string): Promise<boolean> {
  await ensureReady();
  await query(`DELETE FROM outreach_templates WHERE id = $1`, [id]);
  return true;
}

// ---------------------------------------------------------------------------
// Activity & audit logs
// ---------------------------------------------------------------------------

async function getActivityLogs(): Promise<ActivityLog[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 200`);
  return rs.map((r) => ({
    id: r.id,
    action: r.action,
    target: r.target,
    targetId: r.target_id,
    performedBy: r.performed_by,
    timestamp: r.timestamp,
  }));
}

async function createActivityLog(action: string, target: string, targetId: string, performedBy: string): Promise<void> {
  await ensureReady();
  await query(
    `INSERT INTO activity_logs (id, action, target, target_id, performed_by, timestamp)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [`act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, action, target, targetId, performedBy, new Date().toISOString()]
  );
}

async function getAuditLogs(): Promise<Array<{ id: string; action: string; user: string; timestamp: string }>> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 200`);
  return rs.map((r) => ({ id: r.id, action: r.action, user: r.user, timestamp: r.timestamp }));
}

async function createAuditLog(action: string, user: string): Promise<void> {
  await ensureReady();
  await query(
    `INSERT INTO audit_logs (id, action, "user", timestamp) VALUES ($1,$2,$3,$4)`,
    [`aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, action, user, new Date().toISOString()]
  );
}

async function getInvoices(): Promise<Invoice[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM invoices ORDER BY created_at DESC`);
  return rs.map((r) => ({
    id: r.id,
    invoiceNumber: r.invoice_number,
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    company: r.company,
    status: r.status,
    currency: r.currency,
    subtotal: Number(r.subtotal || 0),
    tax: Number(r.tax || 0),
    discount: Number(r.discount || 0),
    total: Number(r.total || 0),
    dueDate: r.due_date,
    paidAt: r.paid_at,
    issuedAt: r.issued_at,
    items: r.items || [],
    notes: r.notes,
    billingAddress: r.billing_address,
    stripeInvoiceId: r.stripe_invoice_id,
    stripePaymentIntentId: r.stripe_payment_intent_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

async function saveInvoice(inv: Partial<Invoice>, id?: string): Promise<Invoice> {
  await ensureReady();
  const targetId = id || inv.id || `inv-${Date.now()}`;
  const invoiceNumber = inv.invoiceNumber || `INV-${Date.now()}`;
  const now = new Date().toISOString();
  await query(
    `INSERT INTO invoices (id, invoice_number, customer_name, customer_email, company, status, currency, subtotal, tax, discount, total, due_date, paid_at, issued_at, items, notes, billing_address, stripe_invoice_id, stripe_payment_intent_id, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
     ON CONFLICT (id) DO UPDATE SET
       customer_name = EXCLUDED.customer_name,
       customer_email = EXCLUDED.customer_email,
       company = EXCLUDED.company,
       status = EXCLUDED.status,
       currency = EXCLUDED.currency,
       subtotal = EXCLUDED.subtotal,
       tax = EXCLUDED.tax,
       discount = EXCLUDED.discount,
       total = EXCLUDED.total,
       due_date = EXCLUDED.due_date,
       paid_at = EXCLUDED.paid_at,
       issued_at = EXCLUDED.issued_at,
       items = EXCLUDED.items,
       notes = EXCLUDED.notes,
       billing_address = EXCLUDED.billing_address,
       stripe_invoice_id = EXCLUDED.stripe_invoice_id,
       stripe_payment_intent_id = EXCLUDED.stripe_payment_intent_id,
       updated_at = EXCLUDED.updated_at`,
    [
      targetId,
      invoiceNumber,
      inv.customerName || null,
      inv.customerEmail || '',
      inv.company || null,
      inv.status || 'draft',
      inv.currency || 'USD',
      inv.subtotal || 0,
      inv.tax || 0,
      inv.discount || 0,
      inv.total || 0,
      inv.dueDate || null,
      inv.paidAt || null,
      inv.issuedAt || null,
      J(inv.items || []),
      inv.notes || null,
      J(inv.billingAddress || null),
      inv.stripeInvoiceId || null,
      inv.stripePaymentIntentId || null,
      inv.createdAt || now,
      now,
    ]
  );
  const invoices = await getInvoices();
  return invoices.find((i) => i.id === targetId) as Invoice;
}

async function deleteInvoice(id: string): Promise<boolean> {
  await ensureReady();
  await query(`DELETE FROM invoices WHERE id = $1`, [id]);
  return true;
}


// ---------------------------------------------------------------------------
// Translations cache
// ---------------------------------------------------------------------------

async function getTranslation(sourceText: string, targetLanguage: string): Promise<string | null> {
  await ensureReady();
  const r = await one<{ translated_text: string }>(
    `SELECT translated_text FROM translations_cache WHERE source_text = $1 AND target_language = $2 LIMIT 1`,
    [sourceText, targetLanguage]
  );
  return r?.translated_text ?? null;
}

async function saveTranslation(sourceText: string, targetLanguage: string, translatedText: string): Promise<void> {
  await ensureReady();
  await query(
    `INSERT INTO translations_cache (id, source_text, target_language, translated_text, created_at)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (id) DO UPDATE SET translated_text=$4`,
    [`tr-${Date.now()}-${Math.floor(Math.random() * 1000)}`, sourceText, targetLanguage, translatedText, new Date().toISOString()]
  );
}

// ---------------------------------------------------------------------------
// Full CMS payload
// ---------------------------------------------------------------------------

async function getFullCms(): Promise<CmsDatabase> {
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
    auditLogs,
  ] = await Promise.all([
    getHero(),
    getServices(),
    getProducts(),
    getPlatforms(),
    getModels(),
    getTeamMembers(),
    getTestimonials(),
    getBlogPosts(),
    getCaseStudies(),
    getCareers(),
    getContactSubmissions(),
    getSiteSettings(),
    getFooterPages(),
    getCloudCredits(),
    getOutreachLeads(),
    getOutreachTemplates(),
    getWebhookConfigs(),
    getNewsletterSubscribers(),
    getChatSessions(),
    getAdmins(),
    getMedia(),
    getAuditLogs(),
  ]);
  const popupBanner = await getDoc<any>('popup_banner', initialCmsData.popupBanner);
  const aboutUs = await getDoc<any>('about_us', initialCmsData.aboutUs);
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
}

// ---------------------------------------------------------------------------
// AI telemetry
// ---------------------------------------------------------------------------

async function saveTelemetryLog(log: {
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
  await ensureReady();
  await query(
    `INSERT INTO ai_telemetry_logs (id, timestamp, model, user_message, tokens_estimated, latency_ms, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [id, timestamp, log.model, log.userMessage, log.tokensEstimated, log.latencyMs, log.status]
  );
  return { id, timestamp, ...log };
}

async function getTelemetryLogs(limit = 50) {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM ai_telemetry_logs ORDER BY timestamp DESC LIMIT $1`, [limit]);
  return rs.map((r) => ({
    id: r.id,
    timestamp: r.timestamp,
    model: r.model,
    userMessage: r.user_message,
    tokensEstimated: Number(r.tokens_estimated || 0),
    latencyMs: Number(r.latency_ms || 0),
    status: r.status,
  }));
}

// ---------------------------------------------------------------------------
// Database stats & raw SQL
// ---------------------------------------------------------------------------

const STATS_TABLES = [
  'site_settings', 'hero_content', 'about_us', 'popup_banner', 'services', 'products', 'platforms',
  'team_members', 'testimonials', 'blog_posts', 'case_studies', 'careers', 'contact_submissions',
  'footer_pages', 'content_versions', 'cloud_credits', 'newsletter_subscribers', 'activity_logs',
  'audit_logs', 'translations_cache', 'ai_telemetry_logs', 'outreach_leads', 'outreach_templates',
  'webhook_configs', 'admins', 'chat_sessions', 'calendar_bookings', 'media',
];

async function generateAllTablesAndSchemas() {
  await migratePostgresSchema();
  return getDatabaseStats();
}

async function getDatabaseStats() {
  await ensureReady();
  const stats: Record<string, number> = {};
  await Promise.all(
    STATS_TABLES.map(async (t) => {
      try {
        const r = await one<{ c: number }>(`SELECT COUNT(*)::int AS c FROM ${t}`);
        stats[t] = r?.c ?? 0;
      } catch {
        stats[t] = 0;
      }
    })
  );
  return {
    connected: true,
    engine: 'PostgreSQL 15+ (Supabase-ready)',
    databaseUrl: process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL || 'configured',
    syncBackupFile: 'cmsData.json',
    tableCounts: stats,
    totalTables: STATS_TABLES.length,
    lastChecked: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Newsletter
// ---------------------------------------------------------------------------

async function getNewsletterSubscribers(): Promise<string[]> {
  await ensureReady();
  const rs = await rows<{ email: string }>(`SELECT email FROM newsletter_subscribers WHERE subscribed = TRUE`);
  return rs.map((r) => r.email);
}

async function subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  await ensureReady();
  try {
    await query(
      `INSERT INTO newsletter_subscribers (id, email, subscribed, created_at) VALUES ($1,$2,TRUE,$3)
       ON CONFLICT (email) DO UPDATE SET subscribed = TRUE`,
      [`sub-${Date.now()}`, email, new Date().toISOString()]
    );
    return { success: true, message: 'Subscribed' };
  } catch (e: any) {
    return { success: false, message: e?.message || 'Database error' };
  }
}

async function deleteNewsletterSubscriber(email: string): Promise<boolean> {
  await ensureReady();
  await query(`DELETE FROM newsletter_subscribers WHERE email = $1`, [email]);
  return true;
}

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------

async function getWebhookConfigs(): Promise<WebhookConfig[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM webhook_configs ORDER BY updated_at DESC`);
  return rs.map((r) => ({
    id: r.id,
    name: r.name,
    url: r.url,
    isActive: Boolean(r.is_active),
    type: r.type,
    updatedAt: r.updated_at,
  }));
}

async function saveWebhookConfig(config: Partial<WebhookConfig>, id?: string): Promise<WebhookConfig> {
  const targetId = id || config.id || `wh-${Date.now()}`;
  const full: WebhookConfig = {
    id: targetId,
    name: config.name || 'New Webhook',
    url: config.url || '',
    isActive: config.isActive ?? true,
    type: config.type || 'outreach',
    updatedAt: new Date().toISOString(),
    ...config,
  } as WebhookConfig;
  await ensureReady();
  await query(
    `INSERT INTO webhook_configs (id, name, url, is_active, type, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (id) DO UPDATE SET name=$2, url=$3, is_active=$4, type=$5, updated_at=$6`,
    [full.id, full.name, full.url, full.isActive, full.type, full.updatedAt]
  );
  return full;
}

async function deleteWebhookConfig(id: string): Promise<boolean> {
  await ensureReady();
  await query(`DELETE FROM webhook_configs WHERE id = $1`, [id]);
  return true;
}

// ---------------------------------------------------------------------------
// Admins
// ---------------------------------------------------------------------------

async function getAdmins(): Promise<AdminUser[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM admins ORDER BY name ASC`);
  return rs.map((r) => ({ id: r.id, name: r.name, email: r.email, role: r.role, lastLogin: r.last_login }));
}

async function saveAdmin(admin: Partial<AdminUser>, id?: string): Promise<AdminUser> {
  const targetId = id || admin.id || `adm-${Date.now()}`;
  const full: AdminUser = {
    id: targetId,
    name: admin.name || '',
    email: admin.email || '',
    role: admin.role || 'admin',
    lastLogin: admin.lastLogin || undefined,
    ...admin,
  } as AdminUser;
  await ensureReady();
  await query(
    `INSERT INTO admins (id, name, email, role, last_login) VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (id) DO UPDATE SET name=$2, email=$3, role=$4, last_login=$5`,
    [full.id, full.name, full.email, full.role, full.lastLogin]
  );
  return full;
}

async function deleteAdmin(id: string): Promise<boolean> {
  await ensureReady();
  await query(`DELETE FROM admins WHERE id = $1`, [id]);
  return true;
}

// ---------------------------------------------------------------------------
// Chat sessions
// ---------------------------------------------------------------------------

async function getChatSessions(): Promise<ChatSession[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM chat_sessions ORDER BY is_pinned DESC, updated_at DESC`);
  return rs.map((r) => ({
    id: r.id,
    title: r.title,
    model: r.model,
    persona: r.persona,
    updatedAt: Number(r.updated_at),
    messages: r.messages ?? [],
    isPinned: Boolean(r.is_pinned),
    userContext: r.user_context ?? undefined,
  }));
}

async function saveChatSession(session: Partial<ChatSession>, id?: string): Promise<ChatSession> {
  const targetId = id || session.id || `session-${Date.now()}`;
  const full: ChatSession = {
    id: targetId,
    title: session.title || 'New Conversation',
    messages: session.messages || [],
    updatedAt: session.updatedAt || Date.now(),
    model: session.model || '9xen-omni-2.5',
    persona: session.persona || 'standard',
    isPinned: session.isPinned || false,
    userContext: session.userContext,
    ...session,
  } as ChatSession;
  await ensureReady();
  await query(
    `INSERT INTO chat_sessions (id, title, model, persona, updated_at, messages, is_pinned, user_context)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8::jsonb)
     ON CONFLICT (id) DO UPDATE SET title=$2, model=$3, persona=$4, updated_at=$5, messages=$6::jsonb,
       is_pinned=$7, user_context=$8::jsonb`,
    [full.id, full.title, full.model, full.persona, full.updatedAt, J(full.messages), full.isPinned, J(full.userContext)]
  );
  return full;
}

async function deleteChatSession(id: string): Promise<boolean> {
  await ensureReady();
  await query(`DELETE FROM chat_sessions WHERE id = $1`, [id]);
  return true;
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

async function getMedia(): Promise<any[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM media ORDER BY created_at DESC`);
  return rs.map((r) => ({
    id: r.id,
    url: r.url,
    filename: r.filename,
    mimeType: r.mime_type,
    size: r.size,
    createdAt: r.created_at,
  }));
}

async function saveMedia(item: any): Promise<any> {
  const targetId = item.id || `media-${Date.now()}`;
  const full = {
    id: targetId,
    url: item.url || '',
    filename: item.filename || 'file',
    mimeType: item.mimeType || 'application/octet-stream',
    size: item.size || 0,
    createdAt: item.createdAt || new Date().toISOString(),
    ...item,
  };
  await ensureReady();
  await query(
    `INSERT INTO media (id, url, filename, mime_type, size, created_at) VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (id) DO UPDATE SET url=$2, filename=$3, mime_type=$4, size=$5`,
    [full.id, full.url, full.filename, full.mimeType, full.size, full.createdAt]
  );
  return full;
}

async function deleteMedia(id: string): Promise<boolean> {
  await ensureReady();
  await query(`DELETE FROM media WHERE id = $1`, [id]);
  return true;
}

// ---------------------------------------------------------------------------
// Raw SQL (admin only)
// ---------------------------------------------------------------------------

async function executeRawQuery(sql: string): Promise<{
  success: boolean;
  columns: string[];
  rows: any[];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
}> {
  const startTime = Date.now();
  await ensureReady();
  const lower = sql.trim().toLowerCase();
  if (lower.startsWith('drop database') || lower.startsWith('shutdown')) {
    return { success: false, columns: [], rows: [], rowCount: 0, executionTimeMs: 0, error: 'Dangerous SQL operation rejected by 9xen Security Kernel.' };
  }
  try {
    const res = await query(sql);
    const executionTimeMs = Date.now() - startTime;
    const resultRows = res.rows || [];
    return {
      success: true,
      columns: res.fields?.map((f: any) => f.name) || (resultRows.length > 0 ? Object.keys(resultRows[0]) : []),
      rows: resultRows,
      rowCount: resultRows.length,
      executionTimeMs,
    };
  } catch (err: any) {
    return { success: false, columns: [], rows: [], rowCount: 0, executionTimeMs: Date.now() - startTime, error: err.message || String(err) };
  }
}

// ---------------------------------------------------------------------------
// Content versioning & rollback
// ---------------------------------------------------------------------------

async function createContentVersion(
  contentType: string,
  contentId: string,
  title: string,
  data: any,
  changeSummary = 'Content saved',
  createdByName = 'Editor Admin',
  createdByEmail = 'admin@9xenai.com'
): Promise<ContentVersion> {
  await ensureReady();
  const r = await one<{ max_ver: number | null }>(
    `SELECT COALESCE(MAX(version), 0) AS max_ver FROM content_versions WHERE content_type = $1 AND content_id = $2`,
    [contentType, contentId]
  );
  const nextVersion = Number(r?.max_ver || 0) + 1;
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
  await query(
    `INSERT INTO content_versions (id, content_type, content_id, version, title, data, change_summary,
        created_by_name, created_by_email, created_at)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10)`,
    [versionObj.id, versionObj.contentType, versionObj.contentId, versionObj.version, versionObj.title,
     J(versionObj.data), versionObj.changeSummary, versionObj.createdByName, versionObj.createdByEmail, versionObj.createdAt]
  );
  return versionObj;
}

async function getContentVersions(contentType: string, contentId: string): Promise<ContentVersion[]> {
  await ensureReady();
  const rs = await rows<any>(
    `SELECT * FROM content_versions WHERE content_type = $1 AND content_id = $2 ORDER BY version DESC`,
    [contentType, contentId]
  );
  return rs.map((r) => ({
    id: r.id,
    contentType: r.content_type,
    contentId: r.content_id,
    version: Number(r.version),
    title: r.title,
    data: r.data,
    changeSummary: r.change_summary,
    createdByName: r.created_by_name,
    createdByEmail: r.created_by_email,
    createdAt: r.created_at,
  }));
}

async function getContentVersionById(id: string): Promise<ContentVersion | null> {
  await ensureReady();
  const r = await one<any>(`SELECT * FROM content_versions WHERE id = $1 LIMIT 1`, [id]);
  if (!r) return null;
  return {
    id: r.id,
    contentType: r.content_type,
    contentId: r.content_id,
    version: Number(r.version),
    title: r.title,
    data: r.data,
    changeSummary: r.change_summary,
    createdByName: r.created_by_name,
    createdByEmail: r.created_by_email,
    createdAt: r.created_at,
  };
}

async function rollbackContentVersion(
  versionId: string,
  createdByName = 'Editor Admin'
): Promise<{ success: boolean; item?: any; newVersion?: ContentVersion; error?: string }> {
  const versionRecord = await getContentVersionById(versionId);
  if (!versionRecord) {
    return { success: false, error: 'Target version history entry not found.' };
  }
  const { contentType, contentId, data, version } = versionRecord;
  const itemData = typeof data === 'string' ? JSON.parse(data) : data;
  let restoredItem: any = null;

  if (contentType === 'blog' || contentType === 'blog_post') {
    restoredItem = await saveBlogPost(itemData, contentId, true);
  } else if (contentType === 'footer_page') {
    restoredItem = await saveFooterPage(itemData, contentId, true);
  } else if (contentType === 'hero') {
    restoredItem = await updateHero(itemData, true);
  } else if (contentType === 'service') {
    restoredItem = await saveService(itemData, contentId);
  } else if (contentType === 'product') {
    restoredItem = await saveProduct(itemData, contentId);
  } else if (contentType === 'platform') {
    restoredItem = await savePlatform(itemData, contentId);
  } else if (contentType === 'case_study') {
    restoredItem = await saveCaseStudy(itemData, contentId);
  } else if (contentType === 'settings') {
    restoredItem = await saveSiteSettings(itemData);
  } else if (contentType === 'about_us' || contentType === 'aboutus') {
    restoredItem = await saveAboutUs(itemData);
  } else if (contentType === 'popup_banner' || contentType === 'popup') {
    restoredItem = await savePopupBanner(itemData);
  } else {
    return { success: false, error: `Unsupported contentType for rollback: ${contentType}` };
  }

  const newVersion = await createContentVersion(
    contentType,
    contentId,
    versionRecord.title,
    itemData,
    `Rolled back content to Version #${version}`,
    createdByName
  );

  return { success: true, item: restoredItem, newVersion };
}

// ---------------------------------------------------------------------------
// Seeding — populate Postgres from bundled initial data when empty
// ---------------------------------------------------------------------------

export async function seedPostgresFromInitialData(): Promise<void> {
  await ensureReady();
  const existing = await one<{ c: number }>(`SELECT COUNT(*)::int AS c FROM site_settings`);
  if ((existing?.c ?? 0) > 0) return;

  console.log('[9xen:postgres] seeding initial CMS data...');
  await setDoc('site_settings', initialCmsData.settings);
  await setDoc('hero_content', initialCmsData.hero);
  await setDoc('about_us', initialCmsData.aboutUs);
  await setDoc('popup_banner', initialCmsData.popupBanner);

  for (const s of initialCmsData.services) await saveService(s, s.id);
  for (const p of initialCmsData.products) await saveProduct(p, p.id);
  for (const p of initialCmsData.platforms) await savePlatform(p, p.id);
  for (const m of initialCmsData.models) await saveModel(m, m.id);
  for (const t of initialCmsData.team) await saveTeamMember(t, t.id);
  for (const t of initialCmsData.testimonials) await saveTestimonial(t, t.id);
  for (const b of initialCmsData.blogPosts) await saveBlogPost(b, b.id, true);
  for (const c of initialCmsData.caseStudies) await saveCaseStudy(c, c.id);
  for (const c of initialCmsData.careers) await saveCareer(c, c.id);
  for (const f of initialCmsData.footerPages) await saveFooterPage(f, f.id, true);

  console.log('[9xen:postgres] initial CMS data seeded');
}

// ---------------------------------------------------------------------------
// Export — identical surface to the DuckDB-backed db object
// ---------------------------------------------------------------------------

export const dbPostgres = {
  getHero,
  updateHero,
  getServices,
  saveService,
  deleteService,
  getProducts,
  saveProduct,
  deleteProduct,
  getPlatforms,
  savePlatform,
  deletePlatform,
  getModels,
  saveModel,
  deleteModel,
  getBlogPosts,
  saveBlogPost,
  deleteBlogPost,
  getTeamMembers,
  saveTeamMember,
  deleteTeamMember,
  getTestimonials,
  saveTestimonial,
  deleteTestimonial,
  getCaseStudies,
  saveCaseStudy,
  deleteCaseStudy,
  getCareers,
  saveCareer,
  deleteCareer,
  getContactSubmissions,
  createContactSubmission,
  updateContactSubmissionStatus,
  getSiteSettings,
  saveSiteSettings,
  saveAboutUs,
  savePopupBanner,
  getCloudCredits,
  saveCloudCredit,
  deleteCloudCredit,
  getFooterPages,
  saveFooterPage,
  deleteFooterPage,
  getOutreachLeads,
  saveOutreachLead,
  deleteOutreachLead,
  getBookings,
  bookSlot,
  isSlotBooked,
  getOutreachTemplates,
  saveOutreachTemplate,
  deleteOutreachTemplate,
  getActivityLogs,
  createActivityLog,
  getAuditLogs,
  createAuditLog,
  getTranslation,
  saveTranslation,
  getFullCms,
  saveTelemetryLog,
  getTelemetryLogs,
  generateAllTablesAndSchemas,
  getDatabaseStats,
  getNewsletterSubscribers,
  subscribeNewsletter,
  deleteNewsletterSubscriber,
  getWebhookConfigs,
  saveWebhookConfig,
  deleteWebhookConfig,
  getAdmins,
  saveAdmin,
  deleteAdmin,
  getChatSessions,
  saveChatSession,
  deleteChatSession,
  getMedia,
  saveMedia,
  deleteMedia,
  executeRawQuery,
  createContentVersion,
  getContentVersions,
  getContentVersionById,
  rollbackContentVersion,
};


async function getPayments(): Promise<Payment[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM payments ORDER BY created_at DESC`);
  return rs.map((r) => ({
    id: r.id,
    invoiceId: r.invoice_id,
    subscriptionId: r.subscription_id,
    customerEmail: r.customer_email,
    customerName: r.customer_name,
    amount: Number(r.amount || 0),
    currency: r.currency,
    status: r.status,
    paymentMethod: r.payment_method,
    stripePaymentIntentId: r.stripe_payment_intent_id,
    stripeChargeId: r.stripe_charge_id,
    stripeInvoiceId: r.stripe_invoice_id,
    transactionId: r.transaction_id,
    description: r.description,
    metadata: r.metadata,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

async function savePayment(p: Partial<Payment>, id?: string): Promise<Payment> {
  await ensureReady();
  const targetId = id || p.id || `pay-${Date.now()}`;
  const now = new Date().toISOString();
  await query(
    `INSERT INTO payments (id, invoice_id, subscription_id, customer_email, customer_name, amount, currency, status, payment_method, stripe_payment_intent_id, stripe_charge_id, stripe_invoice_id, transaction_id, description, metadata, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     ON CONFLICT (id) DO UPDATE SET
       invoice_id = EXCLUDED.invoice_id,
       subscription_id = EXCLUDED.subscription_id,
       customer_email = EXCLUDED.customer_email,
       customer_name = EXCLUDED.customer_name,
       amount = EXCLUDED.amount,
       currency = EXCLUDED.currency,
       status = EXCLUDED.status,
       payment_method = EXCLUDED.payment_method,
       stripe_payment_intent_id = EXCLUDED.stripe_payment_intent_id,
       stripe_charge_id = EXCLUDED.stripe_charge_id,
       stripe_invoice_id = EXCLUDED.stripe_invoice_id,
       transaction_id = EXCLUDED.transaction_id,
       description = EXCLUDED.description,
       metadata = EXCLUDED.metadata,
       updated_at = EXCLUDED.updated_at`,
    [
      targetId,
      p.invoiceId || null,
      p.subscriptionId || null,
      p.customerEmail || '',
      p.customerName || null,
      p.amount || 0,
      p.currency || 'USD',
      p.status || 'pending',
      p.paymentMethod || null,
      p.stripePaymentIntentId || null,
      p.stripeChargeId || null,
      p.stripeInvoiceId || null,
      p.transactionId || null,
      p.description || null,
      J(p.metadata || null),
      p.createdAt || now,
      now,
    ]
  );
  const payments = await getPayments();
  return payments.find((x) => x.id === targetId) as Payment;
}



async function getPages(): Promise<Page[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM pages ORDER BY created_at DESC`);
  return rs.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    content: r.content,
    htmlContent: r.html_content,
    metaTitle: r.meta_title,
    metaDescription: r.meta_description,
    tags: r.tags || [],
    template: r.template,
    status: r.status,
    publishedAt: r.published_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

async function savePage(page: Partial<Page>, id?: string): Promise<Page> {
  await ensureReady();
  const targetId = id || page.id || `pg-${Date.now()}`;
  const now = new Date().toISOString();
  await query(
    `INSERT INTO pages (id, slug, title, content, html_content, meta_title, meta_description, tags, template, status, published_at, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     ON CONFLICT (id) DO UPDATE SET
       slug = EXCLUDED.slug,
       title = EXCLUDED.title,
       content = EXCLUDED.content,
       html_content = EXCLUDED.html_content,
       meta_title = EXCLUDED.meta_title,
       meta_description = EXCLUDED.meta_description,
       tags = EXCLUDED.tags,
       template = EXCLUDED.template,
       status = EXCLUDED.status,
       published_at = EXCLUDED.published_at,
       updated_at = EXCLUDED.updated_at`,
    [
      targetId,
      page.slug || targetId,
      page.title || 'New Page',
      page.content || null,
      page.htmlContent || null,
      page.metaTitle || null,
      page.metaDescription || null,
      J(page.tags || []),
      page.template || 'default',
      page.status || 'draft',
      page.publishedAt || null,
      page.createdAt || now,
      now,
    ]
  );
  const pages = await getPages();
  return pages.find((p) => p.id === targetId) as Page;
}

async function deletePage(id: string): Promise<boolean> {
  await ensureReady();
  await query(`DELETE FROM pages WHERE id = $1`, [id]);
  return true;
}

async function getDynamicContent(): Promise<DynamicContent[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM dynamic_content ORDER BY created_at DESC`);
  return rs.map((r) => ({
    id: r.id,
    key: r.key,
    contentType: r.content_type,
    content: r.content,
    data: r.data || {},
    locale: r.locale,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

async function saveDynamicContent(dc: Partial<DynamicContent>, id?: string): Promise<DynamicContent> {
  await ensureReady();
  const targetId = id || dc.id || `dc-${Date.now()}`;
  const now = new Date().toISOString();
  await query(
    `INSERT INTO dynamic_content (id, key, content_type, content, data, locale, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (id) DO UPDATE SET
       key = EXCLUDED.key,
       content_type = EXCLUDED.content_type,
       content = EXCLUDED.content,
       data = EXCLUDED.data,
       locale = EXCLUDED.locale,
       updated_at = EXCLUDED.updated_at`,
    [
      targetId,
      dc.key || targetId,
      dc.contentType || 'text',
      dc.content || null,
      J(dc.data || {}),
      dc.locale || 'en',
      dc.createdAt || now,
      now,
    ]
  );
  const items = await getDynamicContent();
  return items.find((i) => i.id === targetId) as DynamicContent;
}

async function deleteDynamicContent(id: string): Promise<boolean> {
  await ensureReady();
  await query(`DELETE FROM dynamic_content WHERE id = $1`, [id]);
  return true;
}



async function getCustomers(): Promise<any[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM customers ORDER BY created_at DESC`);
  return rs.map((r) => ({
    id: r.id,
    companyName: r.company_name,
    contactName: r.contact_name,
    email: r.email,
    phone: r.phone,
    website: r.website,
    industry: r.industry,
    employeeCount: r.employee_count,
    annualRevenue: Number(r.annual_revenue || 0),
    status: r.status,
    tier: r.tier,
    lifecycleStage: r.lifecycle_stage,
    leadSource: r.lead_source,
    assignedTo: r.assigned_to,
    tags: r.tags || [],
    customFields: r.custom_fields || {},
    address: r.address,
    billingAddress: r.billing_address,
    shippingAddress: r.shipping_address,
    socialProfiles: r.social_profiles,
    notes: r.notes,
    lastContactedAt: r.last_contacted_at,
    nextFollowUpAt: r.next_follow_up_at,
    convertedAt: r.converted_at,
    churnRisk: r.churn_risk,
    healthScore: r.health_score,
    lifetimeValue: Number(r.lifetime_value || 0),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

async function saveCustomer(c: any, id?: string): Promise<any> {
  await ensureReady();
  const targetId = id || c.id || `cust-${Date.now()}`;
  const now = new Date().toISOString();
  await query(
    `INSERT INTO customers (id, company_name, contact_name, email, phone, website, industry, employee_count, annual_revenue, status, tier, lifecycle_stage, lead_source, assigned_to, tags, custom_fields, address, billing_address, shipping_address, social_profiles, notes, last_contacted_at, next_follow_up_at, converted_at, churn_risk, health_score, lifetime_value, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29)
     ON CONFLICT (id) DO UPDATE SET
       company_name = EXCLUDED.company_name,
       contact_name = EXCLUDED.contact_name,
       email = EXCLUDED.email,
       phone = EXCLUDED.phone,
       website = EXCLUDED.website,
       industry = EXCLUDED.industry,
       employee_count = EXCLUDED.employee_count,
       annual_revenue = EXCLUDED.annual_revenue,
       status = EXCLUDED.status,
       tier = EXCLUDED.tier,
       lifecycle_stage = EXCLUDED.lifecycle_stage,
       lead_source = EXCLUDED.lead_source,
       assigned_to = EXCLUDED.assigned_to,
       tags = EXCLUDED.tags,
       custom_fields = EXCLUDED.custom_fields,
       address = EXCLUDED.address,
       billing_address = EXCLUDED.billing_address,
       shipping_address = EXCLUDED.shipping_address,
       social_profiles = EXCLUDED.social_profiles,
       notes = EXCLUDED.notes,
       last_contacted_at = EXCLUDED.last_contacted_at,
       next_follow_up_at = EXCLUDED.next_follow_up_at,
       converted_at = EXCLUDED.converted_at,
       churn_risk = EXCLUDED.churn_risk,
       health_score = EXCLUDED.health_score,
       lifetime_value = EXCLUDED.lifetime_value,
       updated_at = EXCLUDED.updated_at`,
    [
      targetId,
      c.companyName || null,
      c.contactName || '',
      c.email || '',
      c.phone || null,
      c.website || null,
      c.industry || null,
      c.employeeCount || null,
      c.annualRevenue || 0,
      c.status || 'lead',
      c.tier || 'standard',
      c.lifecycleStage || 'new',
      c.leadSource || null,
      c.assignedTo || null,
      J(c.tags || []),
      J(c.customFields || {}),
      J(c.address || null),
      J(c.billingAddress || null),
      J(c.shippingAddress || null),
      J(c.socialProfiles || null),
      c.notes || null,
      c.lastContactedAt || null,
      c.nextFollowUpAt || null,
      c.convertedAt || null,
      c.churnRisk || null,
      c.healthScore || null,
      c.lifetimeValue || 0,
      c.createdAt || now,
      now,
    ]
  );
  const items = await getCustomers();
  return items.find((x: any) => x.id === targetId);
}

async function deleteCustomer(id: string): Promise<boolean> {
  await ensureReady();
  await query(`DELETE FROM customers WHERE id = $1`, [id]);
  return true;
}

async function getCustomerCustomFields(): Promise<any[]> {
  await ensureReady();
  const rs = await rows<any>(`SELECT * FROM customer_custom_fields ORDER BY display_order ASC`);
  return rs.map((r) => ({
    id: r.id,
    name: r.name,
    fieldKey: r.field_key,
    fieldType: r.field_type,
    entityType: r.entity_type,
    options: r.options || [],
    isRequired: r.is_required,
    isSystem: r.is_system,
    displayOrder: r.display_order,
    active: r.active,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

async function saveCustomerCustomField(f: any, id?: string): Promise<any> {
  await ensureReady();
  const targetId = id || f.id || `ccf-${Date.now()}`;
  const now = new Date().toISOString();
  const fieldKey = f.fieldKey || f.name?.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  await query(
    `INSERT INTO customer_custom_fields (id, name, field_key, field_type, entity_type, options, is_required, is_system, display_order, active, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       field_type = EXCLUDED.field_type,
       entity_type = EXCLUDED.entity_type,
       options = EXCLUDED.options,
       is_required = EXCLUDED.is_required,
       display_order = EXCLUDED.display_order,
       active = EXCLUDED.active,
       updated_at = EXCLUDED.updated_at`,
    [
      targetId,
      f.name || '',
      fieldKey,
      f.fieldType || 'text',
      f.entityType || 'customer',
      J(f.options || []),
      f.isRequired || false,
      f.isSystem || false,
      f.displayOrder || 0,
      f.active !== false,
      f.createdAt || now,
      now,
    ]
  );
  const items = await getCustomerCustomFields();
  return items.find((x: any) => x.id === targetId);
}

