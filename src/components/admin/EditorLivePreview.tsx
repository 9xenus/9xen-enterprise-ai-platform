import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { HomeView } from '../views/HomeView';
import { BlogView } from '../views/BlogView';
import { ProductsView } from '../views/ProductsView';
import { ModelsView } from '../views/ModelsView';
import {
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  Minimize2,
  RefreshCw,
  Eye,
  X,
  FileText,
  Sparkles,
  Layers,
  CheckCircle2,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  ExternalLink,
} from 'lucide-react';

export type PreviewTarget = 'home' | 'blog' | 'products' | 'services' | 'models';
export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

interface Props {
  previewTarget: PreviewTarget;
  onChangePreviewTarget: (target: PreviewTarget) => void;
  selectedBlogPostId: string | null;
  onSelectBlogPostId: (id: string | null) => void;
  onClosePreview: () => void;
  splitRatio: string;
  onChangeSplitRatio: (ratio: string) => void;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export const EditorLivePreview: React.FC<Props> = ({
  previewTarget,
  onChangePreviewTarget,
  selectedBlogPostId,
  onSelectBlogPostId,
  onClosePreview,
  splitRatio,
  onChangeSplitRatio,
  isFullScreen = false,
  onToggleFullScreen,
}) => {
  const { cmsData } = useCms();
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [showViewDropdown, setShowViewDropdown] = useState(false);

  const blogPosts = cmsData.blogPosts || [];
  const currentPost = blogPosts.find((p) => p.id === selectedBlogPostId);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const getDeviceWidthClass = () => {
    switch (deviceMode) {
      case 'mobile':
        return 'w-[375px] max-w-full';
      case 'tablet':
        return 'w-[768px] max-w-full';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  const getSimulatedUrl = () => {
    if (previewTarget === 'home') {
      return 'https://9xen.enterprise.ai/';
    }
    if (previewTarget === 'blog') {
      if (selectedBlogPostId && currentPost) {
        return `https://9xen.enterprise.ai/research/${currentPost.slug || currentPost.id}`;
      }
      return 'https://9xen.enterprise.ai/research';
    }
    if (previewTarget === 'products') {
      return 'https://9xen.enterprise.ai/products';
    }
    return 'https://9xen.enterprise.ai/services';
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border-l border-slate-800 text-slate-200 overflow-hidden select-none">
      {/* Top Preview Chrome Toolbar */}
      <div className="h-14 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between gap-3 shrink-0">
        {/* Left side: View Switcher & Target Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowViewDropdown(!showViewDropdown)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700/80 cursor-pointer"
            >
              {previewTarget === 'home' && <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
              {previewTarget === 'blog' && <FileText className="w-3.5 h-3.5 text-violet-400" />}
              {previewTarget === 'products' && <Layers className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="capitalize">
                {previewTarget === 'home'
                  ? 'Home (Live Hero)'
                  : previewTarget === 'blog'
                  ? selectedBlogPostId && currentPost
                    ? `Article: ${currentPost.title.slice(0, 16)}...`
                    : 'Research & Blog'
                  : previewTarget}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showViewDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowViewDropdown(false)}
                />
                <div className="absolute top-full left-0 mt-1.5 w-60 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-1.5 z-50 text-xs space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Select Preview Target
                  </div>
                  <button
                    onClick={() => {
                      onChangePreviewTarget('home');
                      setShowViewDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left cursor-pointer transition-colors ${
                      previewTarget === 'home'
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div>Home Page & Hero</div>
                      <div className="text-[10px] text-slate-400">Live wallpaper & copy edits</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onChangePreviewTarget('blog');
                      onSelectBlogPostId(null);
                      setShowViewDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left cursor-pointer transition-colors ${
                      previewTarget === 'blog' && !selectedBlogPostId
                        ? 'bg-violet-500/20 text-violet-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-violet-400" />
                    <div>
                      <div>Blog & Research Listing</div>
                      <div className="text-[10px] text-slate-400">All published articles</div>
                    </div>
                  </button>

                  {/* Blog Posts Sub-Items if any */}
                  {blogPosts.length > 0 && (
                    <div className="pt-1 border-t border-slate-800">
                      <div className="px-2.5 py-1 text-[10px] font-mono text-slate-400">
                        Preview Specific Post:
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-0.5">
                        {blogPosts.slice(0, 6).map((post) => (
                          <button
                            key={post.id}
                            onClick={() => {
                              onChangePreviewTarget('blog');
                              onSelectBlogPostId(post.id);
                              setShowViewDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] truncate cursor-pointer transition-colors ${
                              selectedBlogPostId === post.id
                                ? 'bg-violet-500/20 text-violet-300 font-bold'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            {post.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Real-time sync badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">Live Real-Time Sync</span>
          </div>
        </div>

        {/* Center: Device Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setDeviceMode('desktop')}
            title="Desktop Viewport (100% Fluid)"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              deviceMode === 'desktop'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            title="Tablet Viewport (768px)"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              deviceMode === 'tablet'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            title="Mobile Viewport (375px)"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              deviceMode === 'mobile'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right side: Split Controls, Fullscreen, Close */}
        <div className="flex items-center gap-1.5">
          {/* Split Ratio pills (visible on large screen) */}
          <div className="hidden xl:flex items-center gap-1 bg-slate-950 px-1 py-0.5 rounded-xl border border-slate-800 text-[10px] font-mono">
            {['50/50', '40/60', '60/40'].map((r) => (
              <button
                key={r}
                onClick={() => onChangeSplitRatio(r)}
                className={`px-1.5 py-0.5 rounded-md cursor-pointer transition-colors ${
                  splitRatio === r
                    ? 'bg-slate-800 text-cyan-400 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            title="Refresh Preview Frame"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {onToggleFullScreen && (
            <button
              onClick={onToggleFullScreen}
              title={isFullScreen ? 'Exit Full Screen' : 'Expand Preview Full Screen'}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              {isFullScreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          <button
            onClick={onClosePreview}
            title="Close Editor Preview"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Simulated Browser Bar */}
      <div className="h-9 bg-slate-950/90 border-b border-slate-800/80 px-4 flex items-center justify-between text-[11px] font-mono text-slate-500 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
          </div>
          <span className="text-slate-600 pl-2">SSL Verified</span>
        </div>

        <div className="px-3 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 truncate max-w-sm sm:max-w-md">
          {getSimulatedUrl()}
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span>{deviceMode.toUpperCase()}</span>
          <span>•</span>
          <span className="text-cyan-400">
            {deviceMode === 'mobile' ? '375px' : deviceMode === 'tablet' ? '768px' : '100% FLUID'}
          </span>
        </div>
      </div>

      {/* Main Preview Screen / Viewport Frame */}
      <div className="flex-1 overflow-y-auto bg-slate-950 p-3 sm:p-6 flex flex-col items-center justify-start">
        <div
          key={refreshKey}
          style={{
            transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
            transformOrigin: 'top center',
          }}
          className={`transition-all duration-300 min-h-full ${getDeviceWidthClass()} ${
            deviceMode !== 'desktop'
              ? 'rounded-[2.5rem] border-[6px] border-slate-800 shadow-2xl bg-slate-950 overflow-hidden my-4'
              : 'w-full'
          }`}
        >
          {/* Simulated Mobile Speaker Notch */}
          {deviceMode === 'mobile' && (
            <div className="h-6 bg-slate-900 w-full flex items-center justify-center">
              <div className="w-16 h-1 rounded-full bg-slate-700" />
            </div>
          )}

          {/* Render Target View */}
          <div className="overflow-x-hidden min-h-[700px]">
            {previewTarget === 'home' && (
              <HomeView
                onNavigate={(tab, id) => {
                  if (tab === 'blog') {
                    onChangePreviewTarget('blog');
                    if (id) onSelectBlogPostId(id);
                  }
                }}
                onOpenDemo={() => {}}
              />
            )}

            {previewTarget === 'blog' && (
              <BlogView
                selectedId={selectedBlogPostId || undefined}
                onSelectPost={(id) => onSelectBlogPostId(id)}
              />
            )}

            {previewTarget === 'products' && (
              <ProductsView
                onOpenDemo={() => {}}
                onNavigate={(tab) => {
                  if (tab === 'blog') onChangePreviewTarget('blog');
                  if (tab === 'home') onChangePreviewTarget('home');
                }}
              />
            )}

            {previewTarget === 'models' && (
              <ModelsView
                onOpenDemo={() => {}}
                onNavigate={(tab) => {
                  if (tab === 'home') onChangePreviewTarget('home');
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom status footer */}
      <div className="h-7 border-t border-slate-800/80 bg-slate-900/60 px-4 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-bold">EDITOR PREVIEW</span>
          <span>|</span>
          <span>Updates in real-time as you edit in the left panel</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Target: {previewTarget.toUpperCase()}</span>
          {selectedBlogPostId && <span>(Single Article Mode)</span>}
        </div>
      </div>
    </div>
  );
};
