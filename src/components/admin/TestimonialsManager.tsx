import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { Testimonial } from '../../types/cms';
import { ConfirmModal } from '../common/ConfirmModal';
import { Plus, Trash2, Edit, Save, X, Star } from 'lucide-react';

export const TestimonialsManager: React.FC<{ onPreview?: () => void }> = ({ onPreview }) => {
  const { cmsData, saveTestimonial, deleteTestimonial } = useCms();
  const items = cmsData.testimonials || [];
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Testimonials ({items.length})</h3>
        <button onClick={() => { setEditing({ id: '', quote: '', author: '', role: '', company: '', avatarUrl: '', rating: 5 }); setIsNew(true); }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold"><Plus className="w-3 h-3" />Add</button>
      </div>
      {editing && (
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
          <input className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white" placeholder="Quote" value={editing.quote} onChange={e => setEditing({...editing, quote: e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
            <input className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white" placeholder="Author" value={editing.author} onChange={e => setEditing({...editing, author: e.target.value})} />
            <input className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white" placeholder="Role" value={editing.role} onChange={e => setEditing({...editing, role: e.target.value})} />
            <input className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white" placeholder="Company" value={editing.company} onChange={e => setEditing({...editing, company: e.target.value})} />
            <input className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white" placeholder="Avatar URL" value={editing.avatarUrl} onChange={e => setEditing({...editing, avatarUrl: e.target.value})} />
          </div>
          <input type="number" min="1" max="5" className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white w-24" value={editing.rating} onChange={e => setEditing({...editing, rating: parseInt(e.target.value)})} />
          <div className="flex gap-2">
            <button onClick={async () => { await saveTestimonial(editing, isNew ? undefined : editing.id); setEditing(null); }} className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold"><Save className="w-3 h-3 inline mr-1" />Save</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg bg-slate-700 text-white text-xs"><X className="w-3 h-3 inline mr-1" />Cancel</button>
          </div>
        </div>
      )}
      {items.map(item => (
        <div key={item.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{item.author}</span>
              <span className="text-xs text-slate-400">{item.role}, {item.company}</span>
            </div>
            <div className="flex gap-0.5 mt-1">{[...Array(item.rating)].map((_, i) => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}</div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.quote}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setEditing(item); setIsNew(false); }} className="p-2 rounded-lg hover:bg-slate-700"><Edit className="w-4 h-4 text-slate-400" /></button>
            <button onClick={() => setDelId(item.id)} className="p-2 rounded-lg hover:bg-red-500/20"><Trash2 className="w-4 h-4 text-red-400" /></button>
          </div>
        </div>
      ))}
      {delId && <ConfirmModal title="Delete Testimonial?" message="Are you sure?" onConfirm={() => { deleteTestimonial(delId); setDelId(null); }} onCancel={() => setDelId(null)} />}
    </div>
  );
};
