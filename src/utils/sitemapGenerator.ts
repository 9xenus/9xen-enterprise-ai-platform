import { CmsDatabase } from '../types/cms';

export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export function getBaseUrl(customUrl?: string): string {
  if (customUrl && customUrl.trim().length > 0) {
    return customUrl.trim().replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }
  return 'https://9xen.com';
}

export function buildSitemapEntries(cmsData: CmsDatabase, baseUrlInput?: string): SitemapUrlEntry[] {
  const baseUrl = getBaseUrl(baseUrlInput);
  const currentDate = new Date().toISOString().split('T')[0];

  const entries: SitemapUrlEntry[] = [
    {
      loc: `${baseUrl}/`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 1.0,
    },
    {
      loc: `${baseUrl}/about`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.8,
    },
    {
      loc: `${baseUrl}/services`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.9,
    },
    {
      loc: `${baseUrl}/products`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.9,
    },
    {
      loc: `${baseUrl}/platforms`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.9,
    },
    {
      loc: `${baseUrl}/blog`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 0.8,
    },
    {
      loc: `${baseUrl}/case-studies`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.8,
    },
    {
      loc: `${baseUrl}/careers`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.7,
    },
    {
      loc: `${baseUrl}/contact`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.7,
    },
  ];

  if (cmsData?.blogPosts && Array.isArray(cmsData.blogPosts)) {
    cmsData.blogPosts
      .filter((post) => post.status === 'published' || !post.status)
      .forEach((post) => {
        const slug = post.slug || post.id;
        const lastmod = post.publishDate || currentDate;
        entries.push({
          loc: `${baseUrl}/blog/${slug}`,
          lastmod,
          changefreq: 'weekly',
          priority: 0.7,
        });
      });
  }

  if (cmsData?.caseStudies && Array.isArray(cmsData.caseStudies)) {
    cmsData.caseStudies.forEach((cs) => {
      const slug = cs.slug || cs.id;
      entries.push({
        loc: `${baseUrl}/case-studies/${slug}`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.7,
      });
    });
  }

  if (cmsData?.platforms && Array.isArray(cmsData.platforms)) {
    cmsData.platforms.forEach((platform) => {
      const slug = platform.slug || platform.id;
      entries.push({
        loc: `${baseUrl}/platforms/${slug}`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.8,
      });
    });
  }

  return entries;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateSitemapXml(cmsData: CmsDatabase, baseUrlInput?: string): string {
  const entries = buildSitemapEntries(cmsData, baseUrlInput);

  const urlNodes = entries
    .map((entry) => {
      const loc = `<loc>${escapeXml(entry.loc)}</loc>`;
      const lastmod = entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : '';
      const changefreq = entry.changefreq ? `\n    <changefreq>${entry.changefreq}</changefreq>` : '';
      const priority = entry.priority !== undefined ? `\n    <priority>${entry.priority.toFixed(1)}</priority>` : '';
      return `  <url>\n    ${loc}${lastmod}${changefreq}${priority}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlNodes}
</urlset>`;
}

export function downloadSitemapXml(cmsData: CmsDatabase, baseUrlInput?: string): void {
  const xmlContent = generateSitemapXml(cmsData, baseUrlInput);
  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sitemap.xml';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
