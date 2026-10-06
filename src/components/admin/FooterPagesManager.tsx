import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { FooterPage } from '../../types/cms';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';

export const FooterPagesManager: React.FC = () => {
  const { cmsData, saveFooterPage } = useCms();
  const items = cmsData.footerPages || [];
  const [editing, setEditing] = useState<FooterPage | null>(null);
  const [isNew, setIsNew] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Footer Pages ({items.length})</h3>
        <button onClick={() => { setEditing({ id: '', slug: '', title: '', content: '' }); setIsNew(true); }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold"><Plus className="w-3 h-3" />Add</button>
      </div>
      {editing && (
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
          <input className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white" placeholder="Title" value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})} />
          <input className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white" placeholder="Slug" value={editing.slug} onChange={e => setEditing({...editing, slug: e.target.value})} />
          <textarea rows={6} className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-mono" placeholder="HTML Content" value={editing.content} onChange={e => setEditing({...editing, content: e.target.value})} />
          <div className="flex gap-2">
            <button onClick={async () => { await saveFooterPage(editing, isNew ? undefined : editing.id); setEditing(null); }} className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold"><Save className="w-3 h-3 inline mr-1" />Save</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg bg-slate-700 text-white text-xs"><X className="w-3 h-3 inline mr-1" />Cancel</button>
          </div>
        </div>
      )}
      {items.map(item => (
        <div key={item.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between">
          <div><span className="text-sm font-bold text-white">{item.title}</span><span className="text-xs text-slate-400 ml-2">/{item.slug}</span></div>
          <button onClick={() => { setEditing(item); setIsNew(false); }} className="p-2 rounded-lg hover:bg-slate-700"><Edit className="w-4 h-4 text-slate-400" /></button>
        </div>
      ))}
    </div>
  );
};
