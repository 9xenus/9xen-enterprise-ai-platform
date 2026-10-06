import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { db } from '../../lib/db';
import { retrieveChunks } from './rag';

/**
 * 9xen Enterprise Platform — LangChain tools for the deep agent.
 *
 * These tools give the agent live access to the CMS catalog, calendar
 * booking, and lead capture — all backed by the Postgres/DuckDB CMS layer.
 */

export const searchCmsTool = new DynamicStructuredTool({
  name: 'search_cms_catalog',
  description:
    'Search the 9xen product, service, platform, model, blog, case study, and career catalog. ' +
    'Use this to answer questions about 9xen offerings, pricing, features, and specifications.',
  schema: z.object({
    query: z.string().describe('Natural-language search query, e.g. "compliance SaaS for SEC 17a-4"'),
    contentType: z
      .enum(['product', 'service', 'platform', 'model', 'blog', 'case_study', 'career', 'footer_page'])
      .optional()
      .describe('Optional content-type filter'),
    topK: z.number().int().min(1).max(10).optional().describe('Number of results (default 5)'),
  }),
  func: async ({ query, contentType, topK = 5 }) => {
    const chunks = await retrieveChunks(query, topK, contentType);
    if (chunks.length === 0) {
      return 'No matching catalog entries found.';
    }
    return chunks
      .map((c, i) => `${i + 1}. [${c.doc.metadata.contentType}] ${c.doc.metadata.title} (score: ${c.score.toFixed(2)})\n${c.doc.text}`)
      .join('\n\n');
  },
});

export const getProductDetailsTool = new DynamicStructuredTool({
  name: 'get_product_details',
  description: 'Get full details of a specific 9xen product by name or id, including pricing, features, and specs.',
  schema: z.object({
    identifier: z.string().describe('Product name, slug, or id'),
  }),
  func: async ({ identifier }) => {
    const products = await db.getProducts();
    const match =
      products.find((p) => p.id === identifier) ||
      products.find((p) => p.title?.toLowerCase() === identifier.toLowerCase()) ||
      products.find((p) => p.slug === identifier) ||
      products.find((p) => p.title?.toLowerCase().includes(identifier.toLowerCase()));
    if (!match) return `Product "${identifier}" not found.`;
    return JSON.stringify(
      {
        id: match.id,
        title: match.title,
        category: match.category,
        tagline: match.tagline,
        shortDescription: match.shortDescription,
        fullDescription: match.fullDescription,
        pricingModel: match.pricingModel,
        features: match.features,
        specs: match.specs,
        badge: match.badge,
        demoUrl: match.demoUrl,
      },
      null,
      2
    );
  },
});

export const checkCalendarTool = new DynamicStructuredTool({
  name: 'check_calendar_availability',
  description: 'Check available meeting slots for a given date (YYYY-MM-DD). Use before proposing demo times.',
  schema: z.object({
    date: z.string().describe('Date in YYYY-MM-DD format'),
  }),
  func: async ({ date }) => {
    const baseSlots = [
      '10:00 AM EST (15:00 UTC)',
      '11:30 AM EST (16:30 UTC)',
      '02:00 PM EST (19:00 UTC)',
      '04:00 PM EST (21:00 UTC)',
      '08:00 PM EST (Asia Open)',
    ];
    const available: string[] = [];
    for (const slot of baseSlots) {
      const booked = await db.isSlotBooked(date, slot);
      if (!booked) available.push(slot);
    }
    return JSON.stringify({ date, availableSlots: available });
  },
});

export const bookCalendarTool = new DynamicStructuredTool({
  name: 'book_calendar_slot',
  description:
    'Book an executive demo / discovery session slot. Use only after the user explicitly confirms the date and time.',
  schema: z.object({
    name: z.string().describe('Attendee full name'),
    email: z.string().describe('Attendee email'),
    company: z.string().describe('Attendee company'),
    date: z.string().describe('Date in YYYY-MM-DD format'),
    slot: z.string().describe('Time slot, e.g. "10:00 AM EST (15:00 UTC)"'),
    meetingType: z.string().optional().describe('Meeting type, e.g. "Executive Demo"'),
    topic: z.string().optional().describe('Topic of discussion'),
  }),
  func: async ({ name, email, company, date, slot, meetingType, topic }) => {
    const alreadyBooked = await db.isSlotBooked(date, slot);
    if (alreadyBooked) {
      return JSON.stringify({ success: false, error: 'This slot was just taken. Please choose another.' });
    }
    const success = await db.bookSlot({
      name,
      email,
      company,
      date,
      slot,
      meetingType: meetingType || 'Executive Demo',
      topic: topic || 'Executive Discovery Session',
    });
    return JSON.stringify({ success, message: 'Booking confirmed', date, slot });
  },
});

export const captureLeadTool = new DynamicStructuredTool({
  name: 'capture_lead',
  description:
    'Capture a sales lead from the conversation. Use when the user expresses buying interest, ' +
    'asks for a quote, or wants to be contacted by the sales team.',
  schema: z.object({
    name: z.string().describe('Lead name'),
    email: z.string().describe('Lead email'),
    company: z.string().optional().describe('Lead company'),
    solutionOfInterest: z.string().optional().describe('Solution the lead is interested in'),
    message: z.string().optional().describe('Original message / context'),
    aumOrBudget: z.string().optional().describe('AUM or budget if disclosed'),
  }),
  func: async ({ name, email, company, solutionOfInterest, message, aumOrBudget }) => {
    const lead = await db.saveOutreachLead({
      name,
      email,
      company: company || undefined,
      solutionOfInterest: solutionOfInterest || 'General Inquiry',
      userMessage: message || undefined,
      aumOrBudget: aumOrBudget || undefined,
      agentSource: 'chatbot_agent',
      status: 'Pending Review',
      stage: 'New Inquiry',
    });
    return JSON.stringify({ success: true, leadId: lead.id, message: 'Lead captured and queued for review.' });
  },
});

export const getSiteInfoTool = new DynamicStructuredTool({
  name: 'get_site_info',
  description: 'Get 9xen company info: contact details, tagline, social links, and chatbot configuration.',
  schema: z.object({}),
  func: async () => {
    const settings = await db.getSiteSettings();
    return JSON.stringify(
      {
        companyName: settings.companyName,
        tagline: settings.tagline,
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        address: settings.address,
        socialLinks: settings.socialLinks,
      },
      null,
      2
    );
  },
});

export const agentTools = [
  searchCmsTool,
  getProductDetailsTool,
  checkCalendarTool,
  bookCalendarTool,
  captureLeadTool,
  getSiteInfoTool,
];
