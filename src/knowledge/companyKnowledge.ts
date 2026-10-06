export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: 'product' | 'service' | 'billing' | 'technical' | 'general';
  tags: string[];
  source: string;
  lastUpdated: string;
}

export const companyKnowledgeBase: KnowledgeEntry[] = [
  {
    id: 'kb-1',
    title: '9xen Platform Overview',
    content: '9xen is an enterprise AI platform providing autonomous agents, RAG systems, CRM, CMS, billing, and analytics for modern businesses.',
    category: 'general',
    tags: ['overview', 'platform', '9xen'],
    source: 'docs',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'kb-2',
    title: 'Pricing & Plans',
    content: 'We offer flexible pricing with Starter, Professional, and Enterprise plans. Contact sales for custom pricing and volume discounts.',
    category: 'billing',
    tags: ['pricing', 'plans', 'cost'],
    source: 'pricing',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'kb-3',
    title: 'API Documentation',
    content: '9xen provides RESTful APIs for CRM, CMS, billing, and chatbot. All API calls require authentication tokens. Base URL: /api',
    category: 'technical',
    tags: ['api', 'docs', 'integration'],
    source: 'api-docs',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'kb-4',
    title: 'Invoice Management',
    content: 'Users can view and manage invoices via the billing portal. Payments support multiple gateways including Stripe and international options.',
    category: 'billing',
    tags: ['invoice', 'payment', 'billing'],
    source: 'billing-docs',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'kb-5',
    title: 'Getting Started',
    content: 'Start by creating an account, exploring the dashboard, configuring agents, and connecting your data sources.',
    category: 'general',
    tags: ['start', 'guide', 'onboarding'],
    source: 'onboarding',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'kb-6',
    title: 'RAG & Vector Database',
    content: '9xen includes built-in RAG with local vector storage and LanceDB integration. Embeddings are stored locally in the project folder.',
    category: 'technical',
    tags: ['rag', 'vector', 'embeddings', 'lancedb'],
    source: 'tech-docs',
    lastUpdated: new Date().toISOString(),
  },
];

export function searchKnowledge(query: string): KnowledgeEntry[] {
  const lower = query.toLowerCase();
  return companyKnowledgeBase.filter(entry =>
    entry.title.toLowerCase().includes(lower) ||
    entry.content.toLowerCase().includes(lower) ||
    entry.tags.some(t => t.includes(lower))
  ).slice(0, 3);
}
