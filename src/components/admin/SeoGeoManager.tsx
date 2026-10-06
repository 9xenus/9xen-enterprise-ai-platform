import React, { useState } from 'react';
import { Globe, MapPin, Link, Sitemap, Search, Settings } from 'lucide-react';

export const SeoGeoManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'global' | 'pages' | 'redirects' | 'sitemap'>('global');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">SEO & GEO Manager</h2>
        <p className="text-xs text-slate-400">Advanced on-page SEO, Geo-tagging, redirects & sitemaps</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'global', label: 'Global SEO', icon: Settings },
          { id: 'pages', label: 'Page SEO', icon: Search },
          { id: 'redirects', label: 'Redirects', icon: Link },
          { id: 'sitemap', label: 'Sitemap', icon: Sitemap },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800/50 text-slate-300 border border-slate-700 hover:bg-slate-800'}`}
            >
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'global' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">Global SEO Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Default Meta Title</label>
              <input className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white" placeholder="e.g. 9xen - Enterprise AI Platform" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Domain</label>
              <input className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white" placeholder="https://example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Default Meta Description</label>
            <textarea rows={3} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white" />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Open Graph Image</label>
            <input className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white" placeholder="https://example.com/og-image.jpg" />
          </div>
        </div>
      )}

      {activeTab === 'pages' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-2">
            <Search className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Page-level SEO & Geo</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Geo Region</label>
                <input className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white" placeholder="US, EU, Middle East, APAC" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Geo Placename</label>
                <input className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white" placeholder="Dubai, London, New York" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Geo Position (Lat,Lng)</label>
                <input className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white" placeholder="25.2048,55.2708" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Focus Keyword</label>
                <input className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white" placeholder="enterprise ai platform" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Canonical URL</label>
                <input className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5" /> Geo meta tags for local SEO targeting
            </div>
          </div>
        </div>
      )}

      {activeTab === 'redirects' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Redirect Manager</h3>
            </div>
            <button className="px-3 py-1.5 bg-cyan-500 text-slate-950 rounded-lg text-xs font-bold">Add Redirect</button>
          </div>
          <div className="p-6 text-center text-slate-400 text-sm">No redirects configured</div>
        </div>
      )}

      {activeTab === 'sitemap' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sitemap className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">XML Sitemap</h3>
            </div>
            <button className="px-3 py-1.5 bg-cyan-500 text-slate-950 rounded-lg text-xs font-bold">Generate Sitemap</button>
          </div>
          <div className="p-6 space-y-2 text-sm text-slate-300">
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <span className="text-slate-400">sitemap.xml</span>
              <span className="text-[10px] text-emerald-400">Auto-generated</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
