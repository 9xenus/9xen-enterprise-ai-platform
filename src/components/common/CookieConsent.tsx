import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Check, X, Cookie, Settings, Activity, Sparkles } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  personalization: boolean;
}

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    personalization: false,
  });

  useEffect(() => {
    const storedConsent = localStorage.getItem('9xenai_cookie_consent_v1');
    if (!storedConsent) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      try {
        const parsed = JSON.parse(storedConsent);
        setPreferences({
          necessary: true,
          analytics: !!parsed.analytics,
          personalization: !!parsed.personalization,
        });
      } catch (e) {
        console.error('Failed to parse stored cookie consent preferences:', e);
      }
    }
  }, []);

  const saveConsent = (updatedPrefs: CookiePreferences) => {
    const consentObject = {
      ...updatedPrefs,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('9xenai_cookie_consent_v1', JSON.stringify(consentObject));
    setPreferences(updatedPrefs);
    setVisible(false);
    setShowCustomize(false);
    window.dispatchEvent(new CustomEvent('9xenai_cookie_consent_update', { detail: consentObject }));
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      personalization: true,
    };
    saveConsent(allAccepted);
  };

  const handleDeclineAll = () => {
    const strictlyNecessary = {
      necessary: true,
      analytics: false,
      personalization: false,
    };
    saveConsent(strictlyNecessary);
  };

  const handleSaveSelected = () => {
    saveConsent(preferences);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return;
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <>
      {!visible && (
        <button
          onClick={() => setVisible(true)}
          className="fixed bottom-6 left-6 z-40 p-3 rounded-full bg-slate-900/90 dark:bg-slate-900/90 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-50 shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500"
          aria-label="Manage Cookie Choices"
          id="cookie-consent-launcher"
        >
          <Cookie className="w-4 h-4 text-violet-500 group-hover:rotate-12 transition-transform duration-300" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-200">
            Cookie Choices
          </span>
        </button>
      )}

      <AnimatePresence>
        {visible && (
          <div className="fixed bottom-6 left-6 right-6 md:right-auto md:max-w-md z-50 overflow-hidden" id="gdpr-consent-container">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="p-6 rounded-3xl bg-slate-950 dark:bg-slate-950 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.8)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] light:shadow-[0_20px_50px_rgba(15,23,42,0.15)] text-slate-300 dark:text-slate-300 light:text-slate-700 font-sans space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 shrink-0">
                  <Shield className="w-5 h-5 text-violet-500" />
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="text-sm font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-2">
                    <span>Privacy & Cookie Consent</span>
                    <span className="text-[9px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      GDPR
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 leading-relaxed">
                    We use privacy-preserving analytics and necessary session files to speed up CMS page delivery, authenticate administrators, and store custom preferences securely.
                  </p>
                </div>
                <button
                  onClick={handleDeclineAll}
                  className="text-slate-500 hover:text-slate-300 dark:hover:text-slate-300 light:hover:text-slate-950 p-1.5 rounded-lg hover:bg-slate-900 dark:hover:bg-slate-900 light:hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                  title="Accept strictly necessary and close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <AnimatePresence initial={false}>
                {showCustomize && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden border-t border-slate-900 dark:border-slate-900 light:border-slate-100 pt-4 space-y-3"
                  >
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Configure Granular Consents</h5>

                    <div className="p-3 rounded-2xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50/80 border border-slate-800/40 dark:border-slate-800/40 light:border-slate-200/40 flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-1.5">
                          <Cookie className="w-3.5 h-3.5 text-slate-400" />
                          Strictly Necessary
                        </span>
                        <p className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-500 leading-normal">
                          Required for security verification, database connections, and administrator login functionality. Always active.
                        </p>
                      </div>
                      <div className="shrink-0 pt-0.5">
                        <span className="text-[10px] font-bold font-mono text-violet-400 bg-violet-400/10 px-2 py-0.5 rounded uppercase">
                          Required
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => togglePreference('analytics')}
                      className="w-full text-left p-3 rounded-2xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50/80 border border-slate-800/40 dark:border-slate-800/40 light:border-slate-200/40 hover:border-slate-800 dark:hover:border-slate-800 light:hover:border-slate-200 flex items-start justify-between gap-3 transition-colors cursor-pointer focus:outline-none"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-cyan-400" />
                          Performance & Analytics
                        </span>
                        <p className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-500 leading-normal">
                          Enables anonymous latency and load tracking, database transaction monitoring, and diagnostic insights.
                        </p>
                      </div>
                      <div className="shrink-0 pt-0.5">
                        <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${preferences.analytics ? 'bg-cyan-500' : 'bg-slate-800 light:bg-slate-200'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${preferences.analytics ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => togglePreference('personalization')}
                      className="w-full text-left p-3 rounded-2xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50/80 border border-slate-800/40 dark:border-slate-800/40 light:border-slate-200/40 hover:border-slate-800 dark:hover:border-slate-800 light:hover:border-slate-200 flex items-start justify-between gap-3 transition-colors cursor-pointer focus:outline-none"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                          Customization & AI History
                        </span>
                        <p className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-500 leading-normal">
                          Caches user interface display themes, local multi-agent chat widgets, and diagnostic telemetry setups.
                        </p>
                      </div>
                      <div className="shrink-0 pt-0.5">
                        <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${preferences.personalization ? 'bg-violet-500' : 'bg-slate-800 light:bg-slate-200'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${preferences.personalization ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-2 pt-2 border-t border-slate-900 dark:border-slate-900 light:border-slate-100">
                {showCustomize ? (
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <button
                      onClick={handleSaveSelected}
                      className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg shadow-violet-500/10 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Save My Choices
                    </button>
                    <button
                      onClick={() => setShowCustomize(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-slate-50 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 text-slate-400 dark:text-slate-400 light:text-slate-600 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <button
                        onClick={handleAcceptAll}
                        className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-lg shadow-cyan-500/10 cursor-pointer"
                      >
                        Accept All Cookies
                      </button>
                      <button
                        onClick={handleDeclineAll}
                        className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-200 border border-slate-800 dark:border-slate-800 light:border-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700 transition-all cursor-pointer"
                      >
                        Reject Optional
                      </button>
                    </div>
                    
                    <button
                      onClick={() => setShowCustomize(true)}
                      className="w-full py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500 light:text-slate-400 hover:text-slate-300 dark:hover:text-slate-300 light:hover:text-slate-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Settings className="w-3 h-3" />
                      Configure Cookie Preferences
                    </button>
                  </>
                )}
              </div>

              <div className="text-[9px] text-slate-500 dark:text-slate-500 light:text-slate-400 text-center flex items-center justify-center gap-1">
                <span>Subject to GDPR & CCPA regulation framework guidelines.</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
