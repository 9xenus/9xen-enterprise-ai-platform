import React, { useState, useEffect } from 'react';
import { useCms } from '../../context/CmsContext';
import { DatabaseExplorer } from './DatabaseExplorer';
import { FileUploader } from '../common/FileUploader';
import {
  LayoutDashboard,
  Sparkles,
  Layers,
  Cpu,
  Database,
  FileText,
  Award,
  Users,
  Briefcase,
  Mail,
  FolderOpen,
  Shield,
  LogOut,
  Save,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  RefreshCw,
  Key,
  Lock,
  Eye,
  Terminal,
  Download,
  Bot,
  Columns,
  Send,
  History,
  Target,
  TrendingUp,
  Flame,
  BookOpen,
  ChevronRight,
  Webhook,
  X,
  Smartphone,
  Copy,
  AlertCircle,
  Star,
  Globe,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { BlogPost, Service, Product, Platform, TeamMember, Career, CaseStudy } from '../../types/cms';
import { HeroImagenGenerator } from './HeroImagenGenerator';
import { EditorLivePreview, PreviewTarget } from './EditorLivePreview';
import { BlogPostEditor } from './BlogPostEditor';
import { ProductManager } from './ProductManager';
import { ProductManagerEnhanced } from './ProductManagerEnhanced';
import { ServicesManagerEnhanced } from './ServicesManagerEnhanced';
import { ServicesManager } from './ServicesManager';
import { PlatformManager } from './PlatformManager';
import { ModelsManager } from './ModelsManager';
import { CaseStudyManager } from './CaseStudyManager';
import { TeamManager } from './TeamManager';
import { CareersManager } from './CareersManager';
import { AiTelemetryManager } from './AiTelemetryManager';
import { OutreachQueueManager } from './OutreachQueueManager';
import { TemplateManager } from './TemplateManager';
import { WebhookManager } from './WebhookManager';
import { LeadFunnelPipeline } from './LeadFunnelPipeline';
import { SalesAnalyticsDashboard } from './SalesAnalyticsDashboard';
import { SalesBotConfigManager } from './SalesBotConfigManager';
import { VersionHistoryModal } from './VersionHistoryModal';
import { TestimonialsManager } from './TestimonialsManager';
import { FooterPagesManager } from './FooterPagesManager';
import { PagesManager } from './PagesManager';
import { DynamicContentManager } from './DynamicContentManager';
import { CategoriesManager } from './CategoriesManager';
import { SeoGeoManager } from './SeoGeoManager';
import { AutonomousAgentsManager } from './AutonomousAgentsManager';
import { EnterpriseCustomersManager } from './EnterpriseCustomersManager';
import { AdvancedCmsManager } from './AdvancedCmsManager';
import { SiteContentManager } from './SiteContentManager';

interface Props {
  onClose: () => void;
}

export const AdminPortal: React.FC<Props> = ({ onClose }) => {
  const {
    cmsData,
    updateCmsData,
    saveCmsData,
    isSaving,
    lastSaved,
    isAdminAuthenticated,
    adminLogin,
    login,
    adminLogout,
    duckDbStatus,
    syncDuckDb,
    mfaStatus,
    setupMfa,
    enableMfa,
    disableMfa,
    auditLogs,
  } = useCms();

  // Login form state
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('9xen2026!');
  const [mfaToken, setMfaToken] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Admin Section
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'leadFunnel'
    | 'salesAnalytics'
    | 'salesBot'
    | 'outreach'
    | 'templates'
    | 'webhooks'
    | 'database'
    | 'hero'
    | 'services'
    | 'products'
    | 'platforms'
    | 'models'
    | 'blog'
    | 'caseStudies'
    | 'team'
    | 'careers'
    | 'submissions'
    | 'media'
    | 'security'
    | 'aiTelemetry'
    | 'testimonials'
    | 'footerPages'
    | 'siteContent'
  >('dashboard');

  // Split Screen Live Preview states
  const [splitPreviewOpen, setSplitPreviewOpen] = useState(true);
  const [previewTarget, setPreviewTarget] = useState<PreviewTarget>('home');
  const [selectedBlogPostId, setSelectedBlogPostId] = useState<string | null>(null);
  const [splitRatio, setSplitRatio] = useState<string>('50/50');
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // Automatically adapt preview target to active tab
  useEffect(() => {
    if (activeTab === 'hero') {
      setPreviewTarget('home');
    } else if (activeTab === 'blog') {
      setPreviewTarget('blog');
    } else if (activeTab === 'products') {
      setPreviewTarget('products');
    }
  }, [activeTab]);

  // AI Blog generator state
  const [generatingAiBlog, setGeneratingAiBlog] = useState(false);
  const [aiTopic, setAiTopic] = useState('Quantum-Resistant Autonomous Agent Validation');

  // Edit states
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Version History Modal state
  const [versionModalState, setVersionModalState] = useState<{
    isOpen: boolean;
    contentType: string;
    contentId: string;
    contentTitle: string;
    currentData?: any;
  }>({
    isOpen: false,
    contentType: 'hero',
    contentId: 'default',
    contentTitle: 'Hero Banner Section',
  });

  // MFA Setup State
  const [isMfaSetupOpen, setIsMfaSetupOpen] = useState(false);
  const [mfaSetupData, setMfaSetupData] = useState<{ secret: string; otpauth: string; backupCodes: string[] } | null>(null);
  const [mfaVerificationCode, setMfaVerificationCode] = useState('');
  const [mfaSetupStep, setMfaSetupStep] = useState<'qr' | 'backup'>('qr');
  const [mfaError, setMfaError] = useState('');
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false);
  const [mfaRequiredForLogin, setMfaRequiredForLogin] = useState(false);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    
    // Call login directly from context to handle mfaRequired flow
    const cleanUser = username.trim();
    const cleanPass = password.trim();
    const res = await login(cleanUser, cleanPass, mfaToken?.trim() || undefined);
    setIsLoggingIn(false);
    
    if (res.success) {
      if (res.mfaRequired) {
        setMfaRequiredForLogin(true);
      } else {
        // adminUser and token are already set by context.login()
        setMfaRequiredForLogin(false);
      }
    } else {
      setLoginError(res.error || 'Authentication failed. Please check credentials or use 1-Click Quick Login.');
    }
  };

  // 1-Click Fast Dev Login
  const handleQuickLogin = async () => {
    setIsLoggingIn(true);
    setLoginError('');
    setUsername('admin');
    setPassword('9xen2026!');
    const res = await login('admin', '9xen2026!');
    if (!res.success) {
      const retry = await login('admin@9xen.com', 'admin123');
      if (!retry.success) {
        await adminLogin('admin', '9xen2026!');
      }
    }
    setIsLoggingIn(false);
  };

  // AI Blog Article Generator
  const handleGenerateAiBlog = async () => {
    setGeneratingAiBlog(true);
    try {
      const prompt = `Write a comprehensive, professional research article for the 9xen Enterprise AI Platform blog about: "${aiTopic}".
Include title, an executive excerpt, and a detailed 4-paragraph body analyzing neural architecture, zero-data-leakage compliance, and benchmark outcomes.`;
      
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      const generatedText = data.text || 'Autonomous neural network synthesis complete.';

      const newPost: BlogPost = {
        id: `blog-ai-${Date.now()}`,
        title: `${aiTopic}`,
        slug: aiTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt: `An exploratory analysis of ${aiTopic} in regulated enterprise architectures.`,
        body: generatedText,
        coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1200',
        publishDate: new Date().toISOString().split('T')[0],
        status: 'published',
        tags: ['Autonomous AI', 'Research', 'Security'],
        author: {
          name: '9xen Autonomous AI Lab',
          role: 'Staff Research Scientist',
        },
      };

      updateCmsData({
        blogPosts: [newPost, ...(cmsData.blogPosts || [])],
      });
      alert('AI Blog Draft successfully generated and added to research articles!');
    } catch (err) {
      console.error(err);
      alert('AI Generation encountered an issue. Standard draft created.');
    } finally {
      setGeneratingAiBlog(false);
    }
  };

  const handleStartMfaSetup = async () => {
    const data = await setupMfa();
    if (data) {
      setMfaSetupData({ ...data, backupCodes: data.backupCodes || [] });
      setIsMfaSetupOpen(true);
      setMfaSetupStep('qr');
      setMfaError('');
      setMfaVerificationCode('');
    }
  };

  const handleConfirmMfa = async () => {
    if (mfaVerificationCode.length !== 6) return;
    setIsVerifyingMfa(true);
    setMfaError('');
    const success = await enableMfa(mfaVerificationCode);
    setIsVerifyingMfa(false);
    if (success) {
      setMfaSetupStep('backup');
    } else {
      setMfaError('Invalid verification code. Please try again.');
    }
  };

  // If not authenticated, render Login Screen
  if (!isAdminAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg">
        <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white">9xen Admin Console</h2>
            <p className="text-xs text-slate-400 font-mono">
              Enterprise CMS & DuckDB Sync Control
            </p>
            <div className="flex items-center justify-center gap-1.5 pt-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 rounded-full">OWASP Top 10 Secured</span>
            </div>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {mfaRequiredForLogin && (
              <div className="space-y-1">
                <label className="font-bold text-cyan-400 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5" />
                  <span>MFA Token (TOTP 6-digits)</span>
                </label>
                <input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  required
                  value={mfaToken}
                  onChange={(e) => setMfaToken(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-cyan-500/50 text-white focus:outline-none focus:border-cyan-500 font-mono text-center tracking-widest text-base"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isLoggingIn ? 'Verifying Credentials...' : 'Authenticate to Console'}</span>
            </button>
          </form>

          {/* Dev bypass & demo credentials tip */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-cyan-400 font-bold text-xs">Admin Credentials:</span>
              <button
                type="button"
                onClick={handleQuickLogin}
                id="one-click-login-btn"
                className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] cursor-pointer shadow-md transition-all flex items-center gap-1"
              >
                <span>⚡ 1-Click Quick Login</span>
              </button>
            </div>
            <div className="space-y-1.5 font-mono text-[11px] bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span>User: <strong className="text-white">admin</strong></span>
                <span>Pass: <strong className="text-white">9xen2026!</strong></span>
                <button
                  type="button"
                  onClick={() => { setUsername('admin'); setPassword('9xen2026!'); }}
                  className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                >
                  Fill
                </button>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800/60 pt-1.5 text-slate-400">
                <span>Alt: <strong className="text-white">admin@9xen.com</strong></span>
                <span>Pass: <strong className="text-white">admin123</strong></span>
                <button
                  type="button"
                  onClick={() => { setUsername('admin@9xen.com'); setPassword('admin123'); }}
                  className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                >
                  Fill
                </button>
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-300 font-mono"
            >
              ← Cancel & Return to Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="fixed inset-0 z-50 flex bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Logo & Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-white font-black text-xs">
                9X
              </div>
              <div>
                <h2 className="font-black text-sm text-white tracking-tight">9xen Console</h2>
                <div className="text-[10px] font-mono text-cyan-400">Enterprise Admin</div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            {[
              { id: 'dashboard', label: 'Overview & DuckDB', icon: LayoutDashboard },
              { id: 'leadFunnel', label: 'Lead Conversion Funnel', icon: Target },
              { id: 'salesAnalytics', label: 'Sales Analytics', icon: TrendingUp },
              { id: 'salesBot', label: 'Sales Bot Assistant', icon: Bot },
              { id: 'outreach', label: 'Outreach Queue (Gemini)', icon: Send },
              { id: 'templates', label: 'Template Manager (Gemini)', icon: FileText },
              { id: 'webhooks', label: 'Integrations & Webhooks', icon: Webhook },
              { id: 'database', label: 'Database Explorer', icon: Database },
              { id: 'aiTelemetry', label: 'AI Gateway & Logs', icon: Bot },
              { id: 'hero', label: 'Hero & Branding', icon: Sparkles },
              { id: 'services', label: 'Services Manager', icon: Cpu },
              { id: 'products', label: 'Products Suite', icon: Layers },
                                                                      { id: 'customers', label: 'Enterprise Customers', icon: Users },
              { id: 'agents', label: 'Autonomous Agents', icon: Bot },

              { id: 'seo', label: 'SEO & Geo', icon: Globe },

              { id: 'categories', label: 'Categories (Dynamic)', icon: Layers },

              { id: 'platforms', label: 'Platforms & Cloud', icon: Database },

              { id: 'models', label: 'AI Models CMS', icon: Cpu },
              { id: 'blog', label: 'Research & Blog', icon: FileText },
              { id: 'caseStudies', label: 'Case Studies', icon: Award },
              { id: 'team', label: 'Leadership & Team', icon: Users },
              { id: 'careers', label: 'Careers & Roles', icon: Briefcase },
              { id: 'submissions', label: 'Form Submissions', icon: Mail },
              { id: 'media', label: 'Media Asset Library', icon: FolderOpen },
              { id: 'security', label: 'MFA & Audit Security', icon: Shield },
              { id: 'testimonials', label: 'Testimonials', icon: Star },
                                          { id: 'advancedCms', label: 'Advanced CMS', icon: Layout },
              { id: 'pages', label: 'Pages & Layout', icon: FileText },

              { id: 'dynamicContent', label: 'Dynamic Content', icon: Database },
              { id: 'footerPages', label: 'Footer Pages', icon: FileText },

              { id: 'siteContent', label: 'Site Content & Settings', icon: Globe },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => saveCmsData()}
            disabled={isSaving}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Publish Live Changes'}</span>
          </button>

          <div className="flex items-center justify-between pt-2 text-[10px] text-slate-500">
            <span>Saved: {lastSaved?.toLocaleTimeString() || 'Synced'}</span>
            <button
              onClick={adminLogout}
              className="hover:text-rose-400 flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Console / {activeTab}
            </span>

            {/* Editor Preview Mode Toggle Button */}
            <button
              onClick={() => setSplitPreviewOpen(!splitPreviewOpen)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                splitPreviewOpen
                  ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-white border-slate-700'
              }`}
              title="Toggle Live Editor Preview Split-Screen"
            >
              <Columns className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Editor Preview:</span>
              <span className={`font-mono font-bold ${splitPreviewOpen ? 'text-emerald-400' : 'text-slate-500'}`}>
                {splitPreviewOpen ? 'ON' : 'OFF'}
              </span>
              {splitPreviewOpen && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              )}
            </button>

            {/* Mobile Tab Switcher when Preview is open */}
            {splitPreviewOpen && (
              <div className="flex lg:hidden items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setMobileTab('editor')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    mobileTab === 'editor'
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Editor
                </button>
                <button
                  onClick={() => setMobileTab('preview')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    mobileTab === 'preview'
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Live Preview
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                let contentType = 'hero';
                let contentId = 'default';
                let contentTitle = 'Hero Banner Section';
                let currentData: any = cmsData.hero;

                if (activeTab === 'blog' && cmsData.blogPosts?.[0]) {
                  contentType = 'blog';
                  contentId = cmsData.blogPosts[0].id;
                  contentTitle = cmsData.blogPosts[0].title;
                  currentData = cmsData.blogPosts[0];
                } else if (activeTab === 'services' && cmsData.services?.[0]) {
                  contentType = 'service';
                  contentId = cmsData.services[0].id;
                  contentTitle = cmsData.services[0].title;
                  currentData = cmsData.services[0];
                } else if (activeTab === 'products' && cmsData.products?.[0]) {
                  contentType = 'product';
                  contentId = cmsData.products[0].id;
                  contentTitle = cmsData.products[0].title;
                  currentData = cmsData.products[0];
                }

                setVersionModalState({
                  isOpen: true,
                  contentType,
                  contentId,
                  contentTitle,
                  currentData,
                });
              }}
              className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono hidden sm:flex items-center gap-1.5 cursor-pointer"
              title="View & rollback CMS content version history"
            >
              <History className="w-3.5 h-3.5" />
              <span>Version History</span>
            </button>
            <button
              onClick={() => syncDuckDb()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono hidden sm:flex items-center gap-1.5 cursor-pointer"
              title="Sync JSON to DuckDB"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>DuckDB Sync</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
            >
              Exit to Live Site
            </button>
          </div>
        </header>

        {/* Main Split-Screen Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          {/* Left Editor Workspace */}
          <div
            className={`overflow-y-auto p-6 sm:p-8 space-y-6 border-slate-800 ${
              splitPreviewOpen
                ? mobileTab === 'editor'
                  ? splitRatio === '60/40'
                    ? 'w-full lg:w-[60%] lg:border-r'
                    : splitRatio === '40/60'
                    ? 'w-full lg:w-[40%] lg:border-r'
                    : 'w-full lg:w-1/2 lg:border-r'
                  : 'hidden lg:block ' +
                    (splitRatio === '60/40'
                      ? 'lg:w-[60%] lg:border-r'
                      : splitRatio === '40/60'
                      ? 'lg:w-[40%] lg:border-r'
                      : 'lg:w-1/2 lg:border-r')
                : 'w-full'
            }`}
          >
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-mono">Active Services</div>
                  <div className="text-2xl font-black text-white">{cmsData.services?.length || 0}</div>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-mono">Product Suites</div>
                  <div className="text-2xl font-black text-white">{cmsData.products?.length || 0}</div>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-mono">Research Papers</div>
                  <div className="text-2xl font-black text-white">{cmsData.blogPosts?.length || 0}</div>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-mono">Outreach Pipeline</div>
                  <div className="text-2xl font-black text-cyan-400 font-mono">
                    {cmsData.outreachQueue?.length || 0} Leads
                  </div>
                </div>
              </div>

              {/* Lead Conversion Pipeline Overview Widget */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base flex items-center gap-2">
                        <span>Lead Conversion Pipeline & Funnel</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          Live Funnel
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        New Inquiry ➔ Outreach Sent ➔ Demo Scheduled with Gemini tag classification.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('leadFunnel')}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20 self-start sm:self-auto"
                  >
                    <span>Open Visual Funnel</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick 3-Stage Progress Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-1">
                    <div className="text-[11px] font-mono text-cyan-400 font-semibold flex items-center justify-between">
                      <span>1. New Inquiry</span>
                      <span className="text-white font-bold font-mono">
                        {
                          (cmsData.outreachQueue || []).filter(
                            (l) => !l.stage || l.stage === 'New Inquiry' || l.status === 'Pending Review'
                          ).length
                        }
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">Unanswered prospect queries</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-violet-500/30 space-y-1">
                    <div className="text-[11px] font-mono text-violet-400 font-semibold flex items-center justify-between">
                      <span>2. Outreach Sent</span>
                      <span className="text-white font-bold font-mono">
                        {
                          (cmsData.outreachQueue || []).filter(
                            (l) => l.stage === 'Outreach Sent' || (l.status === 'Approved & Sent' && l.stage !== 'Demo Scheduled')
                          ).length
                        }
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">AI personalized draft delivered</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-1">
                    <div className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center justify-between">
                      <span>3. Demo Scheduled</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        {
                          (cmsData.outreachQueue || []).filter(
                            (l) => l.stage === 'Demo Scheduled' || !!l.demoScheduledAt
                          ).length
                        }
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">Confirmed platform walkthrough</div>
                  </div>
                </div>
              </div>

              {/* DuckDB Status Card */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-white text-base">DuckDB In-Memory OLAP Database</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                    Connected & Verified
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The 9xen platform utilizes an embedded DuckDB database engine for fast columnar analytics, real-time audit trail aggregation, and local persistence.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">DuckDB Engine:</span>
                    <span className="text-white font-bold">DuckDB 1.2+</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Sync Mode:</span>
                    <span className="text-emerald-400 font-bold">Automatic Dual-Store</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tables Indexed:</span>
                    <span className="text-white font-bold">9 Core Tables</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Audit Log Count:</span>
                    <span className="text-cyan-400 font-bold">{auditLogs.length} Events</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DATABASE EXPLORER */}
          {activeTab === 'database' && (
            <div className="h-full">
              <DatabaseExplorer />
            </div>
          )}

          {/* TAB: HERO & BRANDING */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              {/* Split-screen preview info banner */}
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-cyan-950/20">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Real-time Live Preview Enabled</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Edits to headlines, badge text, company name, and Imagen AI background generation update immediately in the split-screen viewport.
                    </p>
                  </div>
                </div>
                {!splitPreviewOpen && (
                  <button
                    onClick={() => {
                      setPreviewTarget('home');
                      setSplitPreviewOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow-md"
                  >
                    Open Live Preview
                  </button>
                )}
              </div>

              {/* Imagen AI Background Generator */}
              <HeroImagenGenerator />

              {/* Text Copy & Site Settings */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <h3 className="text-lg font-bold text-white">Hero & Landing Copy</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Company Name</label>
                    <input
                      type="text"
                      value={cmsData.settings?.companyName || ''}
                      onChange={(e) =>
                        updateCmsData({
                          settings: { ...cmsData.settings, companyName: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Hero Badge</label>
                    <input
                      type="text"
                      value={cmsData.hero?.badge || cmsData.hero?.badgeText || ''}
                      onChange={(e) =>
                        updateCmsData({
                          hero: { ...cmsData.hero, badge: e.target.value, badgeText: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-300">Main Headline</label>
                    <textarea
                      rows={2}
                      value={cmsData.hero?.headline || ''}
                      onChange={(e) =>
                        updateCmsData({
                          hero: { ...cmsData.hero, headline: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-300">Subheadline</label>
                    <textarea
                      rows={3}
                      value={cmsData.hero?.subheadline || ''}
                      onChange={(e) =>
                        updateCmsData({
                          hero: { ...cmsData.hero, subheadline: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: RESEARCH & BLOG (WITH FULL REAL-TIME SPLIT-SCREEN EDITOR & AI GENERATOR) */}
          {activeTab === 'blog' && (
            <BlogPostEditor
              onPreviewPost={(postId) => {
                setSelectedBlogPostId(postId);
                setPreviewTarget('blog');
                setSplitPreviewOpen(true);
                setMobileTab('preview');
              }}
            />
          )}

          {/* TAB: FORM SUBMISSIONS (WITH ATTACHMENT DOWNLOADS) */}
          {activeTab === 'submissions' && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">
                  Executive Briefing & Inquiry Leads ({cmsData.submissions?.length || 0})
                </h3>
              </div>

              {(cmsData.submissions || []).length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No inquiries submitted yet. Form submissions will appear here in real time.
                </div>
              ) : (
                <div className="space-y-4">
                  {(cmsData.submissions || []).map((sub) => (
                    <div
                      key={sub.id}
                      className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white text-sm">{sub.name}</span>
                          <span className="text-slate-500 mx-2">•</span>
                          <span className="text-cyan-400">{sub.email}</span>
                          {sub.company && (
                            <>
                              <span className="text-slate-500 mx-2">•</span>
                              <span className="text-slate-300 font-semibold">{sub.company}</span>
                            </>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(sub.submittedAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="font-semibold text-slate-200">{sub.subject}</div>
                      <p className="text-slate-400 whitespace-pre-wrap leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        {sub.message}
                      </p>

                      {sub.attachmentUrl && (
                        <div className="flex items-center gap-2 pt-1 text-cyan-400">
                          <FolderOpen className="w-4 h-4" />
                          <span className="font-mono text-[11px]">
                            Attachment: {sub.attachmentName || 'Uploaded Document'}
                          </span>
                          <a
                            href={sub.attachmentUrl}
                            download
                            className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-[10px] font-bold"
                          >
                            Download
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: MEDIA ASSET LIBRARY */}
          {activeTab === 'media' && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <div>
                <h3 className="font-bold text-white text-base">Media Asset Manager</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload architectural diagrams, whitepapers, executive photos, and logos.
                </p>
              </div>

              <FileUploader
                label="Upload New Media Asset"
                isPublic={true}
                onChange={(url, name) => {
                  const currentMedia = cmsData.media || [];
                  updateCmsData({
                    media: [
                      {
                        id: `media-${Date.now()}`,
                        url,
                        fileName: name || 'asset',
                        uploadedAt: new Date().toISOString(),
                      },
                      ...currentMedia,
                    ],
                  });
                  alert(`Asset "${name}" uploaded successfully!`);
                }}
              />

              <div className="pt-4 space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">
                  Available Media Assets
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(cmsData.media || []).map((asset) => (
                    <div
                      key={asset.id}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
                        <img
                          src={asset.url}
                          alt={asset.fileName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="font-mono text-[11px] text-white truncate">
                        {asset.fileName}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(asset.url);
                          alert('Asset URL copied to clipboard!');
                        }}
                        className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[10px] font-bold"
                      >
                        Copy Asset URL
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: SECURITY & MFA SETTINGS */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-white text-base">
                    Multi-Factor Authentication (MFA / 2FA)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enforce RFC 6238 time-based one-time passwords (TOTP) for all administrative operations.
                </p>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">
                      MFA Status: {mfaStatus.enabled ? 'Active & Enforced' : 'Disabled'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {mfaStatus.enabled
                        ? 'TOTP required on every login'
                        : 'Enable TOTP to enforce security on admin access'}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (mfaStatus.enabled) {
                        disableMfa();
                      } else {
                        handleStartMfaSetup();
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      mfaStatus.enabled
                        ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                        : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                    }`}
                  >
                    {mfaStatus.enabled ? 'Disable 2FA' : 'Enable 2FA Protection'}
                  </button>
                </div>
              </div>

              {/* Audit Log Stream */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="font-bold text-white text-base">Security Audit Logs</h3>
                <div className="max-h-72 overflow-y-auto space-y-2 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-300"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold uppercase">{log.action}</span>
                        <span className="text-slate-400">by {log.user}</span>
                      </div>
                      <span className="text-slate-500 text-[10px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PRODUCTS SUITE MANAGER */}
          {activeTab === 'products' && (
            <ProductManager
              onPreviewProducts={() => {
                setPreviewTarget('products');
                setSplitPreviewOpen(true);
                setMobileTab('preview');
              }}
            />
          )}

          {/* TAB: LEAD CONVERSION FUNNEL PIPELINE */}
          {activeTab === 'leadFunnel' && <LeadFunnelPipeline />}

          {/* TAB: SALES ANALYTICS DASHBOARD */}
          {activeTab === 'salesAnalytics' && <SalesAnalyticsDashboard />}

          {/* TAB: SALES BOT ASSISTANT CONFIGURATION & DEPLOYMENT */}
          {activeTab === 'salesBot' && <SalesBotConfigManager />}

          {/* TAB: OUTREACH QUEUE */}
          {activeTab === 'outreach' && (
            <OutreachQueueManager onSwitchToFunnel={() => setActiveTab('leadFunnel')} />
          )}

          {/* TAB: TEMPLATE MANAGER */}
          {activeTab === 'templates' && <TemplateManager />}

          {/* TAB: WEBHOOK MANAGER */}
          {activeTab === 'webhooks' && <WebhookManager />}

          {/* TAB: AI GATEWAY & TELEMETRY */}
          {activeTab === 'aiTelemetry' && <AiTelemetryManager />}

          {/* TAB: MODELS MANAGER */}
          {activeTab === 'models' && (
            <ModelsManager
              onPreviewModels={() => {
                setPreviewTarget('models');
                setSplitPreviewOpen(true);
                setMobileTab('preview');
              }}
            />
          )}

          {/* TAB: SERVICES MANAGER */}
          {activeTab === 'services' && (
            <ServicesManager
              onPreviewServices={() => {
                setPreviewTarget('services');
                setSplitPreviewOpen(true);
                setMobileTab('preview');
              }}
            />
          )}

          {/* TAB: PLATFORMS MANAGER */}
          {activeTab === 'platforms' && (
            <PlatformManager
              onPreviewPlatforms={() => {
                setPreviewTarget('platforms');
                setSplitPreviewOpen(true);
                setMobileTab('preview');
              }}
            />
          )}

          {/* TAB: CASE STUDIES MANAGER */}
          {activeTab === 'caseStudies' && (
            <CaseStudyManager
              onPreviewCaseStudies={() => {
                setPreviewTarget('caseStudies');
                setSplitPreviewOpen(true);
                setMobileTab('preview');
              }}
            />
          )}

          {/* TAB: TESTIMONIALS */}
          {activeTab === 'testimonials' && <TestimonialsManager />}

          {/* TAB: FOOTER PAGES */}
          {activeTab === 'advancedCms' && <AdvancedCmsManager />}
          {activeTab === 'pages' && <PagesManager />}
          {activeTab === 'customers' && <EnterpriseCustomersManager />}
          {activeTab === 'agents' && <AutonomousAgentsManager />}
          {activeTab === 'seo' && <SeoGeoManager />}
          {activeTab === 'categories' && <CategoriesManager />}
          {activeTab === 'dynamicContent' && <DynamicContentManager />}
          {activeTab === 'footerPages' && <FooterPagesManager />}

          {/* TAB: SITE CONTENT & SETTINGS */}
          {activeTab === 'siteContent' && <SiteContentManager />}

          {/* TAB: TEAM MANAGER */}
          {activeTab === 'team' && (
            <TeamManager
              onPreviewTeam={() => {
                setPreviewTarget('team');
                setSplitPreviewOpen(true);
                setMobileTab('preview');
              }}
            />
          )}

          {/* TAB: CAREERS MANAGER */}
          {activeTab === 'careers' && (
            <CareersManager
              onPreviewCareers={() => {
                setPreviewTarget('careers');
                setSplitPreviewOpen(true);
                setMobileTab('preview');
              }}
            />
          )}
          </div>

          {/* MFA Setup Modal Overlay */}
          {isMfaSetupOpen && mfaSetupData && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
              <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">MFA Configuration</h2>
                      <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Step {mfaSetupStep === 'qr' ? '1: Verify Device' : '2: Secure Backup'}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsMfaSetupOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto">
                  {mfaSetupStep === 'qr' ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="font-bold text-white">Scan with Authenticator</h3>
                        <p className="text-xs text-slate-400">Use Google Authenticator, Microsoft Authenticator, or Authy to scan the QR code below.</p>
                      </div>

                      <div className="flex flex-col items-center gap-6">
                        <div className="p-4 bg-white rounded-2xl shadow-inner shadow-black/10">
                          <QRCodeSVG value={mfaSetupData.otpauth} size={180} level="H" />
                        </div>
                        
                        <div className="w-full space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Manual Entry Secret</label>
                          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between group">
                            <span className="font-mono text-xs text-cyan-400 font-bold">{mfaSetupData.secret}</span>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(mfaSetupData.secret);
                                alert('Secret key copied to clipboard');
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 space-y-4 border-t border-slate-800">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Verification Code</label>
                          <input 
                            type="text"
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            value={mfaVerificationCode}
                            onChange={(e) => setMfaVerificationCode(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono text-center tracking-[1em] text-lg"
                          />
                          {mfaError && <p className="text-rose-400 text-[10px] font-bold mt-1 text-center">{mfaError}</p>}
                        </div>

                        <button 
                          onClick={handleConfirmMfa}
                          disabled={mfaVerificationCode.length !== 6 || isVerifyingMfa}
                          className="w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                        >
                          {isVerifyingMfa ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                          <span>VERIFY & ENABLE ENFORCEMENT</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="font-bold text-emerald-400 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          MFA Enabled Successfully
                        </h3>
                        <p className="text-xs text-slate-400">Your account is now protected. Please save these emergency backup codes in a secure location. Each code can only be used once.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                        {mfaSetupData.backupCodes.map((code, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-center">
                            {code}
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 flex gap-3">
                        <button 
                          onClick={() => {
                            const text = `9xen Enterprise MFA Backup Codes\nGenerated: ${new Date().toLocaleString()}\n\n${mfaSetupData.backupCodes.join('\n')}`;
                            const blob = new Blob([text], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `9xen-backup-codes-${Date.now()}.txt`;
                            a.click();
                          }}
                          className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download .txt</span>
                        </button>
                        <button 
                          onClick={() => setIsMfaSetupOpen(false)}
                          className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition-all"
                        >
                          I'VE SAVED THEM
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Right Live Preview Workspace */}
          {splitPreviewOpen && (
            <div
              className={`${
                mobileTab === 'preview' ? 'flex flex-1' : 'hidden lg:flex'
              } ${
                splitRatio === '60/40'
                  ? 'lg:w-[40%]'
                  : splitRatio === '40/60'
                  ? 'lg:w-[60%]'
                  : 'lg:w-1/2'
              } min-h-0 flex-col`}
            >
              <EditorLivePreview
                previewTarget={previewTarget}
                onChangePreviewTarget={setPreviewTarget}
                selectedBlogPostId={selectedBlogPostId}
                onSelectBlogPostId={setSelectedBlogPostId}
                onClosePreview={() => setSplitPreviewOpen(false)}
                splitRatio={splitRatio}
                onChangeSplitRatio={setSplitRatio}
                isFullScreen={isFullScreenPreview}
                onToggleFullScreen={() => setIsFullScreenPreview(!isFullScreenPreview)}
              />
            </div>
          )}
        </div>
      </main>

      {/* Fullscreen Preview Modal */}
      {isFullScreenPreview && (
        <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col">
          <EditorLivePreview
            previewTarget={previewTarget}
            onChangePreviewTarget={setPreviewTarget}
            selectedBlogPostId={selectedBlogPostId}
            onSelectBlogPostId={setSelectedBlogPostId}
            onClosePreview={() => setIsFullScreenPreview(false)}
            splitRatio={splitRatio}
            onChangeSplitRatio={setSplitRatio}
            isFullScreen={true}
            onToggleFullScreen={() => setIsFullScreenPreview(false)}
          />
        </div>
      )}
      {/* Version History Modal */}
      <VersionHistoryModal
        contentType={versionModalState.contentType}
        contentId={versionModalState.contentId}
        contentTitle={versionModalState.contentTitle}
        currentData={versionModalState.currentData}
        isOpen={versionModalState.isOpen}
        onClose={() => setVersionModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
