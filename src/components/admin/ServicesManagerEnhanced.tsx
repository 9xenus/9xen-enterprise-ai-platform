import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { Plus, Edit, Trash2, Save, X, Briefcase, Zap, Cpu } from 'lucide-react';

export const ServicesManagerEnhanced: React.FC = () => {
  const { cmsData } = useCms();
  const services = (cmsData.services || []) as any[];
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);

  const handleSave = () => {
    setEditing(null);
    setIsNew(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Services</h2>
          <p className="text-xs text-slate-400">Dynamic service offerings with categories</p>
        </div>
        <button
          onClick={() => {
            setEditing({
              id: '',
              title: 'New Service',
              description: '',
              category: 'consulting',
              icon: 'zap',
              features: [],
              technologies: [],
              active: true,
            });
            setIsNew(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-cyan-400"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {editing && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">{isNew ? 'New Service' : 'Edit Service'}</h3>
            <div className="flex gap-2">
              <button onClick={handleSave} className="px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1">
                <Save className="w-3 h-3" /> Save
              </button>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-3 py-1.5 bg-slate-700 rounded-lg text-xs flex items-center gap-1">
                <X className="w-3 h-3" /> Cancel
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Service Title</label>
              <input className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Category</label>
              <input className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white" value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Description</label>
            <textarea rows={4} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white" value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s: any) => (
          <div key={s.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3 hover:border-cyan-500/30 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">{s.title}</h3>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-700 rounded-full text-slate-300">{s.category}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(s); setIsNew(false); }} className="p-1.5 hover:bg-slate-700 rounded-lg"><Edit className="w-3.5 h-3.5 text-slate-400" /></button>
                <button className="p-1.5 hover:bg-slate-700 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
              </div>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2">{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
