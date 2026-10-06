import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { Plus, Edit, Trash2, Save, X, FileText, Globe, Clock, Eye, Settings } from 'lucide-react';

export const PagesManager: React.FC = () => {
  const { cmsData } = useCms() as any;
  const pages = (cmsData.pages || []) as any[];

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
          <h2 className="text-lg font-bold text-white">Pages</h2>
          <p className="text-xs text-slate-400">Manage your site's pages with a WordPress-like editor</p>
        </div>
        <button
          onClick={() => {
            setEditing({
              id: '',
              title: 'New Page',
              slug: 'new-page',
              content: '',
              status: 'draft',
              template: 'default',
              metaTitle: '',
              metaDescription: '',
            });
            setIsNew(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-cyan-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Page
        </button>
      </div>

      {editing && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">{isNew ? 'Add New Page' : 'Edit Page'}</h3>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold hover:bg-emerald-400"
              >
                <Save className="w-3 h-3" />
                Publish
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Page Title</label>
              <input
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Slug</label>
              <input
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400">Content</label>
            <textarea
              rows={15}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm font-mono"
              value={editing.content}
              onChange={(e) => setEditing({ ...editing, content: e.target.value })}
              placeholder="Start writing your content here... (HTML or Markdown supported)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-700">
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Meta Title</label>
              <input
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                value={editing.metaTitle}
                onChange={(e) => setEditing({ ...editing, metaTitle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Template</label>
              <select
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                value={editing.template}
                onChange={(e) => setEditing({ ...editing, template: e.target.value })}
              >
                <option value="default">Default</option>
                <option value="full-width">Full Width</option>
                <option value="with-sidebar">With Sidebar</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400">Meta Description</label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
              value={editing.metaDescription}
              onChange={(e) => setEditing({ ...editing, metaDescription: e.target.value })}
            />
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4" />
            All Pages ({pages.length})
          </h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 text-white rounded-lg text-xs hover:bg-slate-600">
              <Globe className="w-3 h-3" />
              View Site
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-700">
          {pages.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No pages found. Create your first page!</div>
          ) : (
            pages.map((page: any) => (
              <div key={page.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <FileText className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{page.title}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {page.status || 'published'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                      <span>/{page.slug}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {page.updatedAt || 'Recently'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-slate-700 rounded-lg">
                    <Eye className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => {
                      setEditing(page);
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
