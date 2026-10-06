import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { Database, Plus, Edit, Trash2, Save, X, Code, Globe, Layers } from 'lucide-react';

export const DynamicContentManager: React.FC = () => {
  const { cmsData } = useCms() as any;
  const items = (cmsData.dynamicContent || []) as any[];

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
          <h2 className="text-lg font-bold text-white">Dynamic Content</h2>
          <p className="text-xs text-slate-400">Reusable content blocks and dynamic variables</p>
        </div>
        <button
          onClick={() => {
            setEditing({
              id: '',
              key: 'new-key',
              contentType: 'text',
              content: '',
              data: {},
              locale: 'en',
            });
            setIsNew(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-cyan-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Dynamic Content
        </button>
      </div>

      {editing && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">{isNew ? 'Add Content' : 'Edit Content'}</h3>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold hover:bg-emerald-400"
              >
                <Save className="w-3 h-3" />
                Save
              </button>
              <button
                onClick={() => {
                  setEditing(null);
                  setIsNew(false);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 text-white rounded-lg text-xs hover:bg-slate-600"
              >
                <X className="w-3 h-3" />
                Close
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Key (Unique)</label>
              <input
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                value={editing.key}
                onChange={(e) => setEditing({ ...editing, key: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Content Type</label>
              <select
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                value={editing.contentType}
                onChange={(e) => setEditing({ ...editing, contentType: e.target.value })}
              >
                <option value="text">Text</option>
                <option value="html">HTML</option>
                <option value="json">JSON</option>
                <option value="markdown">Markdown</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Locale</label>
              <input
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                value={editing.locale}
                onChange={(e) => setEditing({ ...editing, locale: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400">Content</label>
            <textarea
              rows={10}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm font-mono"
              value={editing.content}
              onChange={(e) => setEditing({ ...editing, content: e.target.value })}
            />
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4" />
            Dynamic Content Items ({items.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-700">
          {items.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No dynamic content found.</div>
          ) : (
            items.map((item: any) => (
              <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Code className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{item.key}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-700 text-slate-300">
                        {item.contentType}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-700 text-slate-300">
                        {item.locale}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 truncate max-w-md">
                      {item.content?.substring(0, 60)}...
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditing(item);
                      setIsNew(false);
                    }}
                    className="p-2 hover:bg-slate-700 rounded-lg"
                  >
                    <Edit className="w-4 h-4 text-slate-400" />
                  </button>
                  <button className="p-2 hover:bg-slate-700 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
