import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { BlogPost } from '../../types/cms';
import {
  FileText,
  Plus,
  Trash2,
  Sparkles,
  Edit3,
  Check,
  Eye,
  Calendar,
  User,
  Tag,
  Image as ImageIcon,
  ArrowLeft,
  Bot,
  Layers,
  Search,
  History,
} from 'lucide-react';
import { FileUploader } from '../common/FileUploader';
import { VersionHistoryModal } from './VersionHistoryModal';

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200',
];

const COMMON_TAGS = [
  'Autonomous AI',
  'Neural Systems',
  'Security & VPC',
  'RegTech Engine',
  'Quantum Models',
  'Zero Data Leakage',
];

interface Props {
  onPreviewPost?: (postId: string) => void;
}

export const BlogPostEditor: React.FC<Props> = ({ onPreviewPost }) => {
  const { cmsData, updateCmsData } = useCms();
  const blogPosts = cmsData.blogPosts || [];

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [generatingAiBlog, setGeneratingAiBlog] = useState(false);
  const [customTagInput, setCustomTagInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [versionModalOpen, setVersionModalOpen] = useState(false);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const activePost = blogPosts.find((p) => p.id === selectedPostId);

  const handleUpdateActivePost = (patch: Partial<BlogPost>) => {
    if (!selectedPostId) return;
    const updated = blogPosts.map((p) => {
      if (p.id === selectedPostId) {
        return { ...p, ...patch };
      }
      return p;
    });
    updateCmsData({ blogPosts: updated });
  };

  const handleCreateNewPost = () => {
    const newId = `blog-${Date.now()}`;
    const newPost: BlogPost = {
      id: newId,
      title: 'Architectural Blueprint: Next-Generation Autonomous Systems',
      slug: `autonomous-systems-${Date.now().toString().slice(-4)}`,
      excerpt:
        'A comprehensive review of deterministic neural routing and zero-latency enterprise guardrails.',
      body: `## Abstract\nAs enterprise artificial intelligence workloads migrate towards multi-agent autonomous execution loops, classical static API boundaries become insufficient.\n\n### Neural Isolation & Verification\nBy introducing verifiable cryptographic attestations at each decision branch, organizations guarantee strict policy compliance without degrading inference throughput.\n\n### Empirical Benchmarks\nInitial testing demonstrates a 4.2x speedup in parallelized decision synthesis compared to legacy orchestrated pipelines.`,
      coverImage: PRESET_COVERS[0],
      publishDate: new Date().toISOString().split('T')[0],
      status: 'published',
      tags: ['Autonomous AI', 'Neural Systems'],
      author: {
        name: 'Dr. Elena Rostova',
        role: 'Chief AI Architect',
      },
    };

    updateCmsData({
      blogPosts: [newPost, ...blogPosts],
    });
    setSelectedPostId(newId);
    if (onPreviewPost) onPreviewPost(newId);
    showStatus('New blog draft created and active in live preview!');
  };

  const handleDeletePost = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = blogPosts.filter((p) => p.id !== id);
    updateCmsData({ blogPosts: updated });
    if (selectedPostId === id) {
      setSelectedPostId(null);
    }
    showStatus('Post deleted.');
  };

  const handleGenerateAiBlog = async () => {
    if (!aiTopic.trim()) {
      showStatus('Please enter a research topic.');
      return;
    }

    setGeneratingAiBlog(true);
    try {
      const prompt = `Write a comprehensive, publication-grade technical research article for the 9xen Enterprise AI Platform blog about: "${aiTopic}".
Include a compelling title, an executive excerpt, and 4 detailed technical sections analyzing neural architecture, verifiable audit logs, and performance metrics.`;

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      const generatedText = data.text || 'Autonomous neural network synthesis complete.';

      const newId = `blog-ai-${Date.now()}`;
      const newPost: BlogPost = {
        id: newId,
        title: aiTopic,
        slug: aiTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt: `An exploratory analysis of ${aiTopic} in enterprise computing architectures.`,
        body: generatedText,
        coverImage: PRESET_COVERS[1],
        publishDate: new Date().toISOString().split('T')[0],
        status: 'published',
        tags: ['Autonomous AI', 'Research', 'Security'],
        author: {
          name: '9xen Autonomous AI Lab',
          role: 'Staff Research Scientist',
        },
      };

      updateCmsData({
        blogPosts: [newPost, ...blogPosts],
      });
      setSelectedPostId(newId);
      if (onPreviewPost) onPreviewPost(newId);
      showStatus('AI research draft generated and loaded into editor!');
      setAiTopic('');
    } catch (err) {
      console.error(err);
      showStatus('AI Generation encountered an issue.');
    } finally {
      setGeneratingAiBlog(false);
    }
  };

  const handleAddTag = (tag: string) => {
    if (!activePost || !tag.trim()) return;
    const currentTags = activePost.tags || [];
    if (!currentTags.includes(tag.trim())) {
      handleUpdateActivePost({ tags: [...currentTags, tag.trim()] });
    }
    setCustomTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!activePost) return;
    const currentTags = activePost.tags || [];
    handleUpdateActivePost({ tags: currentTags.filter((t) => t !== tagToRemove) });
  };

  const filteredPosts = blogPosts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {statusMessage && (
        <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400" />
            <span>{statusMessage}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-cyan-400 hover:text-cyan-200"
          >
            &times;
          </button>
        </div>
      )}

      {/* AI Generator Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-violet-950/40 via-slate-900 to-indigo-950/40 border border-violet-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-violet-400" />
            <h3 className="font-bold text-white text-sm">Gemini AI Research Paper Generator</h3>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
            Automated Draft Synthesis
          </span>
        </div>
        <p className="text-xs text-slate-300">
          Generate an in-depth enterprise research article with executive abstract, architectural diagrams, and compliance evaluations.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            placeholder="e.g. Deterministic Token Isolation in Multi-Tenant LLM Clouds..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
          <button
            onClick={handleGenerateAiBlog}
            disabled={generatingAiBlog || !aiTopic.trim()}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-lg shadow-violet-600/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>{generatingAiBlog ? 'Synthesizing...' : 'Generate AI Paper'}</span>
          </button>
        </div>
      </div>

      {/* Main Blog Management Area: Either List or Active Post Editor */}
      {!activePost ? (
        /* Blog Post Table / List */
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-white text-base">
                Published & Draft Research Articles ({blogPosts.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Edit existing research papers or draft new technical releases with real-time preview.
              </p>
            </div>
            <button
              onClick={handleCreateNewPost}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Write New Article</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title or keywords..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Posts Cards */}
          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => {
                  setSelectedPostId(post.id);
                  if (onPreviewPost) onPreviewPost(post.id);
                }}
                className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                        post.status === 'published'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {post.status || 'published'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {post.publishDate}
                    </span>
                    {post.tags?.[0] && (
                      <span className="text-[10px] text-cyan-400 font-mono">
                        #{post.tags[0]}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors line-clamp-1">
                    {post.title}
                  </h4>
                  <p className="text-slate-400 text-xs line-clamp-2">{post.excerpt}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPostId(post.id);
                      if (onPreviewPost) onPreviewPost(post.id);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Post</span>
                  </button>

                  <button
                    onClick={(e) => handleDeletePost(post.id, e)}
                    className="p-1.5 rounded-xl bg-slate-900 hover:bg-red-950 hover:text-red-400 text-slate-500 transition-colors cursor-pointer"
                    title="Delete Post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Detailed Active Post Editor Form */
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <button
              onClick={() => setSelectedPostId(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Articles List</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setVersionModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="View, compare, and roll back version history"
              >
                <History className="w-3.5 h-3.5" />
                <span>Version History</span>
              </button>

              <button
                onClick={() => onPreviewPost && onPreviewPost(activePost.id)}
                className="px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Show in Split Preview</span>
              </button>

              <button
                onClick={() => handleDeletePost(activePost.id)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-400 cursor-pointer transition-colors"
                title="Delete this article"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form Fields with Real-Time Sync */}
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Article Title</span>
                <span className="text-[10px] font-mono text-cyan-400">Syncs instantly to preview</span>
              </label>
              <input
                type="text"
                value={activePost.title}
                onChange={(e) => handleUpdateActivePost({ title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Slug & Date & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">URL Slug</label>
                <input
                  type="text"
                  value={activePost.slug}
                  onChange={(e) => handleUpdateActivePost({ slug: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Publish Date</label>
                <input
                  type="date"
                  value={activePost.publishDate}
                  onChange={(e) => handleUpdateActivePost({ publishDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Publish Status</label>
                <select
                  value={activePost.status || 'published'}
                  onChange={(e) =>
                    handleUpdateActivePost({ status: e.target.value as 'published' | 'draft' })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs cursor-pointer"
                >
                  <option value="published">Published (Live)</option>
                  <option value="draft">Draft (Private)</option>
                </select>
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Executive Summary / Excerpt</label>
              <textarea
                rows={2}
                value={activePost.excerpt}
                onChange={(e) => handleUpdateActivePost({ excerpt: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs leading-relaxed focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Cover Image URL & Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Cover Image URL</span>
                <span className="text-[10px] text-slate-500">Pick preset or paste URL</span>
              </label>
              <input
                type="text"
                value={activePost.coverImage}
                onChange={(e) => handleUpdateActivePost({ coverImage: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
              />

              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-mono text-slate-500">Presets:</span>
                <div className="flex gap-2">
                  {PRESET_COVERS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleUpdateActivePost({ coverImage: url })}
                      className={`w-8 h-8 rounded-lg overflow-hidden border cursor-pointer ${
                        activePost.coverImage === url
                          ? 'border-cyan-400 scale-105'
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <img loading="lazy" src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Body Markdown Content */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">Article Body Content</label>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <span>Supports Markdown & Section Headers</span>
                </div>
              </div>
              <textarea
                rows={10}
                value={activePost.body}
                onChange={(e) => handleUpdateActivePost({ body: e.target.value })}
                placeholder="Write the full research paper or article in Markdown..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono leading-relaxed focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Tags Management */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Tags & Categorization</label>
              <div className="flex flex-wrap items-center gap-1.5">
                {(activePost.tags || []).map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 text-xs font-mono"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-red-400 ml-1"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>

              {/* Tag suggestions & custom tag adder */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Add custom tag..."
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(customTagInput);
                      }
                    }}
                    className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(customTagInput)}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {COMMON_TAGS.map((ct) => (
                    <button
                      key={ct}
                      type="button"
                      onClick={() => handleAddTag(ct)}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800"
                    >
                      +{ct}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Author */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Author Name</label>
                <input
                  type="text"
                  value={activePost.author?.name || ''}
                  onChange={(e) =>
                    handleUpdateActivePost({
                      author: {
                        ...activePost.author,
                        name: e.target.value,
                        role: activePost.author?.role || 'Staff Scientist',
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Author Role</label>
                <input
                  type="text"
                  value={activePost.author?.role || ''}
                  onChange={(e) =>
                    handleUpdateActivePost({
                      author: {
                        ...activePost.author,
                        role: e.target.value,
                        name: activePost.author?.name || 'Staff Scientist',
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activePost && (
        <VersionHistoryModal
          contentType="blog"
          contentId={activePost.id}
          contentTitle={activePost.title}
          currentData={activePost}
          isOpen={versionModalOpen}
          onClose={() => setVersionModalOpen(false)}
          onRollbackSuccess={(restoredItem) => {
            handleUpdateActivePost(restoredItem);
            showStatus(`Rolled back "${restoredItem.title}" to target version snapshot!`);
          }}
        />
      )}
    </div>
  );
};
