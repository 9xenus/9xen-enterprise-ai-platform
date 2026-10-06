export interface AboutUsMilestone {
  year: string;
  title: string;
  desc: string;
}

export interface AboutUsContent {
  headline: string;
  subheadline: string;
  mission: string;
  vision: string;
  milestones: AboutUsMilestone[];
  pillars: { title: string; subtitle: string; iconName: string }[];
}

export interface HeroBanner {
  id: string;
  badgeText: string;
  headline: string;
  subheadline: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
  imageUrl: string;
}

export interface HeroGeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  createdAt: string;
}

export interface HeroContent {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaPrimaryText?: string;
  ctaPrimaryLink?: string;
  ctaSecondaryText?: string;
  ctaSecondaryLink?: string;
  badge?: string;
  badgeText?: string;
  stats?: { label: string; value: string }[];
  metrics?: { label: string; value: string }[];
  heroPillars?: { title: string; subtitle: string; iconName: string }[];
  banners?: HeroBanner[];
  backgroundImageUrl?: string;
  backgroundImagePrompt?: string;
  backgroundOverlayOpacity?: number;
  backgroundBlur?: number;
  generatedHistory?: HeroGeneratedImage[];
}

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  detailedDescription?: string;
  pricingLabel?: string;
  techStack?: string[];
  iconName: string; // Lucide icon identifier
  features: string[];
  imageUrl?: string;
  order: number;
  highlighted?: boolean;
}

export interface ProductItem {
  id: string;
  title: string;
  slug: string;
  category: 'Autonomous Agents' | 'RegTech Engine' | 'Neural Developer Tools' | 'Enterprise OS' | 'AI Security' | 'Chatbots' | 'Quantitative Trading' | string;
  tagline: string;
  shortDescription: string;
  fullDescription: string;
  iconName: string;
  pricingModel: string;
  features: string[];
  specs: { label: string; value: string }[];
  badge?: string;
  demoUrl?: string;
  imageUrl?: string;
  specSheetUrl?: string;
  order: number;
  highlighted?: boolean;
}

export interface PlatformItem {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  category: 'RegTech' | 'Enterprise OS' | 'Automation';
  description: string;
  keyFeatures: string[];
  stats: { label: string; value: string }[];
  demoUrl?: string;
  imageUrl?: string;
  specSheetUrl?: string;
  badge?: string;
  iconName: string;
  order: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  photoUrl: string;
  socials: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  order: number;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatarUrl: string;
  rating: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string; // Rich text / HTML
  coverImage: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  tags: string[];
  publishDate: string;
  status: 'published' | 'draft';
  featured?: boolean;
}

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  client: string;
  industry: string;
  impactMetric: string;
  summary: string;
  body: string;
  coverImage: string;
  tags: string[];
}

export interface CareerListing {
  id: string;
  title: string;
  department: string;
  location: string; // e.g. "Remote / New York"
  type: 'Full-time' | 'Contract' | 'Part-time';
  description: string;
  requirements: string[];
  applyLink: string;
  active: boolean;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: string;
  status: 'unread' | 'read' | 'replied';
}

export interface PopupBanner {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  isActive: boolean;
}

export interface FooterLink {
  label: string;
  tab: string;
}

import { MailProviderConfig } from './mail';

export interface ChatbotConfig {
  enabled?: boolean;
  botName?: string;
  botTitle?: string;
  avatarUrl?: string;
  greeting?: string;
  placeholder?: string;
  quickPrompts?: string[];
  models?: { id: string; label: string; desc: string }[];
  defaultModel?: string;
  temperature?: number;
  customSystemPrompt?: string;
  personaPreset?: 'sales' | 'technical' | 'executive' | 'creative';
  leadCaptureEnabled?: boolean;
  requireContact?: boolean;
  autoOpenDelay?: number;
  position?: 'bottom-right' | 'bottom-left';
  themeColor?: 'cyan' | 'indigo' | 'emerald' | 'violet';
  autoQualifyScore?: number;
  webhookNotification?: boolean;
  bookingUrl?: string;
}

export interface SiteSettings {
  companyName: string;
  tagline: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  footerText: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    discord?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
  };
  smtp?: {
    host?: string;
    port?: number;
    secure?: boolean;
    authEmail?: string;
    authPass?: string;
    senderEmail?: string;
  };
  mailProviderConfig?: MailProviderConfig;
  chatbot?: ChatbotConfig;
  systemConfig?: {
    enableAiAssistant?: boolean;
    maintenanceMode?: boolean;
    primaryColor?: string;
    themeMode?: 'dark' | 'light' | 'system';
  };
  footerLinks?: FooterLink[];
}

