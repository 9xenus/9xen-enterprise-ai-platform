import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { AutoTranslate } from '../common/AutoTranslate';
import { BlogPost } from '../../types/cms';
import {
  FileText,
  Calendar,
  User,
  ArrowLeft,
  ArrowRight,
  Share2,
  Tag,
  Search,
  Sparkles,
} from 'lucide-react';

interface Props {
  selectedId?: string;
  onSelectPost?: (id: string | null) => void;
}

export const BlogView: React.FC<Props> = ({ selectedId, onSelectPost }) => {
  const { cmsData } = useCms();
  const { blogPosts } = cmsData;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [activePostId, setActivePostId] = useState<string | null>(selectedId || null);

  const activePost: BlogPost | undefined = (blogPosts || []).find(
    (b) => b.id === activePostId || b.slug === activePostId
  );

  const allTags = Array.from(
    new Set((blogPosts || []).flatMap((p) => p.tags || []))
  );

  const filteredPosts = (blogPosts || []).filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag =
      selectedTag === 'all' || (post.tags && post.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleGenerateSummary = async () => {
    if (!activePost) return;
    setIsSummarizing(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activePost.title,
          content: activePost.body || activePost.excerpt,
          type: 'blog',
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

  const handleOpenPost = (id: string) => {
    setActivePostId(id);
    setAiSummary(null);
    if (onSelectPost) onSelectPost(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setActivePostId(null);
    setAiSummary(null);
    if (onSelectPost) onSelectPost(null);
  };

  // Single Article View
  if (activePost) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
        <button
          onClick={handleBackToList}
          className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles & Research</span>
        </button>

        <article className="space-y-8">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
              <span className="text-cyan-400 font-bold uppercase">
                {activePost.tags?.[0] || 'Research Paper'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {activePost.publishDate}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white dark:text-white light:text-slate-950 tracking-tight leading-tight">
              <AutoTranslate text={activePost.title} />
            </h1>

            <p className="text-base sm:text-lg text-slate-300 dark:text-slate-300 light:text-slate-700 leading-relaxed font-normal">
              <AutoTranslate text={activePost.excerpt} />
            </p>

            <div className="flex items-center gap-3 pt-2">
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

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activePost.author?.avatar ? (
                  <img
                    src={activePost.author.avatar}
                    alt={activePost.author.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                    {activePost.author?.name?.slice(0, 2).toUpperCase() || '9X'}
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-white dark:text-white light:text-slate-950">
                    {activePost.author?.name || '9xen Research Team'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {activePost.author?.role || 'Staff AI Scientist'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Article link copied to clipboard!');
                }}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs flex items-center gap-1.5"
                title="Share Article"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </header>

          {activePost.coverImage && (
            <div className="aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl">
              <img
                src={activePost.coverImage}
                alt={activePost.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Body Content */}
          <div className="prose prose-invert max-w-none text-slate-300 dark:text-slate-300 light:text-slate-800 leading-relaxed text-sm sm:text-base space-y-6 pt-4">
            <AutoTranslate text={activePost.body} html={false} />
          </div>

          {/* Tags */}
          {activePost.tags && activePost.tags.length > 0 && (
            <div className="pt-8 border-t border-slate-800 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Tags:
              </span>
              {activePost.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </article>
      </div>
    );
  }

  // Blog Posts Listing
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold font-mono uppercase">
          <FileText className="w-3.5 h-3.5" />
          <span>Research & Insights</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white dark:text-white light:text-slate-950 tracking-tight">
          Neural Frontiers & Systems Architecture
        </h1>
        <p className="text-sm sm:text-base text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">
          Technical deep dives, mathematical benchmarks, and architectural disclosures written by our research scientists and systems engineers.
        </p>
      </section>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search papers & articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              selectedTag === 'all'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            All Topics
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedTag === tag
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            onClick={() => handleOpenPost(post.id)}
            className="p-6 rounded-3xl bg-slate-900/60 dark:bg-slate-900/60 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-cyan-500/50 transition-all flex flex-col justify-between group cursor-pointer shadow-sm hover:shadow-cyan-500/5"
          >
            <div className="space-y-4">
              {post.coverImage && (
                <div className="aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span className="text-cyan-400 font-bold uppercase">{post.tags?.[0] || 'AI'}</span>
                <span>•</span>
                <span>{post.publishDate}</span>
              </div>

              <h2 className="text-xl font-bold text-white dark:text-white light:text-slate-950 group-hover:text-cyan-400 transition-colors leading-snug">
                <AutoTranslate text={post.title} />
              </h2>

              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 line-clamp-3 leading-relaxed">
                <AutoTranslate text={post.excerpt} />
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-100 flex items-center justify-between text-xs font-semibold text-cyan-400">
              <span>Read Full Paper</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
