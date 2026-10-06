import React from 'react';
import { useCms } from '../../context/CmsContext';
import { X, Check, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  ar: 'العربية',
  id: 'Bahasa Indonesia',
  pt: 'Português',
  tr: 'Türkçe',
  it: 'Italiano'
};

export const TranslationBanner: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    detectedCountry, 
    showTranslationBanner, 
    setShowTranslationBanner 
  } = useCms();

  if (!showTranslationBanner || !detectedCountry || language === 'en') {
    return null;
  }

  const handleKeep = () => {
    setShowTranslationBanner(false);
  };

  const handleSwitchToEnglish = () => {
    setLanguage('en');
    setShowTranslationBanner(false);
  };

  const currentLanguageName = LANGUAGE_NAMES[language] || language;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative z-50 bg-slate-900 border-b border-slate-800 text-slate-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-cyan-500/10 rounded-lg text-cyan-400 shrink-0">
              <Languages className="w-4 h-4 animate-pulse" />
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              We detected your location as <span className="font-semibold text-white">{detectedCountry}</span> and automatically translated this page to <span className="font-semibold text-cyan-400">{currentLanguageName}</span>.
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleKeep}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold transition-all flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Keep in {currentLanguageName}
            </button>
            <button
              onClick={handleSwitchToEnglish}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
            >
              Switch back to English
            </button>
            <button
              onClick={() => setShowTranslationBanner(false)}
              className="p-1 text-slate-400 hover:text-white transition-colors ml-1"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
