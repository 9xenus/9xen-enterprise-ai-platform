import React from 'react';
import { useCms } from '../../context/CmsContext';
import { AutoTranslate } from '../common/AutoTranslate';
import { ArrowLeft, FileText } from 'lucide-react';

interface Props {
  slug: string;
  onBack: () => void;
}

export const FooterPageView: React.FC<Props> = ({ slug, onBack }) => {
  const { cmsData } = useCms();
  const page = (cmsData.footerPages || []).find((p) => p.slug === slug);

  if (!page) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
        <p className="text-xs text-slate-400">The requested legal or custom page does not exist.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return</span>
      </button>

      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-bold uppercase">
          <FileText className="w-3.5 h-3.5" />
          <span>Corporate Policy</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white dark:text-white light:text-slate-950 tracking-tight">
          <AutoTranslate text={page.title} />
        </h1>

        <div className="prose prose-invert max-w-none text-slate-300 dark:text-slate-300 light:text-slate-700 leading-relaxed text-sm sm:text-base space-y-4 pt-4 border-t border-slate-800">
          <AutoTranslate text={page.content} />
        </div>
      </div>
    </div>
  );
};
