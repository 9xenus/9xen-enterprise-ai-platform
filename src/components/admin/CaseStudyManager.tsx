import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { CaseStudy } from '../../types/cms';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Eye,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface Props {
  onPreviewCaseStudies: () => void;
}

export const CaseStudyManager: React.FC<Props> = ({ onPreviewCaseStudies }) => {
  const { cmsData, saveCaseStudy, deleteCaseStudy } = useCms();
  const caseStudies = (cmsData.caseStudies || []) as CaseStudy[];

  const [editingItem, setEditingItem] = useState<CaseStudy | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dbNotice, setDbNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [newTagText, setNewTagText] = useState('');

  const handleCreateNew = () => {
    const fresh: CaseStudy = {
      id: `cs-${Date.now()}`,
      slug: `case-study-${Date.now()}`,
      title: 'Tier-1 Global HFT Latency Reduction',
      client: 'Apex Quantitative Alpha Fund',
      industry: 'High-Frequency Trading & Market Making',
      impactMetric: '310% Execution Speedup & Zero Slippage',
      summary: 'Migrated legacy FIX infrastructure to 9xen autonomous neural gateway with dedicated H100 GPU clusters.',
      body: 'Detailed technical case study analyzing end-to-end order execution speed, kernel bypass network optimization, and automated compliance auditing.',
      coverImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
      tags: ['HFT', 'FIX 4.4', 'GPU Acceleration', 'Low Latency'],
    };
    setEditingItem(fresh);
    setIsNew(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    try {
      const ok = await saveCaseStudy(editingItem, isNew ? undefined : editingItem.id);
      if (ok) {
        setDbNotice({
          type: 'success',
          message: `Case study "${editingItem.title}" committed to DuckDB "case_studies" table successfully!`,
        });
        setEditingItem(null);
        setIsNew(false);
        setTimeout(() => setDbNotice(null), 4000);
      }
    } catch (err: any) {
      setDbNotice({ type: 'error', message: err.message || 'Failed saving case study.' });
      setTimeout(() => setDbNotice(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsSaving(true);
    try {
      const ok = await deleteCaseStudy(itemToDelete.id);
      if (ok) {
        if (editingItem?.id === itemToDelete.id) setEditingItem(null);
        setDbNotice({ type: 'success', message: `Case study "${itemToDelete.title}" deleted successfully.` });
        setTimeout(() => setDbNotice(null), 4000);
      }
    } catch (err: any) {
      setDbNotice({ type: 'error', message: err.message || 'Failed deleting case study.' });
      setTimeout(() => setDbNotice(null), 5000);
    } finally {
      setIsSaving(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6 text-xs text-slate-200">
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>Institutional Case Studies Manager</span>
          </h2>
          <p className="text-slate-400 mt-1">
            Publish quantitative impact studies and institutional success metrics ({caseStudies.length} active).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPreviewCaseStudies}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Live Preview</span>
          </button>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Case Study</span>
          </button>
        </div>
      </div>

      {dbNotice && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 ${
          dbNotice.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{dbNotice.message}</span>
        </div>
      )}

      {/* Grid of Case Studies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {caseStudies.map((item) => (
          <div key={item.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  {item.industry}
                </span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">{item.client}</span>
              </div>
              <h3 className="text-base font-bold text-white">{item.title}</h3>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-[11px] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{item.impactMetric}</span>
              </div>
              <p className="text-slate-400 text-[11px] line-clamp-2">{item.summary}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                {(item.tags || []).slice(0, 3).map((t, idx) => (
                  <span key={idx} className="text-[9px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setEditingItem(item); setIsNew(false); }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => { setItemToDelete({ id: item.id, title: item.title }); setIsDeleteModalOpen(true); }}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer border border-rose-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <span>{isNew ? 'Create New Case Study' : `Edit Case Study: ${editingItem.title}`}</span>
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Case Study Title</label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Client / Institution</label>
                  <input
                    type="text"
                    required
                    value={editingItem.client}
                    onChange={(e) => setEditingItem({ ...editingItem, client: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Industry / Sector</label>
                  <input
                    type="text"
                    required
                    value={editingItem.industry}
                    onChange={(e) => setEditingItem({ ...editingItem, industry: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Impact Metric Banner</label>
                  <input
                    type="text"
                    required
                    value={editingItem.impactMetric}
                    onChange={(e) => setEditingItem({ ...editingItem, impactMetric: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Slug ID</label>
                  <input
                    type="text"
                    required
                    value={editingItem.slug}
                    onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Executive Summary</label>
                <textarea
                  rows={2}
                  required
                  value={editingItem.summary}
                  onChange={(e) => setEditingItem({ ...editingItem, summary: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Full Case Study Body</label>
                <textarea
                  rows={5}
                  required
                  value={editingItem.body}
                  onChange={(e) => setEditingItem({ ...editingItem, body: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Cover Image URL</label>
                <input
                  type="text"
                  value={editingItem.coverImage || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, coverImage: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-300">Tags / Keywords</label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-950 border border-slate-800">
                  {(editingItem.tags || []).map((t, idx) => (
                    <span key={idx} className="px-2 py-1 rounded bg-slate-800 text-cyan-300 font-mono text-[10px] flex items-center gap-1">
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => setEditingItem({
                          ...editingItem,
                          tags: editingItem.tags.filter((_, i) => i !== idx)
                        })}
                        className="text-rose-400 font-bold"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newTagText}
                    onChange={(e) => setNewTagText(e.target.value)}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newTagText.trim()) return;
                      setEditingItem({
                        ...editingItem,
                        tags: [...(editingItem.tags || []), newTagText.trim()]
                      });
                      setNewTagText('');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                  >
                    Add Tag
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Committing...' : 'Save & Sync DuckDB'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Case Study"
        message={`Are you sure you want to delete case study "${itemToDelete?.title}"?`}
        confirmText="Delete Case Study"
        isDanger={true}
        onConfirm={confirmDelete}
        onClose={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}
      />
    </div>
  );
};
