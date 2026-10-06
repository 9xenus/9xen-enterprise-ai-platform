import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { CloudCreditUsage, AboutUsContent, PopupBanner } from '../../types/cms';
import { Save, X, Edit, Globe, CreditCard, Info, Mail, MessageSquare } from 'lucide-react';

export const SiteContentManager: React.FC = () => {
  const { cmsData, updateSettings } = useCms();
  const [activeSection, setActiveSection] = useState<'credits' | 'about' | 'popup' | 'newsletter' | 'chats'>('credits');

  const newsletterSubs = cmsData.newsletterSubscribers || [];
  const chatSessions = cmsData.chatSessions || [];
  const cloudCredits = cmsData.cloudCredits || [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'credits', label: 'Cloud Credits', icon: CreditCard },
          { id: 'about', label: 'About Us', icon: Info },
          { id: 'popup', label: 'Popup Banner', icon: Globe },
          { id: 'newsletter', label: 'Newsletter', icon: Mail },
          { id: 'chats', label: 'Chat Sessions', icon: MessageSquare },
        ].map(s => {
          const Icon = s.icon;
          return (
            <button key={s.id} onClick={() => setActiveSection(s.id as any)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeSection === s.id ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}>
              <Icon className="w-3.5 h-3.5" />{s.label}
            </button>
          );
        })}
      </div>

      {activeSection === 'credits' && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white">Cloud Credit Usage</h3>
          {cloudCredits.length === 0 ? <p className="text-xs text-slate-500">No cloud credit data configured.</p> : cloudCredits.map((c: CloudCreditUsage) => (
            <div key={c.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{c.provider} — {c.service}</span>
                <span className="text-xs font-mono text-cyan-400">{c.used}/{c.limit} {c.unit}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-700 overflow-hidden">
                <div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${Math.min((c.used / c.limit) * 100, 100)}%` }} />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Resets: {c.resetDate ? new Date(c.resetDate).toLocaleDateString() : 'N/A'}</p>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'about' && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white">About Us Content</h3>
          <p className="text-xs text-slate-400">About Us content is managed through the Hero & Branding tab. This section displays a read-only summary.</p>
          {cmsData.aboutUs ? (
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-2">
              <p className="text-sm text-white font-bold">{cmsData.aboutUs.headline}</p>
              <p className="text-xs text-slate-400">{cmsData.aboutUs.subheadline}</p>
              <p className="text-xs text-slate-500 mt-2">Mission: {cmsData.aboutUs.mission}</p>
              <p className="text-xs text-slate-500">Vision: {cmsData.aboutUs.vision}</p>
              <p className="text-xs text-slate-500">Milestones: {cmsData.aboutUs.milestones?.length || 0} | Pillars: {cmsData.aboutUs.pillars?.length || 0}</p>
            </div>
          ) : <p className="text-xs text-slate-500">No About Us content configured.</p>}
        </div>
      )}

      {activeSection === 'popup' && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white">Popup Banner</h3>
          {cmsData.popupBanner ? (
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-2">
              <p className="text-sm text-white font-bold">{cmsData.popupBanner.title}</p>
              <p className="text-xs text-slate-400">{cmsData.popupBanner.subtitle}</p>
              <p className="text-xs text-slate-500">{cmsData.popupBanner.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cmsData.popupBanner.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>{cmsData.popupBanner.isActive ? 'Active' : 'Inactive'}</span>
                <span className="text-xs text-cyan-400">{cmsData.popupBanner.ctaText}</span>
              </div>
            </div>
          ) : <p className="text-xs text-slate-500">No popup banner configured.</p>}
        </div>
      )}

      {activeSection === 'newsletter' && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white">Newsletter Subscribers ({newsletterSubs.length})</h3>
          {newsletterSubs.length === 0 ? <p className="text-xs text-slate-500">No subscribers yet.</p> : (
            <div className="space-y-1">
              {newsletterSubs.map((email: string, i: number) => (
                <div key={i} className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-xs text-slate-300">{email}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSection === 'chats' && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white">Chat Sessions ({chatSessions.length})</h3>
          {chatSessions.length === 0 ? <p className="text-xs text-slate-500">No chat sessions recorded.</p> : chatSessions.map((s: any) => (
            <div key={s.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{s.title || 'Untitled'}</span>
                <span className="text-[10px] text-slate-500">{s.model} | {s.persona}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{s.messages?.length || 0} messages | {s.isPinned ? '📌 Pinned' : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
