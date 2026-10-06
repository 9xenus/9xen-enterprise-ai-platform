import React, { useState, useEffect, useMemo } from 'react';
import { useCms } from '../../context/CmsContext';
import {
  Search,
  X,
  FileText,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Briefcase,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, itemId?: string) => void;
}

export const SearchModal: React.FC<Props> = ({ isOpen, onClose, onNavigate }) => {
  const { cmsData } = useCms();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? (
        <span key={i} className="bg-cyan-500/20 text-cyan-400 px-0.5 rounded font-bold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const matched: Array<{
      type: 'service' | 'product' | 'platform' | 'blog' | 'caseStudy' | 'career';
      title: string;
      snippet: string;
      tab: string;
      id: string;
    }> = [];

    // Services
    (cmsData.services || []).forEach((s) => {
      if (
        s.title.toLowerCase().includes(q) ||
        s.shortDescription.toLowerCase().includes(q) ||
        s.fullDescription.toLowerCase().includes(q)
      ) {
        matched.push({
          type: 'service',
          title: s.title,
          snippet: s.shortDescription,
          tab: 'services',
          id: s.id,
        });
      }
    });

    // Products
    (cmsData.products || []).forEach((p) => {
      if (
        p.title.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q)
      ) {
        matched.push({
          type: 'product',
          title: p.title,
          snippet: p.tagline || p.shortDescription,
          tab: 'products',
          id: p.id,
        });
      }
    });

    // Platforms
    (cmsData.platforms || []).forEach((p) => {
      if (
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      ) {
        matched.push({
          type: 'platform',
          title: p.name,
          snippet: p.tagline || p.description,
          tab: 'platforms',
          id: p.id,
        });
      }
    });

    // Blog posts
    (cmsData.blogPosts || []).forEach((b) => {
      if (
        b.title.toLowerCase().includes(q) ||
        b.excerpt.toLowerCase().includes(q) ||
        b.body.toLowerCase().includes(q)
      ) {
        matched.push({
          type: 'blog',
          title: b.title,
          snippet: b.excerpt,
          tab: 'blog',
          id: b.id,
        });
      }
    });

    // Case Studies
    (cmsData.caseStudies || []).forEach((cs) => {
      if (
        cs.title.toLowerCase().includes(q) ||
        cs.summary.toLowerCase().includes(q) ||
        cs.client.toLowerCase().includes(q)
      ) {
        matched.push({
          type: 'caseStudy',
          title: `${cs.title} (${cs.client})`,
          snippet: cs.summary,
          tab: 'case-studies',
          id: cs.id,
        });
      }
    });

    // Careers
    (cmsData.careers || []).forEach((c) => {
      if (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q)
      ) {
        matched.push({
          type: 'career',
          title: `${c.title} — ${c.location}`,
          snippet: c.description,
          tab: 'careers',
          id: c.id,
        });
      }
    });

    return matched;
  }, [query, cmsData]);

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'service':
        return <Cpu className="w-4 h-4 text-cyan-400" />;
      case 'product':
        return <Layers className="w-4 h-4 text-violet-400" />;
      case 'platform':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case 'blog':
      case 'caseStudy':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'career':
        return <Briefcase className="w-4 h-4 text-pink-400" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Search input header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search architecture, models, case studies, services..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-400 hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1">
          {query.trim() === '' ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              Type keywords to search across neural systems, products, case studies, and careers.
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No results found for <span className="text-cyan-400">"{query}"</span>. Try searching "agent", "compliance", "medical", or "fine-tuning".
            </div>
          ) : (
            results.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onNavigate(item.tab, item.id);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-2xl hover:bg-slate-800/80 transition-colors flex items-start gap-3 group cursor-pointer"
              >
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0 group-hover:border-slate-700">
                  {getTypeIcon(item.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                      {highlightText(item.title, query)}
                    </h4>
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded shrink-0">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {highlightText(item.snippet, query)}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0 mt-2" />
              </button>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800/60 text-[10px] text-slate-500 flex items-center justify-between px-5 font-mono">
          <span>Total matches: {results.length}</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
