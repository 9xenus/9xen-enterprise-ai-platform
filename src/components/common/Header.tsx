import React, { useState, useEffect } from 'react';
import { useCms } from '../../context/CmsContext';
import { useTheme } from '../../context/ThemeContext';
import { Logo } from './Logo';
import {
  Search,
  Globe,
  Sun,
  Moon,
  Menu,
  X,
  Shield,
  ArrowRight,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { LANGUAGES, SupportedLanguage } from '../../utils/translations';

interface HeaderProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onNavigate?: (tab: string, itemId?: string) => void;
  onOpenSearch?: () => void;
  onOpenDemo?: () => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onNavigate,
  onOpenSearch,
  onOpenDemo,
  onOpenAdmin,
}) => {
  const { language, setLanguage, t, adminUser } = useCms();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: t('home') },
    { id: 'about', label: t('about') },
    { id: 'services', label: t('services') },
    { id: 'products', label: t('products') },
    { id: 'models', label: t('models') || 'Models & API' },
    { id: 'platforms', label: t('platforms') },
    { id: 'assistant', label: 'AI Advisor' },
    { id: 'blog', label: t('blog') },
    { id: 'case-studies', label: t('caseStudies') },
    { id: 'careers', label: t('careers') },
    { id: 'contact', label: t('contact') },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'admin') {
      if (typeof onOpenAdmin === 'function') {
        onOpenAdmin();
        setMobileMenuOpen(false);
        return;
      }
    }
    if (typeof onNavigate === 'function') {
      onNavigate(id);
    } else if (typeof setActiveTab === 'function') {
      setActiveTab(id);
    }
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <header
      id="main-app-header"
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/85 dark:bg-slate-950/85 light:bg-white/85 backdrop-blur-md border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200/80 shadow-lg shadow-black/20'
          : 'bg-slate-950/50 dark:bg-slate-950/50 light:bg-white/50 backdrop-blur-sm border-b border-slate-800/40 dark:border-slate-800/40 light:border-slate-200/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div
            onClick={() => handleNavClick('home')}
            className="cursor-pointer group select-none"
            id="brand-logo-trigger"
          >
            <Logo size="md" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 shrink">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-2 xl:px-2.5 py-2 rounded-xl text-[11px] xl:text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-cyan-400 bg-cyan-500/10 dark:text-cyan-400 dark:bg-cyan-500/10 light:text-cyan-600 light:bg-cyan-50 shadow-sm'
                      : 'text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white light:text-slate-600 light:hover:text-slate-950 hover:bg-slate-900/50 dark:hover:bg-slate-900/50 light:hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {/* Search Button */}
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                id="header-search-btn"
                className="p-2.5 rounded-xl bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 text-slate-400 hover:text-cyan-400 dark:hover:text-cyan-400 light:hover:text-cyan-600 transition-colors cursor-pointer"
                title="Search Site"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                id="header-lang-selector-btn"
                className="px-2.5 py-2 rounded-xl bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                aria-label="Select Language"
              >
                <span className="text-sm">{currentLangObj.flag}</span>
                <span className="uppercase text-[11px] font-mono">{currentLangObj.code}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-950 dark:bg-slate-950 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setLangMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-900 dark:border-slate-900 light:border-slate-100 mb-1">
                    Select Language
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as SupportedLanguage);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        language === lang.code
                          ? 'bg-cyan-500/15 text-cyan-400 dark:text-cyan-400 light:text-cyan-600 font-bold'
                          : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-900 dark:hover:bg-slate-900 light:hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase font-mono">{lang.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              id="theme-toggle-btn"
              className="p-2.5 rounded-xl bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Admin Portal Shortcut */}
            <button
              onClick={() => {
                if (onOpenAdmin) onOpenAdmin();
                else handleNavClick('admin');
              }}
              id="header-admin-btn"
              className={`px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                adminUser
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-100 border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 text-slate-200 hover:text-cyan-400 hover:border-cyan-500/50 shadow-sm'
              }`}
              title={adminUser ? `Signed in as ${adminUser.name}` : 'Admin Portal & CMS Login'}
              aria-label="Admin Portal"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">{adminUser ? 'CMS' : 'Admin Login'}</span>
            </button>

            {/* Executive Demo CTA Button */}
            <button
              onClick={onOpenDemo || (() => handleNavClick('contact'))}
              id="header-demo-cta-btn"
              className="ml-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-violet-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('executiveDemo')}</span>
            </button>
          </div>

          {/* Mobile Hamburger Controls */}
          <div className="flex lg:hidden items-center gap-2">
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="p-2 rounded-xl bg-slate-900 text-slate-400"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-900 text-slate-400"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 dark:bg-slate-950 light:bg-white border-b border-slate-800 dark:border-slate-800 light:border-slate-200 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-1.5 pt-2">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 font-bold'
                      : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-900 dark:hover:bg-slate-900 light:hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Language picker in mobile */}
          <div className="pt-3 border-t border-slate-900 dark:border-slate-900 light:border-slate-200">
            <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Language ({currentLangObj.name})</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code as SupportedLanguage)}
                  className={`py-1.5 px-2 rounded-xl text-center text-xs font-mono font-bold transition-colors ${
                    language === l.code
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-900 dark:bg-slate-900 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-700'
                  }`}
                >
                  {l.flag} {l.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenAdmin) onOpenAdmin();
                else handleNavClick('admin');
              }}
              id="mobile-admin-btn"
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 text-slate-200 dark:text-slate-200 light:text-slate-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>CMS Admin Portal (Login)</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenDemo) onOpenDemo();
                else handleNavClick('contact');
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <span>{t('executiveDemo')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
