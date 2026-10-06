import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { CareerListing } from '../../types/cms';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Eye,
  CheckCircle2,
  MapPin,
  Clock,
} from 'lucide-react';

interface Props {
  onPreviewCareers: () => void;
}

export const CareersManager: React.FC<Props> = ({ onPreviewCareers }) => {
  const { cmsData, saveCareer, deleteCareer } = useCms();
  const careers = (cmsData.careers || []) as CareerListing[];

  const [editingItem, setEditingItem] = useState<CareerListing | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dbNotice, setDbNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [newReqText, setNewReqText] = useState('');

  const handleCreateNew = () => {
    const fresh: CareerListing = {
      id: `career-${Date.now()}`,
      title: 'Principal Systems Quant Engineer',
      department: 'Low-Latency Core Engineering',
      location: 'Remote / New York / London',
      type: 'Full-time',
      description: 'Lead development of our kernel-bypass FIX protocol execution engine and distributed H100 GPU inference cluster.',
      requirements: [
        '5+ years C++20 / Rust systems programming in high-frequency trading',
        'Deep understanding of Linux kernel networking, DPDK, and solarflare EF_VI',
        'Demonstrated track record of sub-millisecond execution optimization',
      ],
      applyLink: 'mailto:careers@9xen.ai',
      active: true,
    };
    setEditingItem(fresh);
    setIsNew(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    try {
      const ok = await saveCareer(editingItem, isNew ? undefined : editingItem.id);
      if (ok) {
        setDbNotice({
          type: 'success',
          message: `Career role "${editingItem.title}" committed to DuckDB "careers" table successfully!`,
        });
        setEditingItem(null);
        setIsNew(false);
        setTimeout(() => setDbNotice(null), 4000);
      }
    } catch (err: any) {
      setDbNotice({ type: 'error', message: err.message || 'Failed saving career listing.' });
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
      const ok = await deleteCareer(itemToDelete.id);
      if (ok) {
        if (editingItem?.id === itemToDelete.id) setEditingItem(null);
        setDbNotice({ type: 'success', message: `Career role "${itemToDelete.title}" deleted successfully.` });
        setTimeout(() => setDbNotice(null), 4000);
      }
    } catch (err: any) {
      setDbNotice({ type: 'error', message: err.message || 'Failed deleting career role.' });
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
            <Briefcase className="w-5 h-5 text-cyan-400" />
            <span>Careers & Roles Manager</span>
          </h2>
          <p className="text-slate-400 mt-1">
            Publish high-impact institutional engineering and quantitative roles ({careers.length} active).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPreviewCareers}
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
            <span>New Role</span>
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

      {/* Grid of Careers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {careers.map((item) => (
          <div key={item.id} className={`p-5 rounded-2xl bg-slate-900 border ${item.active ? 'border-slate-800' : 'border-slate-800/50 opacity-60'} hover:border-slate-700 transition-all flex flex-col justify-between space-y-4`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                  {item.department}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${item.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  {item.active ? 'Active Listing' : 'Closed'}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{item.title}</h3>
              <div className="flex items-center gap-4 text-slate-400 text-[11px] font-mono">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-cyan-400" /> {item.location}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-purple-400" /> {item.type}</span>
              </div>
              <p className="text-slate-300 text-[11px] line-clamp-2">{item.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">{item.requirements?.length || 0} Requirements</span>
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
                <Briefcase className="w-5 h-5 text-cyan-400" />
                <span>{isNew ? 'Create New Career Listing' : `Edit Role: ${editingItem.title}`}</span>
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
                <label className="font-bold text-slate-300">Job Title</label>
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
                  <label className="font-bold text-slate-300">Department</label>
                  <input
                    type="text"
                    required
                    value={editingItem.department}
                    onChange={(e) => setEditingItem({ ...editingItem, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Location</label>
                  <input
                    type="text"
                    required
                    value={editingItem.location}
                    onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Employment Type</label>
                  <select
                    value={editingItem.type}
                    onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Application Link / Email</label>
                  <input
                    type="text"
                    required
                    value={editingItem.applyLink}
                    onChange={(e) => setEditingItem({ ...editingItem, applyLink: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <input
                  type="checkbox"
                  id="career-active-check"
                  checked={editingItem.active}
                  onChange={(e) => setEditingItem({ ...editingItem, active: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="career-active-check" className="font-bold text-white cursor-pointer">
                  Active Listing (Accepting Applications)
                </label>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Role Description</label>
                <textarea
                  rows={3}
                  required
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 text-[11px]"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-300">Requirements & Qualifications</label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {(editingItem.requirements || []).map((req, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-[11px]">
                      <span>• {req}</span>
                      <button
                        type="button"
                        onClick={() => setEditingItem({
                          ...editingItem,
                          requirements: editingItem.requirements.filter((_, i) => i !== idx)
                        })}
                        className="text-rose-400 font-bold px-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newReqText}
                    onChange={(e) => setNewReqText(e.target.value)}
                    placeholder="Add requirement..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newReqText.trim()) return;
                      setEditingItem({
                        ...editingItem,
                        requirements: [...(editingItem.requirements || []), newReqText.trim()]
                      });
                      setNewReqText('');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                  >
                    Add
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
        title="Delete Career Listing"
        message={`Are you sure you want to delete role "${itemToDelete?.title}"?`}
        confirmText="Delete Role"
        isDanger={true}
        onConfirm={confirmDelete}
        onClose={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}
      />
    </div>
  );
};
