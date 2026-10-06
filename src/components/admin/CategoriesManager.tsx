import React, { useState, useEffect } from 'react';
import { Plus, Tag, Save, X, Edit, Trash2, Layers } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  type: 'product' | 'service' | 'both';
  description?: string;
  sortOrder: number;
  active: boolean;
}

export const CategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => setCategories(d || []))
      .catch(() => setCategories([]));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Categories</h2>
          <p className="text-xs text-slate-400">Dynamic product & service categories</p>
        </div>
        <button
          onClick={() => {
            setEditing({
              id: '',
              name: 'New Category',
              slug: 'new-category',
              type: 'both',
              sortOrder: categories.length,
              active: true,
            });
            setIsNew(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-cyan-400"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {editing && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
          <div className="flex justify-between">
            <h3 className="text-sm font-bold text-white">{isNew ? 'New Category' : 'Edit Category'}</h3>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1">
                <Save className="w-3 h-3" /> Save
              </button>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-3 py-1.5 bg-slate-700 rounded-lg text-xs flex items-center gap-1">
                <X className="w-3 h-3" /> Cancel
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Name</label>
              <input className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Slug</label>
              <input className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white" value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Type</label>
              <select className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white" value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value as any })}>
                <option value="both">Both</option>
                <option value="product">Product</option>
                <option value="service">Service</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Description</label>
            <textarea rows={3} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white" value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} />
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><Tag className="w-4 h-4" /> Categories ({categories.length})</h3>
        </div>
        <div className="divide-y divide-slate-700">
          {categories.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No categories found.</div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-medium">{cat.name}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-700 rounded-full text-slate-300">{cat.type}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-300">/{cat.slug}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{cat.description}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(cat); setIsNew(false); }} className="p-2 hover:bg-slate-700 rounded-lg"><Edit className="w-4 h-4 text-slate-400" /></button>
                  <button className="p-2 hover:bg-slate-700 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
