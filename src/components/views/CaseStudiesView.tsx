import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { AutoTranslate } from '../common/AutoTranslate';
import { CaseStudy } from '../../types/cms';
import {
  Award,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Building2,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';

interface Props {
  selectedId?: string;
  onOpenDemo: () => void;
}

export const CaseStudiesView: React.FC<Props> = ({ selectedId, onOpenDemo }) => {
  const { cmsData } = useCms();
  const { caseStudies } = cmsData;
  const [activeStudyId, setActiveStudyId] = useState<string | null>(selectedId || null);

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleGenerateSummary = async () => {
    if (!activeStudy) return;
    setIsSummarizing(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeStudy.title,
          content: `${activeStudy.summary}\n\n${activeStudy.body}`,
          type: 'case_study',
        }),
      });
      const data = await res.json();
      if (data.success && data.summary) {
        setAiSummary(data.summary);
      } else {
        setAiSummary('Failed to generate summary.');
      }
    } catch (err) {
      setAiSummary('Error connecting to AI summary service.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const activeStudy: CaseStudy | undefined = (caseStudies || []).find(
    (cs) => cs.id === activeStudyId || cs.slug === activeStudyId
  );

  if (activeStudy) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
        <button
          onClick={() => { setActiveStudyId(null); setAiSummary(null); }}
          className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Case Studies</span>
        </button>

        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>{activeStudy.industry}</span>
            <span>•</span>
            <span className="text-slate-400">Client: {activeStudy.client}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white dark:text-white light:text-slate-950 tracking-tight">
            <AutoTranslate text={activeStudy.title} />
          </h1>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateSummary}
              disabled={isSummarizing}
              className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <Sparkles className={`w-4 h-4 ${isSummarizing ? 'animate-spin' : ''}`} />
              <span>{isSummarizing ? 'Generating AI Summary...' : aiSummary ? 'Regenerate AI Summary' : '⚡ Generate AI Fast Summary'}</span>
            </button>
          </div>

          {aiSummary && (
            <div className="p-6 rounded-3xl bg-cyan-500/5 border border-cyan-500/30 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Executive Summary (Fast Reading)</span>
                </div>
                <button
                  onClick={() => setAiSummary(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕ Close
                </button>
              </div>
              <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-line font-sans">
                {aiSummary}
              </div>
            </div>
          )}

          {/* Metric Box */}
          <div className="p-6 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-cyan-500 text-slate-950">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-cyan-400 font-mono">
                {activeStudy.impactMetric}
              </div>
              <div className="text-xs text-slate-300">Audited Production Impact</div>
            </div>
          </div>

          {activeStudy.coverImage && (
            <div className="aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-slate-800">
              <img
                src={activeStudy.coverImage}
                alt={activeStudy.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="text-sm sm:text-base text-slate-300 dark:text-slate-300 light:text-slate-700 leading-relaxed space-y-4">
            <h3 className="text-lg font-bold text-white dark:text-white light:text-slate-950">Executive Summary</h3>
            <p><AutoTranslate text={activeStudy.summary} /></p>

            <h3 className="text-lg font-bold text-white dark:text-white light:text-slate-950 pt-4">Implementation & Results</h3>
            <p><AutoTranslate text={activeStudy.body} /></p>
          </div>

          <div className="pt-8 border-t border-slate-800 flex justify-end">
            <button
              onClick={onOpenDemo}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Discuss Similar Deployment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold font-mono uppercase">
          <Award className="w-3.5 h-3.5" />
          <span>Case Studies</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white dark:text-white light:text-slate-950 tracking-tight">
          Proven Enterprise Deployments
        </h1>
        <p className="text-sm sm:text-base text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">
          How leading financial institutions, healthcare providers, and logistics leaders transformed operations through 9xen's autonomous AI infrastructure.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {(caseStudies || []).map((cs) => (
          <div
            key={cs.id}
            onClick={() => setActiveStudyId(cs.id)}
            className="p-8 rounded-3xl bg-slate-900/60 dark:bg-slate-900/60 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-cyan-500/50 transition-all flex flex-col justify-between group cursor-pointer shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 font-bold">{cs.industry}</span>
                <span className="text-slate-500">{cs.client}</span>
              </div>

              {cs.coverImage && (
                <div className="aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img
                    src={cs.coverImage}
                    alt={cs.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <h2 className="text-2xl font-bold text-white dark:text-white light:text-slate-950 group-hover:text-cyan-400 transition-colors">
                <AutoTranslate text={cs.title} />
              </h2>

              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 line-clamp-3 leading-relaxed">
                <AutoTranslate text={cs.summary} />
              </p>

              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                <div className="text-xl font-black text-cyan-400 font-mono">
                  {cs.impactMetric}
                </div>
                <div className="text-[10px] text-slate-400">Audited Result</div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-100 flex items-center justify-between text-xs font-semibold text-cyan-400">
              <span>Read Full Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
