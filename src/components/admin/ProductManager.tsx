import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { ProductItem } from '../../types/cms';
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
  Award,
  Bot,
  FileText,
  Activity,
  ChevronRight,
  Database,
  Loader2,
} from 'lucide-react';

interface Props {
  onPreviewProducts: () => void;
}

export const ProductManager: React.FC<Props> = ({ onPreviewProducts }) => {
  const { cmsData, saveProduct, deleteProduct, syncDuckDb } = useCms();
  const products = (cmsData.products || []) as ProductItem[];

  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dbNotice, setDbNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New feature & spec input state
  const [newFeatureText, setNewFeatureText] = useState('');
  const [newSpecLabel, setNewSpecLabel] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  const handleCreateNew = () => {
    const freshProduct: ProductItem = {
      id: `prod-${Date.now()}`,
      title: 'New AI Product',
      slug: 'new-ai-product',
      category: 'Autonomous Agents',
      tagline: 'High-throughput enterprise cognitive engine',
      shortDescription: 'Autonomous neural sub-system designed for mission-critical operations.',
      fullDescription: 'Customizable cognitive runtime with zero-trust network boundaries and multi-agent coordination.',
      iconName: 'Bot',
      pricingModel: 'Enterprise Cluster License',
      features: [
        'Zero-trust cryptographic isolation',
        'Stateful multi-agent coordination',
        'Built-in human review gates',
      ],
      specs: [
        { label: 'Latency', value: '< 200ms' },
        { label: 'Concurrency', value: '5,000 Active Nodes' },
        { label: 'Security', value: 'SOC-2 Type II' },
      ],
      badge: 'New Release',
      order: products.length + 1,
      highlighted: true,
    };
    setEditingProduct(freshProduct);
    setIsNew(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsSaving(true);
    try {
      const ok = await saveProduct(editingProduct, isNew ? undefined : editingProduct.id);
      if (ok) {
        setDbNotice({
          type: 'success',
          message: `Product "${editingProduct.title}" committed directly to DuckDB "products" table!`,
        });
        setEditingProduct(null);
        setIsNew(false);
        setTimeout(() => setDbNotice(null), 4000);
      } else {
        throw new Error('Database write did not return ok.');
      }
    } catch (err: any) {
      setDbNotice({
        type: 'error',
        message: err.message || 'Failed saving product to DuckDB.',
      });
      setTimeout(() => setDbNotice(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; title: string } | null>(null);

  const handleDeleteProduct = async (id: string, title: string) => {
    setProductToDelete({ id, title });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    const { id, title } = productToDelete;
    setIsSaving(true);
    try {
      const ok = await deleteProduct(id);
      if (ok) {
        if (editingProduct?.id === id) {
          setEditingProduct(null);
        }
        setDbNotice({
          type: 'success',
          message: `Product "${title}" deleted from DuckDB database successfully.`,
        });
        setTimeout(() => setDbNotice(null), 4000);
      }
    } catch (err: any) {
      setDbNotice({
        type: 'error',
        message: err.message || 'Failed deleting product from DuckDB.',
      });
      setTimeout(() => setDbNotice(null), 5000);
    } finally {
      setIsSaving(false);
      setProductToDelete(null);
    }
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim() || !editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      features: [...(editingProduct.features || []), newFeatureText.trim()],
    });
    setNewFeatureText('');
  };

  const handleRemoveFeature = (idx: number) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      features: editingProduct.features.filter((_, i) => i !== idx),
    });
  };

  const handleAddSpec = () => {
    if (!newSpecLabel.trim() || !newSpecValue.trim() || !editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      specs: [...(editingProduct.specs || []), { label: newSpecLabel.trim(), value: newSpecValue.trim() }],
    });
    setNewSpecLabel('');
    setNewSpecValue('');
  };

  const handleRemoveSpec = (idx: number) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      specs: editingProduct.specs.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">Enterprise Product Suite Manager</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold flex items-center gap-1">
              <Database className="w-3 h-3" />
              DuckDB: products table ({products.length} records)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure product catalog cards, technical benchmarks, licensing models, and SDK code examples. Persisted directly to DuckDB OLAP database.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onPreviewProducts}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview Viewport</span>
          </button>

          <button
            onClick={handleCreateNew}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Database Commit Notification */}
      {dbNotice && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold ${
            dbNotice.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          {dbNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Activity className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{dbNotice.message}</span>
        </div>
      )}

      {/* Editor Modal / Drawer when editing */}
      {editingProduct && (
        <form
          onSubmit={handleSaveProduct}
          className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/40 shadow-2xl space-y-6 relative"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h4 className="font-bold text-white text-sm">
                {isNew ? 'Create New Enterprise Product' : `Edit: ${editingProduct.title}`}
              </h4>
              <p className="text-[11px] text-slate-400">
                All changes sync automatically to the client Products page and DuckDB in-memory cluster.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditingProduct(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Product Title</label>
              <input
                type="text"
                required
                value={editingProduct.title}
                onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">URL Slug / Identifier</label>
              <input
                type="text"
                required
                value={editingProduct.slug}
                onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Category</label>
              <select
                value={editingProduct.category}
                onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              >
                <option value="Autonomous Agents">Autonomous Agents</option>
                <option value="RegTech Engine">RegTech Engine</option>
                <option value="AI Security">AI Security</option>
                <option value="Neural Developer Tools">Neural Developer Tools</option>
                <option value="Enterprise OS">Enterprise OS</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Badge Ribbon (e.g. Flagship Core)</label>
              <input
                type="text"
                value={editingProduct.badge || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                placeholder="Flagship Core, RegTech Leader..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-300"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-slate-300">Tagline</label>
              <input
                type="text"
                value={editingProduct.tagline}
                onChange={(e) => setEditingProduct({ ...editingProduct, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-medium"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-slate-300">Short Overview</label>
              <textarea
                rows={2}
                value={editingProduct.shortDescription}
                onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-slate-300">Full Architectural Description</label>
              <textarea
                rows={3}
                value={editingProduct.fullDescription}
                onChange={(e) => setEditingProduct({ ...editingProduct, fullDescription: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Pricing Model Label</label>
              <input
                type="text"
                value={editingProduct.pricingModel || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, pricingModel: e.target.value })}
                placeholder="Enterprise Cluster License, Annual SaaS..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Image Asset URL</label>
              <input
                type="text"
                value={editingProduct.imageUrl || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Features Editor */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <label className="font-bold text-slate-300 text-xs flex items-center justify-between">
              <span>Core Capabilities & Features ({editingProduct.features?.length || 0})</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                placeholder="Add capability feature..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold cursor-pointer"
              >
                Add Feature
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto">
              {(editingProduct.features || []).map((feat, idx) => (
                <div
                  key={`feat-${idx}`}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300"
                >
                  <span className="truncate pr-2">{feat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Specs Editor */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <label className="font-bold text-slate-300 text-xs">
              Architectural Specifications ({editingProduct.specs?.length || 0})
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSpecLabel}
                onChange={(e) => setNewSpecLabel(e.target.value)}
                placeholder="Spec label (e.g. Latency)"
                className="w-1/3 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
              <input
                type="text"
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                placeholder="Spec value (e.g. < 250ms)"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
              <button
                type="button"
                onClick={handleAddSpec}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold cursor-pointer"
              >
                Add Spec
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(editingProduct.specs || []).map((sp, idx) => (
                <div
                  key={`spec-${idx}`}
                  className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono flex items-center gap-2 text-slate-300"
                >
                  <span className="text-slate-500">{sp.label}:</span>
                  <span className="text-cyan-300 font-bold">{sp.value}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    className="text-slate-500 hover:text-rose-400 cursor-pointer ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setEditingProduct(null)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Committing to DuckDB...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isNew ? 'Create Product & Save to DuckDB' : 'Save Changes to DuckDB'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Products Table List */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-6 py-3.5">Product Title</th>
              <th className="px-6 py-3.5">Category</th>
              <th className="px-6 py-3.5">Badge</th>
              <th className="px-6 py-3.5">Capabilities</th>
              <th className="px-6 py-3.5">Pricing Model</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {products.map((prod) => (
              <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-white text-sm">{prod.title}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{prod.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-md bg-violet-500/10 text-violet-300 border border-violet-500/20 text-[10px] font-mono">
                    {prod.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {prod.badge ? (
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {prod.badge}
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-cyan-400 font-mono">{prod.features?.length || 0} features</span>
                  <span className="text-slate-500 mx-1">•</span>
                  <span className="text-slate-400 font-mono">{prod.specs?.length || 0} specs</span>
                </td>
                <td className="px-6 py-4 text-slate-400">
                  {prod.pricingModel || 'Enterprise'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingProduct(prod);
                        setIsNew(false);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-white transition-colors cursor-pointer"
                      title="Edit Product"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id, prod.title)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
