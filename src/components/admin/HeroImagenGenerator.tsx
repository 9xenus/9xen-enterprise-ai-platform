import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import {
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Sliders,
  Check,
  RotateCcw,
  Trash2,
  Clock,
  Layers,
  Eye,
  Loader2,
  Palette,
  Info,
  Maximize2,
} from 'lucide-react';
import { HeroGeneratedImage } from '../../types/cms';

const PRESET_PROMPTS = [
  {
    title: 'Neural Synaptic Topology',
    style: 'Abstract Cybernetic Mesh',
    prompt:
      'Intricate cybernetic neural network mesh with glowing cyan and violet synaptic nodes, fiber optic filaments pulsing across dark obsidian void, depth of field, 8k cinematic wallpaper, clean negative space for typography overlay',
  },
  {
    title: 'Obsidian Quantum AI Core',
    style: 'Quantum Supercomputing Nodes',
    prompt:
      'Monolithic futuristic quantum computer core, dark titanium and dark glass architecture, glowing cyan cooling lines, subtle volumetric purple haze, deep dark atmosphere, ultra wide, cinematic high contrast',
  },
  {
    title: 'Autonomous Multi-Agent Grid',
    style: 'Cinematic Sci-Fi',
    prompt:
      'Expansive digital grid representing autonomous multi-agent consensus, luminous data streams flowing through multidimensional nodes, dark twilight ambiance, cyan and cobalt glow, minimal noise',
  },
  {
    title: 'Deep Space Sovereign Cloud',
    style: 'Minimalist Deep Gradient',
    prompt:
      'Minimalist dark cosmic horizon with deep slate and indigo nebulous dust, subtle glowing cyan geometric vector lines framing the canvas, smooth atmospheric gradients, modern enterprise luxury aesthetic',
  },
];

const STYLES = [
  'Cinematic Sci-Fi',
  'Abstract Cybernetic Mesh',
  'Quantum Supercomputing Nodes',
  'Minimalist Deep Gradient',
];

