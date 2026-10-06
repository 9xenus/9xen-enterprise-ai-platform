import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { ServiceItem } from '../../types/cms';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Layers,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Eye,
  CheckCircle2,
  Activity,
  Zap,
} from 'lucide-react';

interface Props {
  onPreviewServices: () => void;
}

export const ServicesManager: React.FC<Props> = ({ onPreviewServices }) => {
  const { cmsData, saveService, deleteService } = useCms();
  const services = (cmsData.services || []) as ServiceItem[];

  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dbNotice, setDbNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [newFeatureText, setNewFeatureText] = useState('');

  const handleCreateNew = () => {
    const fresh: ServiceItem = {
      id: `service-${Date.now()}`,
      title: 'New Enterprise Service',
      category: 'Autonomous Architecture',
      shortDescription: 'High-performance neural integration and low-latency gateway.',
      fullDescription: 'Comprehensive institutional-grade service offering with zero-data-leakage guarantee and dedicated VPC deployment.',
      iconName: 'Zap',
      pricingLabel: 'Custom Enterprise SLA',
      features: [
        'Real-time FIX 4.4 / ITCH protocol bridge',
        'Sub-millisecond inference routing',
        'Dedicated secure VPC enclosure',
      ],
      techStack: ['Python', 'C++', 'PyTorch', 'AWS H100'],
      order: services.length + 1,
      highlighted: true,
    };
    setEditingItem(fresh);
    setIsNew(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    try {
      const ok = await saveService(editingItem, isNew ? undefined : editingItem.id);
      if (ok) {
        setDbNotice({
          type: 'success',
          message: `Service "${editingItem.title}" committed to DuckDB "services" table successfully!`,
        });
        setEditingItem(null);
        setIsNew(false);
        setTimeout(() => setDbNotice(null), 4000);
      }
    } catch (err: any) {
      setDbNotice({ type: 'error', message: err.message || 'Failed saving service.' });
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
      const ok = await deleteService(itemToDelete.id);
      if (ok) {
        if (editingItem?.id === itemToDelete.id) setEditingItem(null);
        setDbNotice({ type: 'success', message: `Service "${itemToDelete.title}" deleted successfully.` });
        setTimeout(() => setDbNotice(null), 4000);
      }
    } catch (err: any) {
      setDbNotice({ type: 'error', message: err.message || 'Failed deleting service.' });
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
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Services & Solutions Manager</span>
          </h2>
          <p className="text-slate-400 mt-1">
            Configure institutional services, pricing tiers, and architectural specs ({services.length} active).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPreviewServices}
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
            <span>New Service</span>
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

      {/* Grid of Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((item) => (
          <div key={item.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                  {item.category}
                </span>
                <span className="text-[10px] font-mono text-slate-500">Order: {item.order}</span>
              </div>
              <h3 className="text-base font-bold text-white">{item.title}</h3>
              <p className="text-slate-400 text-[11px] line-clamp-2">{item.shortDescription}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-cyan-300 font-mono font-bold text-[11px]">{item.pricingLabel || 'Custom SLA'}</span>
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
                <Layers className="w-5 h-5 text-cyan-400" />
                <span>{isNew ? 'Create New Service' : `Edit Service: ${editingItem.title}`}</span>
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Service Title</label>
                  <input
                    type="text"
                    required
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Category</label>
                  <input
                    type="text"
                    required
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Pricing / SLA Label</label>
                  <input
                    type="text"
                    value={editingItem.pricingLabel || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, pricingLabel: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Display Order</label>
                  <input
                    type="number"
                    value={editingItem.order}
                    onChange={(e) => setEditingItem({ ...editingItem, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Short Summary</label>
                <input
                  type="text"
                  required
                  value={editingItem.shortDescription}
                  onChange={(e) => setEditingItem({ ...editingItem, shortDescription: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Full Architectural Description</label>
                <textarea
                  rows={4}
                  required
                  value={editingItem.fullDescription}
                  onChange={(e) => setEditingItem({ ...editingItem, fullDescription: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-300">Key Capabilities / Features</label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {(editingItem.features || []).map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                      <span>• {feat}</span>
                      <button
                        type="button"
                        onClick={() => setEditingItem({
                          ...editingItem,
                          features: editingItem.features.filter((_, i) => i !== idx)
                        })}
                        className="text-rose-400 hover:text-rose-300 font-bold px-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    placeholder="Add new capability feature..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newFeatureText.trim()) return;
                      setEditingItem({
                        ...editingItem,
                        features: [...(editingItem.features || []), newFeatureText.trim()]
                      });
                      setNewFeatureText('');
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
        title="Delete Service"
        message={`Are you sure you want to delete service "${itemToDelete?.title}"? This action is irreversible.`}
        confirmText="Delete Service"
        isDanger={true}
        onConfirm={confirmDelete}
        onClose={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}
      />
    </div>
  );
};
