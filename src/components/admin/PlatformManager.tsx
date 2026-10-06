import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { PlatformItem } from '../../types/cms';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Server,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Eye,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

interface Props {
  onPreviewPlatforms: () => void;
}

export const PlatformManager: React.FC<Props> = ({ onPreviewPlatforms }) => {
  const { cmsData, savePlatform, deletePlatform } = useCms();
  const platforms = (cmsData.platforms || []) as PlatformItem[];

  const [editingItem, setEditingItem] = useState<PlatformItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dbNotice, setDbNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [newFeatureText, setNewFeatureText] = useState('');
  const [newStatLabel, setNewStatLabel] = useState('');
  const [newStatValue, setNewStatValue] = useState('');

  const handleCreateNew = () => {
    const fresh: PlatformItem = {
      id: `platform-${Date.now()}`,
      name: 'New Cloud Enclave',
      slug: 'new-cloud-enclave',
      tagline: 'Zero-trust private cluster infrastructure',
      category: 'Enterprise OS',
      description: 'Fully isolated sovereign cloud enclosure with dedicated H100 GPU acceleration and real-time FIX 4.4 routing.',
      keyFeatures: [
        'Isolated private VPC with hardware security modules',
        'Automatic failover across multi-region edge nodes',
        'Real-time compliance telemetry auditing',
      ],
      stats: [
        { label: 'Latency', value: '45μs' },
        { label: 'Uptime', value: '99.999%' },
      ],
      badge: 'Sovereign Cloud',
      iconName: 'Server',
      order: platforms.length + 1,
    };
    setEditingItem(fresh);
    setIsNew(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    try {
      const ok = await savePlatform(editingItem, isNew ? undefined : editingItem.id);
      if (ok) {
        setDbNotice({
          type: 'success',
          message: `Platform "${editingItem.name}" committed to DuckDB "platforms" table successfully!`,
        });
        setEditingItem(null);
        setIsNew(false);
        setTimeout(() => setDbNotice(null), 4000);
      }
    } catch (err: any) {
      setDbNotice({ type: 'error', message: err.message || 'Failed saving platform.' });
      setTimeout(() => setDbNotice(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsSaving(true);
    try {
      const ok = await deletePlatform(itemToDelete.id);
      if (ok) {
        if (editingItem?.id === itemToDelete.id) setEditingItem(null);
        setDbNotice({ type: 'success', message: `Platform "${itemToDelete.name}" deleted successfully.` });
        setTimeout(() => setDbNotice(null), 4000);
      }
    } catch (err: any) {
      setDbNotice({ type: 'error', message: err.message || 'Failed deleting platform.' });
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
            <Server className="w-5 h-5 text-cyan-400" />
            <span>Platforms & Cloud Infrastructure Manager</span>
          </h2>
          <p className="text-slate-400 mt-1">
            Configure private VPCs, clusters, and sovereign cloud nodes ({platforms.length} active).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPreviewPlatforms}
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
            <span>New Platform</span>
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

      {/* Grid of Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map((item) => (
          <div key={item.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                  {item.category}
                </span>
                <span className="text-[10px] font-mono text-slate-500">{item.badge || 'Cloud Node'}</span>
              </div>
              <h3 className="text-base font-bold text-white">{item.name}</h3>
              <p className="text-slate-400 text-[11px] font-mono">{item.tagline}</p>
              <p className="text-slate-300 text-[11px] line-clamp-2">{item.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(item.stats || []).map((st, i) => (
                  <span key={i} className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {st.label}: <strong>{st.value}</strong>
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
                  onClick={() => { setItemToDelete({ id: item.id, name: item.name }); setIsDeleteModalOpen(true); }}
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
                <Server className="w-5 h-5 text-cyan-400" />
                <span>{isNew ? 'Create New Platform Enclave' : `Edit Platform: ${editingItem.name}`}</span>
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
                  <label className="font-bold text-slate-300">Platform Name</label>
                  <input
                    type="text"
                    required
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="Enterprise OS">Enterprise OS</option>
                    <option value="RegTech">RegTech</option>
                    <option value="Automation">Automation</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Badge Text</label>
                  <input
                    type="text"
                    value={editingItem.badge || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
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
                <label className="font-bold text-slate-300">Tagline</label>
                <input
                  type="text"
                  required
                  value={editingItem.tagline}
                  onChange={(e) => setEditingItem({ ...editingItem, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Full Description</label>
                <textarea
                  rows={3}
                  required
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                />
              </div>

              {/* Key Features */}
              <div className="space-y-2">
                <label className="font-bold text-slate-300">Key Features</label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {(editingItem.keyFeatures || []).map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                      <span>• {feat}</span>
                      <button
                        type="button"
                        onClick={() => setEditingItem({
                          ...editingItem,
                          keyFeatures: editingItem.keyFeatures.filter((_, i) => i !== idx)
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
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    placeholder="Add architectural feature..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newFeatureText.trim()) return;
                      setEditingItem({
                        ...editingItem,
                        keyFeatures: [...(editingItem.keyFeatures || []), newFeatureText.trim()]
                      });
                      setNewFeatureText('');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2">
                <label className="font-bold text-slate-300">Performance Metrics / Stats</label>
                <div className="grid grid-cols-2 gap-2">
                  {(editingItem.stats || []).map((st, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-300 font-mono text-[11px]">
                      <span>{st.label}: <strong>{st.value}</strong></span>
                      <button
                        type="button"
                        onClick={() => setEditingItem({
                          ...editingItem,
                          stats: editingItem.stats.filter((_, i) => i !== idx)
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
                    value={newStatLabel}
                    onChange={(e) => setNewStatLabel(e.target.value)}
                    placeholder="Stat Label (e.g. Latency)"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                  />
                  <input
                    type="text"
                    value={newStatValue}
                    onChange={(e) => setNewStatValue(e.target.value)}
                    placeholder="Stat Value (e.g. 45μs)"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newStatLabel.trim() || !newStatValue.trim()) return;
                      setEditingItem({
                        ...editingItem,
                        stats: [...(editingItem.stats || []), { label: newStatLabel.trim(), value: newStatValue.trim() }]
                      });
                      setNewStatLabel('');
                      setNewStatValue('');
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
        title="Delete Platform Enclave"
        message={`Are you sure you want to delete platform "${itemToDelete?.name}"?`}
        confirmText="Delete Platform"
        isDanger={true}
        onConfirm={confirmDelete}
        onClose={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}
      />
    </div>
  );
};