export interface CloudCreditUsage {
  id: string;
  provider: 'AWS' | 'GCP' | 'DuckDB';
  service: string;
  limit: number;
  used: number;
  unit: string;
  resetDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FooterPage {
  id: string;
  slug: string;
  title: string;
  content: string; // Rich Text / HTML
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'editor' | 'viewer';
  lastLogin: string;
}

export interface LeadSentimentAnalysis {
  tone: string;
  polarity: 'urgent' | 'positive' | 'neutral' | 'skeptical' | 'frustrated';
  score: number;
  priorityLevel: 'P1 - Immediate' | 'P2 - High' | 'P3 - Standard';
  emotionalTriggers: string[];
  recommendedTone: string;
  summary: string;
  analyzedAt: string;
}

export interface OutreachLead {
  id: string;
  leadId?: string;
  name: string;
  email: string;
  company?: string;
  solutionOfInterest: string;
  intentScore: 'Critical' | 'High' | 'Medium';
  classificationTag?: 'High Intent' | 'Informational';
  confidenceScore?: number;
  buyingSignals?: string[];
  classificationReason?: string;
  suggestedAction?: string;
  sentiment?: LeadSentimentAnalysis;
  intentReason: string;
  aumOrBudget?: string;
  userMessage?: string;
  suggestedDraftResponse: string;
  suggestedSubject: string;
  status: 'Pending Review' | 'Approved & Sent' | 'Archived';
  stage?: 'New Inquiry' | 'Outreach Sent' | 'Demo Scheduled' | 'Closed';
  demoScheduledAt?: string;
  demoMeetingType?: string;
  demoNotes?: string;
  submittedAt: string;
  updatedAt?: string;
  sentAt?: string;
  customNotes?: string;
  agentSource?: string;
}

export interface OutreachTemplate {
  id: string;
  name: string;
  category: 'High Intent' | 'Informational' | 'General Enterprise' | 'Custom';
  targetSolutionKeywords: string[];
  subjectTemplate: string;
  bodyTemplate: string;
  systemPromptInstructions: string;
  isDefault?: boolean;
  updatedAt: string;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  type: 'hubspot' | 'salesforce' | 'zoho' | 'slack' | 'discord' | 'zapier' | 'make' | 'custom';
  description?: string;
  secretToken?: string;
  customHeaders?: string;
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'failed';
  lastStatusCode?: number;
  lastLatencyMs?: number;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  isStreaming?: boolean;
  modelUsed?: string;
  latencyMs?: number;
  suggestedFollowUps?: string[];
  actionLink?: {
    type: 'contact' | 'demo';
    solutionName: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
  model: string;
  persona: 'standard' | 'technical' | 'executive' | 'creative';
  isPinned?: boolean;
  userContext?: {
    name: string;
    email: string;
    mobile: string;
  };
}

export interface ContentVersion {
  id: string;
  contentType: string; // 'blog' | 'footer_page' | 'hero' | 'service' | 'product' | 'platform' | 'case_study' | 'about_us' | 'settings' | string;
  contentId: string;
  version: number;
  title: string;
  data: any;
  changeSummary?: string;
  createdByName?: string;
  createdByEmail?: string;
  createdAt: string;
}

export interface AiModelItem {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  contextWindow: string;
  maxOutput: string;
  speed: string;
  inputPrice: string;
  outputPrice: string;
  benchmarks: { label: string; score: string }[];
  features: string[];
  bestFor: string;
  order?: number;
  isDeleted?: boolean;
}

export interface CmsDatabase {
  submissions?: any[];
  media?: any[];
  chatSessions?: ChatSession[];
  outreachQueue?: OutreachLead[];
  outreachTemplates?: OutreachTemplate[];
  webhookConfigs?: WebhookConfig[];
  newsletterSubscribers?: string[];
  contentVersions?: ContentVersion[];
  hero: HeroContent;
  aboutUs: AboutUsContent;
  services: ServiceItem[];
  products: ProductItem[];
  platforms: PlatformItem[];
  models: AiModelItem[];
  team: TeamMember[];
  testimonials: Testimonial[];
  blogPosts: BlogPost[];
  caseStudies: CaseStudy[];
  careers: CareerListing[];
  contactSubmissions: ContactSubmission[];
  settings: SiteSettings;
  footerPages: FooterPage[];
  cloudCredits: CloudCreditUsage[];
  popupBanner: PopupBanner;
  admins: AdminUser[];
  auditLogs?: Array<{ id: string; action: string; user: string; timestamp: string }>;
}

export interface ActivityLog {
  id: string;
  action: string;
  target: string;
  targetId: string;
  performedBy: string;
  timestamp: string;
}

export type Service = ServiceItem;
export type Product = ProductItem;
export type Platform = PlatformItem;
export type Career = CareerListing;


export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface BillingAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName?: string;
  customerEmail: string;
  company?: string;
  status: 'draft' | 'issued' | 'sent' | 'paid' | 'overdue' | 'void' | 'canceled';
  currency: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  dueDate?: string;
  paidAt?: string;
  issuedAt?: string;
  items: InvoiceItem[];
  notes?: string;
  billingAddress?: BillingAddress;
  stripeInvoiceId?: string;
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  customerName?: string;
  customerEmail: string;
  company?: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'paused';
  plan: string;
  productId?: string;
  currency: string;
  amount: number;
  interval: 'day' | 'week' | 'month' | 'year';
  intervalCount: number;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: string;
  trialEndsAt?: string;
  nextInvoiceAt?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId?: string;
  subscriptionId?: string;
  customerEmail: string;
  customerName?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded';
  paymentMethod?: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeInvoiceId?: string;
  transactionId?: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
export interface Page {
  id: string;
  slug: string;
  title: string;
  content?: string;
  htmlContent?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
  template?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageBlock {
  id: string;
  pageId: string;
  blockType: string;
  orderIndex: number;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface DynamicContent {
  id: string;
  key: string;
  contentType: string;
  content?: string;
  data: Record<string, any>;
  locale: string;
  createdAt: string;
  updatedAt: string;
}
