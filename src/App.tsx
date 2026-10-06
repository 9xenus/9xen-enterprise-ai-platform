import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { CmsProvider, useCms } from './context/CmsContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { TopProgressBar } from './components/common/TopProgressBar';
import { OfflineBanner } from './components/common/OfflineBanner';
import { TranslationBanner } from './components/common/TranslationBanner';
import { PopupBanner } from './components/common/PopupBanner';
import { CookieConsent } from './components/common/CookieConsent';
import { ScrollToTop } from './components/common/ScrollToTop';

import { ExecutiveDemoModal } from './components/common/ExecutiveDemoModal';
import { SearchModal } from './components/common/SearchModal';
import { LegalModal } from './components/common/LegalModal';
import { A11yInspectorOverlay } from './components/common/A11yInspectorOverlay';

import { HomeView } from './components/views/HomeView';
import { AboutView } from './components/views/AboutView';
import { ServicesView } from './components/views/ServicesView';
import { ProductsView } from './components/views/ProductsView';
import { PlatformsView } from './components/views/PlatformsView';
import { ModelsView } from './components/views/ModelsView';
import { BlogView } from './components/views/BlogView';
import { CaseStudiesView } from './components/views/CaseStudiesView';
import { CareersView } from './components/views/CareersView';
import { ContactView } from './components/views/ContactView';
import { FooterPageView } from './components/views/FooterPageView';
import { ChatWidget } from './components/common/ai-assistant/ChatWidget';

const AdminPortal = lazy(() => import('./components/admin/AdminPortal').then(m => ({ default: m.AdminPortal })));
const AssistantFullView = lazy(() => import('./components/common/ai-assistant/AssistantFullView').then(m => ({ default: m.AssistantFullView })));

