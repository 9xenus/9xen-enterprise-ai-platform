-- 9xen Enterprise Platform — PostgreSQL / Supabase schema
-- Idempotent DDL. Applied automatically at server boot by src/lib/postgres.ts
-- Deploy this on Supabase (or any PostgreSQL 15+) instance.

-- ============================================================================
-- Document-style tables (single-row settings / hero / about / popup)
-- ============================================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id VARCHAR(64) PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hero_content (
  id VARCHAR(64) PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS about_us (
  id VARCHAR(64) PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS popup_banner (
  id VARCHAR(64) PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Services
-- ============================================================================
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(120) PRIMARY KEY,
  title VARCHAR(300),
  category VARCHAR(120),
  short_description TEXT,
  full_description TEXT,
  icon_name VARCHAR(120),
  features JSONB DEFAULT '[]'::jsonb,
  order_num INTEGER DEFAULT 0,
  highlighted BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- Products
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(120) PRIMARY KEY,
  title VARCHAR(300),
  slug VARCHAR(160),
  category VARCHAR(120),
  tagline TEXT,
  short_description TEXT,
  full_description TEXT,
  icon_name VARCHAR(120),
  pricing_model VARCHAR(120),
  features JSONB DEFAULT '[]'::jsonb,
  specs JSONB DEFAULT '[]'::jsonb,
  badge VARCHAR(80),
  demo_url VARCHAR(500),
  image_url VARCHAR(500),
  spec_sheet_url VARCHAR(500),
  order_num INTEGER DEFAULT 0,
  highlighted BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- Platforms
-- ============================================================================
CREATE TABLE IF NOT EXISTS platforms (
  id VARCHAR(120) PRIMARY KEY,
  name VARCHAR(300),
  slug VARCHAR(160),
  tagline TEXT,
  category VARCHAR(120),
  description TEXT,
  key_features JSONB DEFAULT '[]'::jsonb,
  stats JSONB DEFAULT '[]'::jsonb,
  demo_url VARCHAR(500),
  image_url VARCHAR(500),
  spec_sheet_url VARCHAR(500),
  badge VARCHAR(80),
  icon_name VARCHAR(120),
  order_num INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- Foundation Models
-- ============================================================================
CREATE TABLE IF NOT EXISTS models (
  id VARCHAR(120) PRIMARY KEY,
  name VARCHAR(300),
  badge VARCHAR(80),
  tagline TEXT,
  description TEXT,
  context_window VARCHAR(60),
  max_output VARCHAR(60),
  speed VARCHAR(60),
  input_price VARCHAR(60),
  output_price VARCHAR(60),
  benchmarks JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  best_for JSONB DEFAULT '[]'::jsonb,
  order_num INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- Team
-- ============================================================================
CREATE TABLE IF NOT EXISTS team_members (
  id VARCHAR(120) PRIMARY KEY,
  name VARCHAR(300),
  role VARCHAR(200),
  department VARCHAR(200),
  bio TEXT,
  photo_url VARCHAR(500),
  socials JSONB DEFAULT '{}'::jsonb,
  order_num INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- Testimonials
-- ============================================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id VARCHAR(120) PRIMARY KEY,
  quote TEXT,
  author VARCHAR(300),
  role VARCHAR(200),
  company VARCHAR(300),
  avatar_url VARCHAR(500),
  rating INTEGER DEFAULT 5,
  order_num INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- Blog posts
-- ============================================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id VARCHAR(120) PRIMARY KEY,
  slug VARCHAR(200),
  title VARCHAR(400),
  excerpt TEXT,
  body TEXT,
  cover_image VARCHAR(500),
  tags JSONB DEFAULT '[]'::jsonb,
  publish_date VARCHAR(60),
  status VARCHAR(30) DEFAULT 'published',
  featured BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  author_name VARCHAR(300),
  author_role VARCHAR(200),
  author_avatar VARCHAR(500)
);

-- ============================================================================
-- Case studies
-- ============================================================================
CREATE TABLE IF NOT EXISTS case_studies (
  id VARCHAR(120) PRIMARY KEY,
  slug VARCHAR(200),
  title VARCHAR(400),
  client VARCHAR(300),
  industry VARCHAR(200),
  impact_metric VARCHAR(200),
  summary TEXT,
  body TEXT,
  cover_image VARCHAR(500),
  tags JSONB DEFAULT '[]'::jsonb,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- Careers
-- ============================================================================
CREATE TABLE IF NOT EXISTS careers (
  id VARCHAR(120) PRIMARY KEY,
  title VARCHAR(300),
  department VARCHAR(200),
  location VARCHAR(200),
  type VARCHAR(60),
  description TEXT,
  requirements JSONB DEFAULT '[]'::jsonb,
  apply_link VARCHAR(500),
  active BOOLEAN DEFAULT TRUE,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- Contact submissions
-- ============================================================================
CREATE TABLE IF NOT EXISTS contact_submissions (
  id VARCHAR(120) PRIMARY KEY,
  name VARCHAR(300),
  email VARCHAR(300),
  company VARCHAR(300),
  subject VARCHAR(300),
  message TEXT,
  attachment_url VARCHAR(500),
  attachment_name VARCHAR(300),
  status VARCHAR(40) DEFAULT 'new',
  created_at VARCHAR(60)
);

-- ============================================================================
-- Footer pages (legal etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS footer_pages (
  id VARCHAR(120) PRIMARY KEY,
  slug VARCHAR(200) UNIQUE,
  title VARCHAR(300),
  content TEXT,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- Content versioning / audit
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_versions (
  id VARCHAR(120) PRIMARY KEY,
  content_type VARCHAR(80),
  content_id VARCHAR(120),
  version INTEGER,
  title VARCHAR(400),
  data JSONB,
  change_summary TEXT,
  created_by_name VARCHAR(300),
  created_by_email VARCHAR(300),
  created_at VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS cloud_credits (
  id VARCHAR(120) PRIMARY KEY,
  provider VARCHAR(60),
  service VARCHAR(200),
  limit_val DOUBLE PRECISION,
  used DOUBLE PRECISION,
  unit VARCHAR(40),
  reset_date VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id VARCHAR(120) PRIMARY KEY,
  email VARCHAR(300) UNIQUE,
  subscribed BOOLEAN DEFAULT TRUE,
  created_at VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id VARCHAR(120) PRIMARY KEY,
  action VARCHAR(120),
  target VARCHAR(120),
  target_id VARCHAR(120),
  performed_by VARCHAR(300),
  timestamp VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(120) PRIMARY KEY,
  action VARCHAR(200),
  "user" VARCHAR(300),
  timestamp VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS translations_cache (
  id VARCHAR(120) PRIMARY KEY,
  source_text TEXT,
  target_language VARCHAR(20),
  translated_text TEXT,
  created_at VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS ai_telemetry_logs (
  id VARCHAR(120) PRIMARY KEY,
  timestamp VARCHAR(60),
  model VARCHAR(120),
  user_message TEXT,
  tokens_estimated INTEGER,
  latency_ms INTEGER,
  status VARCHAR(40)
);

-- ============================================================================
-- Outreach / CRM
-- ============================================================================
CREATE TABLE IF NOT EXISTS outreach_leads (
  id VARCHAR(120) PRIMARY KEY,
  lead_id VARCHAR(120),
  name VARCHAR(300),
  email VARCHAR(300),
  company VARCHAR(300),
  solution_of_interest VARCHAR(300),
  intent_score VARCHAR(60),
  classification_tag VARCHAR(120),
  confidence_score INTEGER,
  buying_signals JSONB DEFAULT '[]'::jsonb,
  classification_reason TEXT,
  suggested_action TEXT,
  sentiment JSONB,
  intent_reason TEXT,
  aum_or_budget VARCHAR(120),
  user_message TEXT,
  suggested_subject TEXT,
  suggested_draft_response TEXT,
  status VARCHAR(60) DEFAULT 'Pending Review',
  stage VARCHAR(80) DEFAULT 'New Inquiry',
  demo_scheduled_at VARCHAR(60),
  demo_meeting_type VARCHAR(80),
  demo_notes TEXT,
  custom_notes TEXT,
  conversation_summary TEXT,
  submitted_at VARCHAR(60),
  updated_at VARCHAR(60),
  sent_at VARCHAR(60),
  source VARCHAR(80),
  inquiry_type VARCHAR(80)
);

CREATE TABLE IF NOT EXISTS outreach_templates (
  id VARCHAR(120) PRIMARY KEY,
  name VARCHAR(300),
  category VARCHAR(120),
  target_solution_keywords JSONB DEFAULT '[]'::jsonb,
  subject_template TEXT,
  body_template TEXT,
  system_prompt_instructions TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  updated_at VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS webhook_configs (
  id VARCHAR(120) PRIMARY KEY,
  name VARCHAR(300),
  url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  type VARCHAR(60),
  updated_at VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(120) PRIMARY KEY,
  name VARCHAR(300),
  email VARCHAR(300) UNIQUE,
  role VARCHAR(60) DEFAULT 'admin',
  last_login VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id VARCHAR(120) PRIMARY KEY,
  title VARCHAR(400),
  model VARCHAR(120),
  persona VARCHAR(60),
  updated_at BIGINT,
  messages JSONB DEFAULT '[]'::jsonb,
  is_pinned BOOLEAN DEFAULT FALSE,
  user_context JSONB
);

CREATE TABLE IF NOT EXISTS calendar_bookings (
  id VARCHAR(120) PRIMARY KEY,
  name VARCHAR(300),
  email VARCHAR(300),
  company VARCHAR(300),
  date VARCHAR(40),
  slot VARCHAR(120),
  meeting_type VARCHAR(80),
  topic TEXT,
  status VARCHAR(40) DEFAULT 'confirmed',
  created_at VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS media (
  id VARCHAR(120) PRIMARY KEY,
  url VARCHAR(500),
  filename VARCHAR(300),
  mime_type VARCHAR(120),
  size INTEGER,
  created_at VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS ai_content_summaries_cache (
  id VARCHAR(120) PRIMARY KEY,
  content_id VARCHAR(120),
  content_type VARCHAR(80),
  summary_text TEXT,
  model_used VARCHAR(120),
  created_at VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS feature_flags_registry (
  id VARCHAR(120) PRIMARY KEY,
  flag_key VARCHAR(120),
  is_enabled BOOLEAN DEFAULT FALSE,
  description TEXT,
  rollout_percentage INTEGER DEFAULT 0,
  updated_at VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS system_metrics_telemetry (
  id VARCHAR(120) PRIMARY KEY,
  metric_name VARCHAR(200),
  metric_value DOUBLE PRECISION,
  unit VARCHAR(40),
  node_id VARCHAR(120),
  timestamp VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS user_reading_bookmarks (
  id VARCHAR(120) PRIMARY KEY,
  user_email VARCHAR(300),
  content_id VARCHAR(120),
  content_type VARCHAR(80),
  title VARCHAR(400),
  saved_at VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS api_rate_limits_audit (
  id VARCHAR(120) PRIMARY KEY,
  client_ip VARCHAR(60),
  endpoint VARCHAR(200),
  request_count INTEGER DEFAULT 0,
  last_request_at VARCHAR(60)
);

-- ============================================================================
-- Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_services_order ON services (order_num) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_products_order ON products (order_num) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_products_slug ON products (slug) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_platforms_order ON platforms (order_num) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_models_order ON models (order_num) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts (slug) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_blog_posts_publish ON blog_posts (publish_date DESC) WHERE is_deleted = FALSE AND status = 'published';
CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON case_studies (slug) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_careers_active ON careers (active) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_contact_sub_status ON contact_submissions (status);
CREATE INDEX IF NOT EXISTS idx_outreach_leads_status ON outreach_leads (status);
CREATE INDEX IF NOT EXISTS idx_outreach_leads_email ON outreach_leads (email);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated ON chat_sessions (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_calendar_bookings_date_slot ON calendar_bookings (date, slot);
CREATE INDEX IF NOT EXISTS idx_content_versions_lookup ON content_versions (content_type, content_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_ai_telemetry_timestamp ON ai_telemetry_logs (timestamp DESC);

-- Invoices, subscriptions, and billing
CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(120) PRIMARY KEY,
  invoice_number VARCHAR(80) UNIQUE NOT NULL,
  customer_name VARCHAR(200),
  customer_email VARCHAR(200) NOT NULL,
  company VARCHAR(200),
  status VARCHAR(40) NOT NULL DEFAULT 'draft',
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  due_date TIMESTAMP,
  paid_at TIMESTAMP,
  issued_at TIMESTAMP,
  items JSONB,
  notes TEXT,
  billing_address JSONB,
  stripe_invoice_id VARCHAR(200),
  stripe_payment_intent_id VARCHAR(200),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id VARCHAR(120) PRIMARY KEY,
  customer_name VARCHAR(200),
  customer_email VARCHAR(200) NOT NULL,
  company VARCHAR(200),
  status VARCHAR(40) NOT NULL DEFAULT 'trialing',
  plan VARCHAR(100) NOT NULL,
  product_id VARCHAR(120),
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  interval VARCHAR(20) NOT NULL DEFAULT 'month',
  interval_count INTEGER NOT NULL DEFAULT 1,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP,
  trial_ends_at TIMESTAMP,
  next_invoice_at TIMESTAMP,
  stripe_subscription_id VARCHAR(200) UNIQUE,
  stripe_customer_id VARCHAR(200),
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(120) PRIMARY KEY,
  invoice_id VARCHAR(120),
  subscription_id VARCHAR(120),
  customer_email VARCHAR(200) NOT NULL,
  customer_name VARCHAR(200),
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(100),
  stripe_payment_intent_id VARCHAR(200) UNIQUE,
  stripe_charge_id VARCHAR(200),
  stripe_invoice_id VARCHAR(200),
  transaction_id VARCHAR(200),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_customer_email ON invoices (customer_email);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices (status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices (due_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_email ON subscriptions (customer_email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_payments_customer_email ON payments (customer_email);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments (invoice_id);

CREATE TABLE IF NOT EXISTS pages (
  id VARCHAR(120) PRIMARY KEY,
  slug VARCHAR(200) UNIQUE NOT NULL,
  title VARCHAR(300) NOT NULL,
  content TEXT,
  html_content TEXT,
  meta_title VARCHAR(300),
  meta_description TEXT,
  tags JSONB,
  template VARCHAR(100) DEFAULT 'default',
  status VARCHAR(40) NOT NULL DEFAULT 'published',
  published_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS page_blocks (
  id VARCHAR(120) PRIMARY KEY,
  page_id VARCHAR(120) NOT NULL,
  block_type VARCHAR(100) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dynamic_content (
  id VARCHAR(120) PRIMARY KEY,
  key VARCHAR(200) UNIQUE NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  content TEXT,
  data JSONB NOT NULL DEFAULT '{}',
  locale VARCHAR(20) DEFAULT 'en',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS content_templates (
  id VARCHAR(120) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(100) NOT NULL,
  content TEXT,
  variables JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_schedules (
  id VARCHAR(120) PRIMARY KEY,
  content_id VARCHAR(120),
  content_type VARCHAR(100),
  scheduled_at TIMESTAMP NOT NULL,
  published_at TIMESTAMP,
  status VARCHAR(40) NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_library (
  id VARCHAR(120) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  mime_type VARCHAR(100),
  size BIGINT,
  url VARCHAR(500),
  alt_text TEXT,
  caption TEXT,
  tags JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_versions_extended (
  id VARCHAR(120) PRIMARY KEY,
  content_type VARCHAR(100) NOT NULL,
  content_id VARCHAR(120) NOT NULL,
  version INTEGER NOT NULL,
  title VARCHAR(300),
  data JSONB NOT NULL,
  created_by VARCHAR(200),
  change_summary TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(120) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  type VARCHAR(40) NOT NULL DEFAULT 'both',
  parent_id VARCHAR(120),
  description TEXT,
  image_url VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seo_settings (
  id VARCHAR(120) PRIMARY KEY,
  domain VARCHAR(200),
  default_meta_title VARCHAR(300),
  default_meta_description TEXT,
  default_og_image VARCHAR(500),
  twitter_handle VARCHAR(100),
  schema_org JSONB,
  robots_txt TEXT,
  sitemap_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seo_pages (
  id VARCHAR(120) PRIMARY KEY,
  page_id VARCHAR(120),
  url VARCHAR(500),
  meta_title VARCHAR(300),
  meta_description TEXT,
  canonical_url VARCHAR(500),
  og_title VARCHAR(300),
  og_description TEXT,
  og_image VARCHAR(500),
  og_type VARCHAR(50),
  twitter_card VARCHAR(50),
  schema JSONB,
  focus_keyword VARCHAR(200),
  hreflang JSONB,
  geo_region VARCHAR(100),
  geo_placename VARCHAR(200),
  geo_position VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS redirects (
  id VARCHAR(120) PRIMARY KEY,
  from_path VARCHAR(500) NOT NULL,
  to_path VARCHAR(500) NOT NULL,
  status_code INTEGER DEFAULT 301,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sitemaps (
  id VARCHAR(120) PRIMARY KEY,
  filename VARCHAR(200) NOT NULL,
  urls JSONB NOT NULL,
  generated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(120) PRIMARY KEY,
  company_name VARCHAR(200),
  contact_name VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  phone VARCHAR(100),
  website VARCHAR(200),
  industry VARCHAR(150),
  employee_count INTEGER,
  annual_revenue NUMERIC(15,2),
  status VARCHAR(50) NOT NULL DEFAULT 'lead',
  tier VARCHAR(50) DEFAULT 'standard',
  lifecycle_stage VARCHAR(80) DEFAULT 'new',
  lead_source VARCHAR(150),
  assigned_to VARCHAR(200),
  tags JSONB,
  custom_fields JSONB DEFAULT '{}',
  address JSONB,
  billing_address JSONB,
  shipping_address JSONB,
  social_profiles JSONB,
  notes TEXT,
  last_contacted_at TIMESTAMP,
  next_follow_up_at TIMESTAMP,
  converted_at TIMESTAMP,
  churn_risk VARCHAR(50),
  health_score INTEGER,
  lifetime_value NUMERIC(15,2),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_contacts (
  id VARCHAR(120) PRIMARY KEY,
  customer_id VARCHAR(120) NOT NULL,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  phone VARCHAR(100),
  job_title VARCHAR(150),
  department VARCHAR(150),
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_custom_fields (
  id VARCHAR(120) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  field_key VARCHAR(150) UNIQUE NOT NULL,
  field_type VARCHAR(50) NOT NULL DEFAULT 'text',
  entity_type VARCHAR(50) DEFAULT 'customer',
  options JSONB,
  is_required BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_interactions (
  id VARCHAR(120) PRIMARY KEY,
  customer_id VARCHAR(120) NOT NULL,
  interaction_type VARCHAR(100) NOT NULL,
  subject VARCHAR(250),
  content TEXT,
  channel VARCHAR(100),
  direction VARCHAR(50),
  duration_minutes INTEGER,
  performed_by VARCHAR(200),
  related_id VARCHAR(120),
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_blocks (
  id VARCHAR(120) PRIMARY KEY,
  name VARCHAR(200) UNIQUE NOT NULL,
  category VARCHAR(100),
  html TEXT,
  css TEXT,
  js TEXT,
  data JSONB DEFAULT '{}',
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS form_builder (
  id VARCHAR(120) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  fields JSONB NOT NULL DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  submissions_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_workflows (
  id VARCHAR(120) PRIMARY KEY,
  content_type VARCHAR(100) NOT NULL,
  content_id VARCHAR(120) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  assigned_to VARCHAR(200),
  reviewed_by VARCHAR(200),
  review_notes TEXT,
  due_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS taxonomies (
  id VARCHAR(120) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL,
  type VARCHAR(80) NOT NULL,
  parent_id VARCHAR(120),
  description TEXT,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(slug, type)
);