export const HeroImagenGenerator: React.FC = () => {
  const { cmsData, updateCmsData, saveCmsData } = useCms();
  const hero = cmsData.hero || {};

  const [prompt, setPrompt] = useState(
    'Intricate cybernetic neural network mesh with glowing cyan and violet synaptic nodes, fiber optic filaments pulsing across dark obsidian void, cinematic wallpaper, clean negative space'
  );
  const [selectedStyle, setSelectedStyle] = useState('Cinematic Sci-Fi');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(hero.backgroundImageUrl || null);
  const [engineInfo, setEngineInfo] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Local settings for opacity and blur
  const overlayOpacity = hero.backgroundOverlayOpacity ?? 75;
  const backgroundBlur = hero.backgroundBlur ?? 0;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('Please enter a descriptive prompt for Imagen.');
      return;
    }

    setIsGenerating(true);
    setGenerationStep('Contacting Imagen 3 neural synthesis pipeline...');

    try {
      setTimeout(() => {
        setGenerationStep('Synthesizing panoramic 16:9 enterprise wallpaper...');
      }, 1200);

      const response = await fetch('/api/ai/generate-hero-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          aspectRatio,
        }),
      });

      const data = await response.json();

      if (data.success && data.imageUrl) {
        setPreviewUrl(data.imageUrl);
        setEngineInfo(data.engineUsed || 'Imagen 3');

        // Automatically set in CMS hero state
        const history: HeroGeneratedImage[] = hero.generatedHistory || [];
        const newRecord: HeroGeneratedImage = {
          id: `img-${Date.now()}`,
          url: data.imageUrl,
          prompt,
          style: selectedStyle,
          aspectRatio,
          createdAt: new Date().toISOString(),
        };

        updateCmsData({
          hero: {
            ...hero,
            backgroundImageUrl: data.imageUrl,
            backgroundImagePrompt: prompt,
            backgroundOverlayOpacity: hero.backgroundOverlayOpacity ?? 75,
            backgroundBlur: hero.backgroundBlur ?? 0,
            generatedHistory: [newRecord, ...history.slice(0, 15)],
          },
        });

        showToast('Generated imagery applied to Home Hero section!');
      } else {
        showToast(data.error || 'Failed to generate image. Please try again.');
      }
    } catch (err: any) {
      console.error('Imagen generation error:', err);
      showToast('Error communicating with Imagen API.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleApplyToHero = (url: string, pmt?: string) => {
    updateCmsData({
      hero: {
        ...hero,
        backgroundImageUrl: url,
        backgroundImagePrompt: pmt || hero.backgroundImagePrompt,
        backgroundOverlayOpacity: overlayOpacity,
        backgroundBlur: backgroundBlur,
      },
    });
    setPreviewUrl(url);
    showToast('Applied as active Home Hero background!');
  };

  const handleRemoveBackground = () => {
    updateCmsData({
      hero: {
        ...hero,
        backgroundImageUrl: undefined,
        backgroundImagePrompt: undefined,
      },
    });
    setPreviewUrl(null);
    showToast('Reverted to default minimalist glow canvas.');
  };

  const handleUpdateVisualControls = (newOpacity: number, newBlur: number) => {
    updateCmsData({
      hero: {
        ...hero,
        backgroundOverlayOpacity: newOpacity,
        backgroundBlur: newBlur,
      },
    });
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = (hero.generatedHistory || []).filter((item) => item.id !== id);
    updateCmsData({
      hero: {
        ...hero,
        generatedHistory: updated,
      },
    });
    showToast('Removed from history.');
  };

  const history = hero.generatedHistory || [];

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {notification && (
        <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-cyan-400 hover:text-cyan-200 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Main Generator Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Imagen Hero Background Generator</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Imagen 3
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generate customized, high-resolution generative wallpapers for the HomeView hero section.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hero.backgroundImageUrl ? (
              <button
                onClick={handleRemoveBackground}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-red-950/60 hover:text-red-400 text-slate-300 border border-slate-700/60 hover:border-red-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revert to Default Glow</span>
              </button>
            ) : (
              <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                Status: Default Ambient Canvas
              </span>
            )}
          </div>
        </div>

        {/* Curated Presets */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Curated Enterprise Presets</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PRESET_PROMPTS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(preset.prompt);
                  setSelectedStyle(preset.style);
                }}
                className="p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group cursor-pointer"
              >
                <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {preset.title}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                  {preset.prompt}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300">Prompt Description</label>
            <span className="text-[11px] text-slate-500 font-mono">
              Aspect Ratio: {aspectRatio}
            </span>
          </div>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the desired background atmosphere (e.g., deep space cybernetic core with glowing cyan filaments, dark reflective surfaces, clean negative space)..."
            className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs leading-relaxed focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Controls Row: Style & Aspect Ratio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-violet-400" />
              <span>Artistic Style</span>
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs cursor-pointer focus:outline-none focus:border-cyan-500"
            >
              {STYLES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Aspect Ratio</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['16:9', '21:9', '16:10'].map((ar) => (
                <button
                  key={ar}
                  type="button"
                  onClick={() => setAspectRatio(ar)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold font-mono border transition-all cursor-pointer ${
                    aspectRatio === ar
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {ar}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generation Trigger Button */}
        <div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-600 to-indigo-600 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{generationStep || 'Generating with Imagen...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
                <span>Generate & Apply Custom Hero Wallpaper</span>
              </>
            )}
          </button>
        </div>

        {/* Active / Preview Imagery Section */}
        {previewUrl && (
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white">Active Background Simulation</h4>
                {engineInfo && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                    {engineInfo}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Live in HomeView</span>
              </span>
            </div>

            {/* Interactive Preview Canvas */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 aspect-video max-h-80 w-full group shadow-2xl">
              <img
                src={previewUrl}
                alt="Active Hero Preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-all duration-300"
                style={{
                  filter: `blur(${backgroundBlur}px)`,
                }}
              />
              {/* Dynamic Overlay Simulation */}
              <div
                className="absolute inset-0 bg-slate-950 transition-opacity"
                style={{
                  opacity: overlayOpacity / 100,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950 pointer-events-none" />

              {/* Mock Typography to verify contrast */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-[10px] text-cyan-400 font-semibold mb-3 shadow">
                  <Sparkles className="w-3 h-3" />
                  <span>{hero.badge || hero.badgeText || 'Enterprise AI Platform'}</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white max-w-lg leading-tight drop-shadow-md">
                  {hero.headline || 'Autonomous Intelligence for Mission-Critical Enterprise'}
                </h2>
                <p className="text-[11px] text-slate-300 max-w-md mt-2 line-clamp-2 drop-shadow">
                  {hero.subheadline || 'Private neural networks and autonomous multi-agent workflows.'}
                </p>
              </div>
            </div>

            {/* Adjustment Sliders: Contrast Mask & Blur */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Typography Contrast & Atmospheric Tuning</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Overlay Opacity */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Dark Mask Opacity</span>
                    <span className="text-cyan-400 font-mono font-bold">{overlayOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="95"
                    step="5"
                    value={overlayOpacity}
                    onChange={(e) =>
                      handleUpdateVisualControls(Number(e.target.value), backgroundBlur)
                    }
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Higher values darken the background for high-contrast WCAG AA readability.
                  </span>
                </div>

                {/* Background Blur */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Gaussian Soft Blur</span>
                    <span className="text-violet-400 font-mono font-bold">{backgroundBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="16"
                    step="1"
                    value={backgroundBlur}
                    onChange={(e) =>
                      handleUpdateVisualControls(overlayOpacity, Number(e.target.value))
                    }
                    className="w-full accent-violet-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Softens sharp geometric patterns so text stays prominent.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Gallery */}
        {history.length > 0 && (
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <h4 className="text-xs font-bold text-slate-300">
                  Generation Gallery & History ({history.length})
                </h4>
              </div>
              <span className="text-[11px] text-slate-500">
                Click any asset to re-apply to Home Hero
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {history.map((item) => {
                const isActive = hero.backgroundImageUrl === item.url;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleApplyToHero(item.url, item.prompt)}
                    className={`group relative rounded-xl overflow-hidden border transition-all cursor-pointer aspect-video bg-slate-950 ${
                      isActive
                        ? 'border-cyan-500 shadow-lg shadow-cyan-500/20'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.prompt}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <div className="flex justify-end">
                        <button
                          onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                          title="Remove from history"
                          className="p-1 rounded-md bg-slate-900/80 hover:bg-red-950 hover:text-red-400 text-slate-400 border border-slate-700/60"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-[9px] text-slate-300 line-clamp-1">
                        {item.prompt}
                      </div>
                    </div>
                    {isActive && (
                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-cyan-500 text-slate-950 text-[9px] font-bold font-mono shadow">
                        ACTIVE
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
