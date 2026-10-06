import fs from 'fs';
import path from 'path';
import { initialCmsData } from '../data/initialCmsData';
import { CmsDatabase } from '../types/cms';
import { db, getDuckConnection } from '../lib/db';

const DATA_FILE = path.join(process.cwd(), 'cmsData.json');

export async function syncLocalCmsToDuckDb(): Promise<{ success: boolean; message: string; details: any }> {
  try {
    const conn = await getDuckConnection();
    if (!conn) {
      throw new Error('DuckDB could not be initialized.');
    }

    let cmsData: CmsDatabase = { ...initialCmsData };
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      cmsData = JSON.parse(raw);
    }

    if (cmsData.hero) { await db.updateHero(cmsData.hero); }
    if (cmsData.settings) { await db.saveSiteSettings(cmsData.settings); }
    
    if (cmsData.services) { for (const item of cmsData.services) { await db.saveService(item, item.id); } }
    if (cmsData.products) { for (const item of cmsData.products) { await db.saveProduct(item, item.id); } }
    if (cmsData.platforms) { for (const item of cmsData.platforms) { await db.savePlatform(item, item.id); } }
    if (cmsData.models) { for (const item of cmsData.models) { await db.saveModel(item, item.id); } }
    if (cmsData.team) { for (const item of cmsData.team) { await db.saveTeamMember(item, item.id); } }
    if (cmsData.testimonials) { for (const item of cmsData.testimonials) { await db.saveTestimonial(item, item.id); } }
    if (cmsData.blogPosts) { for (const item of cmsData.blogPosts) { await db.saveBlogPost(item, item.id); } }
    if (cmsData.caseStudies) { for (const item of cmsData.caseStudies) { await db.saveCaseStudy(item, item.id); } }
    if (cmsData.careers) { for (const item of cmsData.careers) { await db.saveCareer(item, item.id); } }
    if (cmsData.footerPages) { for (const item of cmsData.footerPages) { await db.saveFooterPage(item, item.id); } }
    if (cmsData.outreachQueue) { for (const item of cmsData.outreachQueue) { await db.saveOutreachLead(item, item.id); } }
    if (cmsData.outreachTemplates) { for (const item of cmsData.outreachTemplates) { await db.saveOutreachTemplate(item, item.id); } }
    if (cmsData.webhookConfigs) { for (const item of cmsData.webhookConfigs) { await db.saveWebhookConfig(item, item.id); } }

    return {
      success: true,
      message: 'Successfully synchronized and loaded DuckDB database tables!',
      details: {
        syncedAt: new Date().toISOString(),
        totalBlogPosts: (cmsData.blogPosts || []).length,
        totalServices: (cmsData.services || []).length,
        totalProducts: (cmsData.products || []).length,
        totalOutreachLeads: (cmsData.outreachQueue || []).length,
        totalOutreachTemplates: (cmsData.outreachTemplates || []).length,
        totalWebhookConfigs: (cmsData.webhookConfigs || []).length,
        status: 'DuckDB Engine Synchronized'
      }
    };
  } catch (err: any) {
    console.error('DuckDB sync error:', err);
    return {
      success: false,
      message: err.message || 'Failed to sync database to DuckDB',
      details: { error: err.toString() }
    };
  }
}
