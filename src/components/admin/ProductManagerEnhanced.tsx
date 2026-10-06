import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { Plus, Edit, Trash2, Save, X, Tag, Package, DollarSign, Star, Layers } from 'lucide-react';

export const ProductManagerEnhanced: React.FC = () => {
  const { cmsData } = useCms();
  const products = (cmsData.products || []) as any[];
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
          <h2 className="text-lg font-bold text-white">Products Suite</h2>
          <p className="text-xs text-slate-400">Dynamic product catalog with categories & variants</p>
        </div>
        <button
          onClick={() => {
            setEditing({
              id: '',
              name: 'New Product',
              description: '',
              price: 0,
              category: 'general',
              features: [],
              icon: 'package',
              badge: '',
              ctaText: 'Learn More',
              active: true,
              tags: [],
            });
            setIsNew(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-cyan-400"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {editing && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">{isNew ? 'New Product' : 'Edit Product'}</h3>
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
              <label className="text-xs text-slate-400">Product Name</label>
              <input className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Category</label>
              <input className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white" value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} placeholder="ai, cloud, analytics, etc." />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Price</label>
              <input type="number" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white" value={editing.price} onChange={e => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Badge</label>
              <input className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white" value={editing.badge} onChange={e => setEditing({ ...editing, badge: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Description</label>
            <textarea rows={4} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white" value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p: any) => (
          <div key={p.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3 hover:border-cyan-500/30 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">{p.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-700 rounded-full text-slate-300">{p.category}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(p); setIsNew(false); }} className="p-1.5 hover:bg-slate-700 rounded-lg"><Edit className="w-3.5 h-3.5 text-slate-400" /></button>
                <button className="p-1.5 hover:bg-slate-700 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
              </div>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
            {p.price > 0 && (
              <div className="flex items-center gap-1 text-emerald-400">
                <DollarSign className="w-3.5 h-3.5" />
                <span className="text-sm font-bold">{p.price}</span>
              </div>
            )}
            {p.features && p.features.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {p.features.slice(0, 3).map((f: string, i: number) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-300">{f}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