const AppContent: React.FC = () => {
  const { cmsData } = useCms();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  
  const activeTab = path === '/' ? 'home' : path.split('/')[1];

  const [activeItemId, setActiveItemId] = useState<string | undefined>(undefined);
  const [footerPageSlug, setFooterPageSlug] = useState<string | null>(null);

  // Modals state
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);
  const [isA11yInspectorOpen, setIsA11yInspectorOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);

  // Navigation handler
  const handleNavigate = (tab: string, itemId?: string) => {
    if (tab === 'admin' || tab === 'cms' || tab === 'login' || tab === 'xena') {
      setIsAdminPortalOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setFooterPageSlug(null);
    setActiveItemId(itemId);
    if (tab === 'home') {
      navigate('/');
    } else {
      navigate(`/${tab}${itemId ? `?id=${itemId}` : ''}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Automatically open admin portal if route is /admin, /cms, or /login
  useEffect(() => {
    if (path === '/admin' || path === '/cms' || path === '/login' || path === '/xena') {
      setIsAdminPortalOpen(true);
    }
  }, [path]);

  const handleCloseAdmin = () => {
    setIsAdminPortalOpen(false);
    if (path === '/admin' || path === '/cms' || path === '/login' || path === '/xena') {
      navigate('/');
    }
  };

  const handleOpenFooterPage = (slug: string) => {
    setFooterPageSlug(slug);
    navigate(`/pages/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SEO Dynamic Title Management
  const tabTitles: Record<string, string> = {
    home: 'Autonomous Intelligence for Enterprise',
    about: 'About Us & Scientific Leadership',
    services: 'AI Engineering & Agent Orchestration',
    products: 'Cognitive Products & Foundation Suites',
    platforms: 'Multi-Tenant Architecture & DuckDB Core',
    models: 'Frontier LLM Models & Developer API',
    blog: 'Research Papers & Systems Deep Dives',
    'case-studies': 'Enterprise Production Case Studies',
    careers: 'Careers & Frontier AI Engineering',
    contact: 'Contact Solutions Architecture',
    assistant: 'Autonomous AI Advisor',
  };

  const customTitle = footerPageSlug
    ? `${footerPageSlug.toUpperCase()} — 9xen`
    : `${tabTitles[activeTab] || 'Enterprise AI'} | ${cmsData.settings?.companyName || '9xen'}`;
  const customDescription = cmsData.hero?.subheadline || 'Build, fine-tune, and orchestrate private neural networks with strict SOC-2 compliance, VPC peering, and zero data leakage.';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 w-full max-w-full overflow-x-hidden">
      <Helmet>
        <title>{customTitle}</title>
        <meta name="description" content={customDescription} />
        <link rel="canonical" href={`https://9xen.ai${path}`} />
        <meta property="og:title" content={customTitle} />
        <meta property="og:description" content={customDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://9xen.ai${path}`} />
        <meta property="og:image" content={cmsData.settings?.logoUrl || "https://9xen.ai/og-image.jpg"} />
        <meta name="twitter:card" content="summary_large_image" />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": cmsData.settings?.companyName || "9xen",
            "url": "https://9xen.ai",
            "logo": cmsData.settings?.logoUrl || "",
            "description": customDescription,
          })}
        </script>
      </Helmet>

      {/* Top progress line & offline notifications */}
      <TopProgressBar isLoading={false} />
      <OfflineBanner />
      <TranslationBanner />

      {/* Primary Global Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => handleNavigate(tab)}
        onNavigate={handleNavigate}
        onOpenDemo={() => setIsDemoModalOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
      />

      {/* Dynamic View Router */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <Suspense fallback={<div className="h-[60vh] flex items-center justify-center text-cyan-500 animate-pulse">Loading engine...</div>}>
          <Routes>
            <Route path="/" element={<HomeView onNavigate={handleNavigate} onOpenDemo={() => setIsDemoModalOpen(true)} />} />
            <Route path="/about" element={<AboutView />} />
            <Route path="/services" element={<ServicesView onOpenDemo={() => setIsDemoModalOpen(true)} selectedId={activeItemId} />} />
            <Route path="/products" element={<ProductsView onOpenDemo={() => setIsDemoModalOpen(true)} selectedId={activeItemId} />} />
            <Route path="/platforms" element={<PlatformsView onOpenDemo={() => setIsDemoModalOpen(true)} selectedId={activeItemId} />} />
            <Route path="/models" element={<ModelsView onOpenDemo={() => setIsDemoModalOpen(true)} onNavigate={handleNavigate} />} />
            <Route path="/blog" element={<BlogView selectedId={activeItemId} onSelectPost={(id) => setActiveItemId(id || undefined)} />} />
            <Route path="/case-studies" element={<CaseStudiesView selectedId={activeItemId} onOpenDemo={() => setIsDemoModalOpen(true)} />} />
            <Route path="/careers" element={<CareersView />} />
            <Route path="/contact" element={<ContactView />} />
            <Route path="/assistant" element={<AssistantFullView />} />
            <Route path="/pages/:slug" element={<FooterPageView slug={footerPageSlug || 'privacy-policy'} onBack={() => handleNavigate('home')} />} />
            <Route path="/admin" element={<div className="min-h-screen bg-slate-950" />} />
            <Route path="/xena" element={<div className="min-h-screen bg-slate-950" />} />
            <Route path="/login" element={<div className="min-h-screen bg-slate-950" />} />
            <Route path="/cms" element={<div className="min-h-screen bg-slate-950" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Global Footer */}
      <Footer
        setActiveTab={(tab) => handleNavigate(tab)}
        onNavigate={handleNavigate}
        onOpenPrivacy={() => setLegalModalType('privacy')}
        onOpenTerms={() => setLegalModalType('terms')}
        onOpenFooterPage={handleOpenFooterPage}
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
        onOpenA11y={() => setIsA11yInspectorOpen(true)}
      />

      {/* Floating Utilities */}
      <ChatWidget />
      <PopupBanner />
      <CookieConsent />
      <ScrollToTop />

      {/* Modals & Overlays */}
      <ExecutiveDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onNavigate={handleNavigate}
      />

      <LegalModal
        type={legalModalType || 'privacy'}
        isOpen={legalModalType !== null}
        onClose={() => setLegalModalType(null)}
      />

      <A11yInspectorOverlay
        isOpen={isA11yInspectorOpen}
        onClose={() => setIsA11yInspectorOpen(false)}
      />

      {isAdminPortalOpen && (
        <Suspense fallback={<div className="fixed inset-0 z-[100] bg-slate-950/80 flex items-center justify-center text-cyan-500 animate-pulse">Loading portal...</div>}>
          <AdminPortal onClose={handleCloseAdmin} />
        </Suspense>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <CmsProvider>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </CmsProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
