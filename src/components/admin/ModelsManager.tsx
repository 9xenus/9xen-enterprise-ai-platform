import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { AiModelItem } from '../../types/cms';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Cpu,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Eye,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';

interface Props {
  onPreviewModels?: () => void;
}

export const ModelsManager: React.FC<Props> = ({ onPreviewModels }) => {
  const { cmsData, saveModel, deleteModel } = useCms();
  const models = (cmsData.models || []) as AiModelItem[];

  const [editingItem, setEditingItem] = useState<AiModelItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dbNotice, setDbNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [newFeatureText, setNewFeatureText] = useState('');
  const [newBenchLabel, setNewBenchLabel] = useState('');
  const [newBenchScore, setNewBenchScore] = useState('');

  const handleCreateNew = () => {
    const fresh: AiModelItem = {
      id: `model-${Date.now()}`,
      name: '9xen Neural Model X',
      badge: 'Frontier',
      tagline: 'Next-generation reasoning & multimodal agentic architecture.',
      description: 'Advanced foundation model tuned for enterprise safety, multi-step agent execution, and lightning-fast inference.',
      contextWindow: '1M',
      maxOutput: '16K',
      speed: '~150 t/s',
      inputPrice: '$2.00',
      outputPrice: '$8.00',
      benchmarks: [
        { label: 'MMLU Pro', score: '91.2%' },
        { label: 'HumanEval', score: '94.5%' },
      ],
      features: [
        'Native high-resolution vision & video understanding',
        'Drop-in OpenAI SDK compatibility',
        'Deterministic structured JSON schemas',
      ],
      bestFor: 'High-consequence agent workflows, complex enterprise reasoning, and multimodal document analysis.',
      order: models.length + 1,
    };
    setEditingItem(fresh);
    setIsNew(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    try {
      const ok = await saveModel(editingItem, isNew ? undefined : editingItem.id);
      if (ok) {
        setDbNotice({
          type: 'success',
          message: `Model "${editingItem.name}" committed to DuckDB "models" table successfully!`,
        });
        setEditingItem(null);
        setIsNew(false);
        setTimeout(() => setDbNotice(null), 4000);
      }
    } catch (err: any) {
      setDbNotice({ type: 'error', message: err.message || 'Failed saving model.' });
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
      const ok = await deleteModel(itemToDelete.id);
      if (ok) {
        if (editingItem?.id === itemToDelete.id) setEditingItem(null);
        setDbNotice({ type: 'success', message: `Model "${itemToDelete.name}" deleted successfully.` });
        setTimeout(() => setDbNotice(null), 4000);
      }
    } catch (err: any) {
      setDbNotice({ type: 'error', message: err.message || 'Failed deleting model.' });
      setTimeout(() => setDbNotice(null), 5000);
    } finally {
      setIsSaving(false);
      setItemToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-violet-600 text-white shadow-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Foundation Models CMS Manager</h2>
              <p className="text-sm text-slate-500">Manage 9xen enterprise AI models, pricing, context windows, and benchmarks in DuckDB.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onPreviewModels && (
            <button
              onClick={onPreviewModels}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm transition-all"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              Preview /models page
            </button>
          )}
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-700 font-medium text-sm shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New AI Model
          </button>
        </div>
      </div>

      {dbNotice && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
            dbNotice.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{dbNotice.message}</span>
        </div>
      )}

      {/* Grid of Models */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {models.map((model) => (
          <div key={model.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100 mb-2">
                    {model.badge || 'Frontier'}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{model.name}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingItem({ ...model });
                      setIsNew(false);
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Edit Model"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setItemToDelete({ id: model.id, name: model.name });
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Model"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-700 mb-2">{model.tagline}</p>
              <p className="text-xs text-slate-500 line-clamp-2 mb-4">{model.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block">Context Window</span>
                  <strong className="text-slate-900 font-semibold">{model.contextWindow}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Max Output</span>
                  <strong className="text-slate-900 font-semibold">{model.maxOutput}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Inference Speed</span>
                  <strong className="text-slate-900 font-semibold">{model.speed}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Pricing (In/Out)</span>
                  <strong className="text-slate-900 font-semibold">{model.inputPrice} / {model.outputPrice}</strong>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Order rank: #{model.order || 1}</span>
              <span className="text-violet-600 font-medium">DuckDB Synchronized</span>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-slate-950">
                {isNew ? 'Create New AI Model' : `Edit Model: ${editingItem.name}`}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Model Name</label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Badge / Category</label>
                  <input
                    type="text"
                    value={editingItem.badge}
                    onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Tagline</label>
                <input
                  type="text"
                  value={editingItem.tagline}
                  onChange={(e) => setEditingItem({ ...editingItem, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Context Window</label>
                  <input
                    type="text"
                    value={editingItem.contextWindow}
                    onChange={(e) => setEditingItem({ ...editingItem, contextWindow: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Max Output</label>
                  <input
                    type="text"
                    value={editingItem.maxOutput}
                    onChange={(e) => setEditingItem({ ...editingItem, maxOutput: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Speed</label>
                  <input
                    type="text"
                    value={editingItem.speed}
                    onChange={(e) => setEditingItem({ ...editingItem, speed: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Order Rank</label>
                  <input
                    type="number"
                    value={editingItem.order || 1}
                    onChange={(e) => setEditingItem({ ...editingItem, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Input Price (per M tokens)</label>
                  <input
                    type="text"
                    value={editingItem.inputPrice}
                    onChange={(e) => setEditingItem({ ...editingItem, inputPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Output Price (per M tokens)</label>
                  <input
                    type="text"
                    value={editingItem.outputPrice}
                    onChange={(e) => setEditingItem({ ...editingItem, outputPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Best For / Use Case</label>
                <input
                  type="text"
                  value={editingItem.bestFor}
                  onChange={(e) => setEditingItem({ ...editingItem, bestFor: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              {/* Features Editor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Key Features</label>
                <div className="space-y-2 mb-2">
                  {(editingItem.features || []).map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs">
                      <span>{feat}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...editingItem.features];
                          updated.splice(idx, 1);
                          setEditingItem({ ...editingItem, features: updated });
                        }}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    placeholder="Add feature..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newFeatureText.trim()) return;
                      setEditingItem({
                        ...editingItem,
                        features: [...(editingItem.features || []), newFeatureText.trim()],
                      });
                      setNewFeatureText('');
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-700 text-sm font-medium shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving to DuckDB...' : 'Save Model'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete AI Model"
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This will update the DuckDB database and cmsData.json.`}
        confirmText="Delete Model"
        onConfirm={confirmDelete}
        onClose={() => setIsDeleteModalOpen(false)}
        isDestructive={true}
      />
    </div>
  );
};
