import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { TeamMember } from '../../types/cms';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Users,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Eye,
  CheckCircle2,
  Globe,
  ExternalLink,
} from 'lucide-react';

interface Props {
  onPreviewTeam: () => void;
}

export const TeamManager: React.FC<Props> = ({ onPreviewTeam }) => {
  const { cmsData, saveTeamMember, deleteTeamMember } = useCms();
  const teamMembers = (cmsData.team || []) as TeamMember[];

  const [editingItem, setEditingItem] = useState<TeamMember | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dbNotice, setDbNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleCreateNew = () => {
    const fresh: TeamMember = {
      id: `team-${Date.now()}`,
      name: 'Dr. Alistair Vance',
      role: 'Principal Quant Architect',
      department: 'Autonomous Intelligence Core',
      bio: 'Former Lead Quant at Citadel Securities with 15+ years experience in sub-millisecond neural execution and cryptographic VPC enclaves.',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      socials: {
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
      },
      order: teamMembers.length + 1,
    };
    setEditingItem(fresh);
    setIsNew(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    try {
      const ok = await saveTeamMember(editingItem, isNew ? undefined : editingItem.id);
      if (ok) {
        setDbNotice({
          type: 'success',
          message: `Team member "${editingItem.name}" committed to DuckDB "team" table successfully!`,
        });
        setEditingItem(null);
        setIsNew(false);
        setTimeout(() => setDbNotice(null), 4000);
      }
    } catch (err: any) {
      setDbNotice({ type: 'error', message: err.message || 'Failed saving team member.' });
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
      const ok = await deleteTeamMember(itemToDelete.id);
      if (ok) {
        if (editingItem?.id === itemToDelete.id) setEditingItem(null);
        setDbNotice({ type: 'success', message: `Team member "${itemToDelete.name}" deleted successfully.` });
        setTimeout(() => setDbNotice(null), 4000);
      }
    } catch (err: any) {
      setDbNotice({ type: 'error', message: err.message || 'Failed deleting team member.' });
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
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Leadership & Expert Team Manager</span>
          </h2>
          <p className="text-slate-400 mt-1">
            Configure executive leadership and research engineers ({teamMembers.length} active).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPreviewTeam}
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
            <span>New Member</span>
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

      {/* Grid of Team Members */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {teamMembers.map((item) => (
          <div key={item.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={item.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt={item.name}
                className="w-12 h-12 rounded-full object-cover border border-cyan-500/30 shrink-0"
              />
              <div className="overflow-hidden">
                <h3 className="font-bold text-white truncate">{item.name}</h3>
                <p className="text-[11px] text-cyan-300 font-mono truncate">{item.role}</p>
                <span className="text-[10px] text-slate-500 font-mono">{item.department}</span>
              </div>
            </div>

            <p className="text-slate-400 text-[11px] line-clamp-3">{item.bio}</p>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                {item.socials?.linkedin && <Globe className="w-3.5 h-3.5 text-cyan-400" />}
                {item.socials?.github && <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />}
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
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>{isNew ? 'Add Team Member' : `Edit Member: ${editingItem.name}`}</span>
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
                  <label className="font-bold text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Role / Title</label>
                  <input
                    type="text"
                    required
                    value={editingItem.role}
                    onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
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
                <label className="font-bold text-slate-300">Photo URL</label>
                <input
                  type="text"
                  required
                  value={editingItem.photoUrl}
                  onChange={(e) => setEditingItem({ ...editingItem, photoUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Professional Bio</label>
                <textarea
                  rows={3}
                  required
                  value={editingItem.bio}
                  onChange={(e) => setEditingItem({ ...editingItem, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 text-[11px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">LinkedIn Profile URL</label>
                  <input
                    type="text"
                    value={editingItem.socials?.linkedin || ''}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      socials: { ...editingItem.socials, linkedin: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">GitHub Profile URL</label>
                  <input
                    type="text"
                    value={editingItem.socials?.github || ''}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      socials: { ...editingItem.socials, github: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                  />
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
        title="Remove Team Member"
        message={`Are you sure you want to remove team member "${itemToDelete?.name}"?`}
        confirmText="Remove Member"
        isDanger={true}
        onConfirm={confirmDelete}
        onClose={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}
      />
    </div>
  );
};
