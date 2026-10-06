import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { Logo } from './Logo';
import {
  Shield,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Check,
  Code,
  Box,
  Hash,
  Cpu,
  Lock,
  FileText,
} from 'lucide-react';

interface FooterProps {
  setActiveTab?: (tab: string) => void;
  onNavigate?: (tab: string, itemId?: string) => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onOpenFooterPage?: (slug: string) => void;
  onOpenAdmin?: () => void;
  onOpenA11y?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
  onNavigate,
  onOpenPrivacy,
  onOpenTerms,
  onOpenFooterPage,
  onOpenAdmin,
  onOpenA11y,
}) => {
  const { cmsData, subscribeNewsletter, t } = useCms();
  const { settings, services, products, platforms, footerPages } = cmsData;
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subStatus, setSubStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setLoading(true);
    const res = await subscribeNewsletter(newsletterEmail.trim());
    setLoading(false);
    setSubStatus(res.message);
    if (res.success) {
      setNewsletterEmail('');
      setTimeout(() => setSubStatus(null), 4000);
    }
  };

  const handleNav = (tab: string, itemId?: string) => {
    if (tab === 'admin') {
      if (typeof onOpenAdmin === 'function') {
        onOpenAdmin();
      } else if (typeof onNavigate === 'function') {
        onNavigate('admin');
      }
      return;
    }
    if (tab.startsWith('page-') && onOpenFooterPage) {
      onOpenFooterPage(tab.replace('page-', ''));
      return;
    }
    if (typeof onNavigate === 'function') {
      onNavigate(tab, itemId);
    } else if (typeof setActiveTab === 'function') {
      setActiveTab(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      id="main-app-footer"
      className="bg-slate-950 dark:bg-slate-950 light:bg-slate-900 border-t border-slate-900 text-slate-400 font-sans relative overflow-hidden"
    >
      {/* Decorative top accent line */}
      <div className="h-1 bg-gradient-to-r from-cyan-500 via-violet-600 to-indigo-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-900">
          {/* Brand & Overview */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" />
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              {settings.tagline ||
                'Autonomous intelligence engines, fine-tuned LLM architectures, and SOC-2 enterprise compliance pipelines designed for mission-critical operations.'}
            </p>

            {/* Newsletter Subscription */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Enterprise AI Briefing
              </span>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  required
                  placeholder="executive@company.com"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-50 flex items-center gap-1"
                >
                  <span>{loading ? 'Subscribing...' : 'Join'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
              {subStatus && (
                <p className="text-[11px] text-cyan-400 flex items-center gap-1 font-mono">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{subStatus}</span>
                </p>
              )}
            </div>

            {/* Compliance Badge */}
            <div className="flex items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono">
                <Shield className="w-3 h-3 text-cyan-400" />
                <span>SOC-2 Type II Certified</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono">
                <Lock className="w-3 h-3 text-violet-400" />
                <span>GDPR & HIPAA Ready</span>
              </div>
            </div>
          </div>

          {/* Solutions & Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Services</h4>
            <ul className="space-y-2 text-xs">
              {(services || []).slice(0, 5).map((srv) => (
                <li key={srv.id}>
                  <button
                    onClick={() => handleNav('services')}
                    className="hover:text-cyan-400 transition-colors text-left"
                  >
                    {srv.title}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => handleNav('services')}
                  className="text-cyan-400 hover:underline text-[11px] font-semibold"
                >
                  View all services →
                </button>
              </li>
            </ul>
          </div>

          {/* Platforms & Products */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platforms</h4>
            <ul className="space-y-2 text-xs">
              {(platforms || []).slice(0, 4).map((plat) => (
                <li key={plat.id}>
                  <button
                    onClick={() => handleNav('platforms')}
                    className="hover:text-cyan-400 transition-colors text-left"
                  >
                    {plat.name}
                  </button>
                </li>
              ))}
              {(products || []).slice(0, 2).map((prod) => (
                <li key={prod.id}>
                  <button
                    onClick={() => handleNav('products')}
                    className="hover:text-cyan-400 transition-colors text-left"
                  >
                    {prod.title}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => handleNav('models')}
                  className="text-cyan-400 font-bold hover:underline text-[11px] flex items-center gap-1 text-left"
                >
                  <span>Foundation Models & API →</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('products')}
                  className="text-slate-400 hover:text-white hover:underline text-[11px]"
                >
                  Explore products →
                </button>
              </li>
            </ul>
          </div>

          {/* Corporate & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Company</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-cyan-400 transition-colors">
                  {t('about')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('blog')} className="hover:text-cyan-400 transition-colors">
                  {t('blog')} & Research
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('case-studies')} className="hover:text-cyan-400 transition-colors">
                  {t('caseStudies')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('careers')} className="hover:text-cyan-400 transition-colors">
                  {t('careers')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contact')} className="hover:text-cyan-400 transition-colors">
                  {t('contact')}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPrivacy || (() => handleNav('privacy'))}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTerms || (() => handleNav('terms'))}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('admin')}
                  id="footer-admin-link-company"
                  className="text-cyan-400/90 hover:text-cyan-300 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer pt-1"
                >
                  <Lock className="w-3 h-3 text-cyan-400" />
                  <span>Admin Portal (Login)</span>
                </button>
              </li>
              {(footerPages || []).map((page) => (
                <li key={page.id}>
                  <button
                    onClick={() => handleNav(`page-${page.slug}`)}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    {page.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact info strip */}
        <div className="py-6 border-b border-slate-900 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{settings.address || 'San Francisco, CA & Frankfurt, Germany'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
            <a href={`mailto:${settings.contactEmail || 'contact@9xen.com'}`} className="hover:text-white">
              {settings.contactEmail || 'contact@9xen.com'}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{settings.contactPhone || '+1 (415) 890-9XEN'}</span>
          </div>
        </div>

        {/* Bottom copyright and legal */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} {settings.companyName || '9xen'}. {t('allRightsReserved')}
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleNav('admin')}
              id="footer-admin-link"
              className="hover:text-cyan-400 text-slate-400 font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>CMS Administration (Login)</span>
            </button>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 font-mono text-[11px]"
            >
              XML Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
