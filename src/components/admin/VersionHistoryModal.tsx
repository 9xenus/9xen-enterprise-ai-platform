import React, { useState, useEffect } from 'react';
import {
  History,
  RotateCcw,
  Clock,
  User,
  ArrowRight,
  FileText,
  X,
  Plus,
  Check,
  AlertCircle,
  Sparkles,
  GitCompare,
  CheckCircle2,
} from 'lucide-react';
import { ContentVersion } from '../../types/cms';
import { useCms } from '../../context/CmsContext';
import { ConfirmModal } from '../common/ConfirmModal';

interface VersionHistoryModalProps {
  contentType: string;
  contentId: string;
  contentTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onRollbackSuccess?: (restoredItem: any) => void;
  currentData?: any;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  contentType,
  contentId,
  contentTitle,
  isOpen,
  onClose,
  onRollbackSuccess,
  currentData,
}) => {
  const { refreshCmsData } = useCms();
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<ContentVersion | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);
  const [creatingSnapshot, setCreatingSnapshot] = useState(false);
  const [changeNote, setChangeNote] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const getAdminAuthToken = () => {
    return localStorage.getItem('9xen_admin_token') || sessionStorage.getItem('9xen_admin_token') || 'demo_admin_jwt_token_2026';
  };

  const fetchVersions = async () => {
    if (!contentId || !contentType) return;
    setLoading(true);
    try {
      const token = getAdminAuthToken();
      const res = await fetch(`/api/content/versions/${encodeURIComponent(contentType)}/${encodeURIComponent(contentId)}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setVersions(data);
        if (data.length > 0 && !selectedVersion) {
          setSelectedVersion(data[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch version history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchVersions();
      setStatusMessage(null);
    } else {
      setSelectedVersion(null);
      setCompareMode(false);
    }
  }, [isOpen, contentType, contentId]);

  if (!isOpen) return null;

  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState(false);
  const [versionToRollback, setVersionToRollback] = useState<ContentVersion | null>(null);

  const handleRollback = async (version: ContentVersion) => {
    setVersionToRollback(version);
    setIsRollbackModalOpen(true);
  };

  const confirmRollback = async () => {
    if (!versionToRollback) return;
    const version = versionToRollback;
    setRollingBack(true);
    setStatusMessage(null);
    try {
      const token = getAdminAuthToken();
      const res = await fetch(`/api/content/versions/rollback/${version.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ createdByName: 'Editor Admin' }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setStatusMessage({
          type: 'success',
          text: `Successfully rolled back to Version #${version.version}!`,
        });
        await refreshCmsData();
        if (onRollbackSuccess && result.item) {
          onRollbackSuccess(result.item);
        }
        await fetchVersions();
      } else {
        setStatusMessage({
          type: 'error',
          text: result.error || 'Rollback failed.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Network error during rollback.',
      });
    } finally {
      setRollingBack(false);
      setVersionToRollback(null);
    }
  };

  const handleCreateManualSnapshot = async () => {
    if (!currentData) {
      setStatusMessage({ type: 'error', text: 'No active content data available to create a snapshot.' });
      return;
    }
    setCreatingSnapshot(true);
    try {
      const token = getAdminAuthToken();
      const res = await fetch('/api/content/versions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          contentType,
          contentId,
          title: contentTitle,
          data: currentData,
          changeSummary: changeNote.trim() || 'Manual revision snapshot',
          createdByName: 'Editor Admin',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: 'success', text: `Snapshot Version #${data.version.version} created!` });
        setChangeNote('');
        await fetchVersions();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to create snapshot.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error creating snapshot.' });
    } finally {
      setCreatingSnapshot(false);
    }
  };

  const formatFieldVal = (val: any) => {
    if (val === undefined || val === null) return <span className="text-zinc-500 italic">None</span>;
    if (typeof val === 'object') return <pre className="text-xs font-mono text-zinc-300 bg-zinc-950/60 p-2 rounded overflow-x-auto max-h-40">{JSON.stringify(val, null, 2)}</pre>;
    return String(val);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <ConfirmModal
        isOpen={isRollbackModalOpen}
        onClose={() => setIsRollbackModalOpen(false)}
        onConfirm={confirmRollback}
        title="Confirm Rollback"
        message={`Are you sure you want to roll back "${contentTitle}" to Version #${versionToRollback?.version}? This will overwrite the active content and record a new version history entry.`}
      />
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Version History & Rollback
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-mono font-normal border border-cyan-800/50">
                  {contentType} • {contentId}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Viewing revision log for <span className="text-zinc-200 font-medium">"{contentTitle}"</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message Banner */}
        {statusMessage && (
          <div
            className={`px-6 py-3 border-b flex items-center justify-between text-sm ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-xs opacity-70 hover:opacity-100">
              Dismiss
            </button>
          </div>
        )}

        {/* Modal Body Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-[480px]">
          {/* Left Column: Version History Timeline */}
          <div className="md:col-span-4 border-r border-zinc-800 bg-zinc-950/30 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-zinc-800/80 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Revisions ({versions.length})</span>
                <button
                  onClick={() => setCompareMode(!compareMode)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-all ${
                    compareMode
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  {compareMode ? 'Diff View' : 'Compare'}
                </button>
              </div>

              {/* Manual Snapshot Form */}
              <div className="mt-2 pt-2 border-t border-zinc-800/60 flex gap-2">
                <input
                  type="text"
                  placeholder="Snapshot change note..."
                  value={changeNote}
                  onChange={(e) => setChangeNote(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleCreateManualSnapshot}
                  disabled={creatingSnapshot}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                  title="Take a snapshot of current live state"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Save
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loading ? (
                <div className="p-8 text-center text-zinc-500 text-sm">Loading version history...</div>
              ) : versions.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-xs">
                  No previous version snapshots recorded yet. Saving edits automatically creates revision history!
                </div>
              ) : (
                versions.map((v, index) => {
                  const isSelected = selectedVersion?.id === v.id;
                  const isLatest = index === 0;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVersion(v)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500/50 text-white shadow-lg'
                          : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold font-mono flex items-center gap-1.5 text-cyan-400">
                          Version #{v.version}
                          {isLatest && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-sans">
                              Active
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(v.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 font-medium truncate mb-1">{v.title || contentTitle}</p>
                      {v.changeSummary && (
                        <p className="text-[11px] text-zinc-400 italic line-clamp-1">"{v.changeSummary}"</p>
                      )}
                      <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-800/40 pt-1.5">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {v.createdByName || 'Editor'}
                        </span>
                        <span className="text-cyan-400/80 hover:underline">Select &rarr;</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Version Inspector & Diff */}
          <div className="md:col-span-8 p-6 overflow-y-auto flex flex-col bg-zinc-900/50">
            {selectedVersion ? (
              <div className="flex-1 flex flex-col space-y-5">
                {/* Header Action Bar */}
                <div className="flex items-center justify-between bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white font-mono">
                        Version #{selectedVersion.version} Snapshot
                      </h3>
                      <span className="text-xs text-zinc-400 font-normal">
                        ({new Date(selectedVersion.createdAt).toLocaleString()})
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Created by <span className="text-zinc-200">{selectedVersion.createdByName || 'Editor Admin'}</span> • Note: <span className="italic text-zinc-300">"{selectedVersion.changeSummary || 'None'}"</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleRollback(selectedVersion)}
                    disabled={rollingBack}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {rollingBack ? 'Restoring...' : `Rollback to v#${selectedVersion.version}`}
                  </button>
                </div>

                {/* Diff View vs Inspection View */}
                {compareMode && currentData ? (
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      <GitCompare className="w-4 h-4" /> Side-by-Side Comparison (Active vs Version #{selectedVersion.version})
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Active Version */}
                      <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4">
                        <div className="text-xs font-bold text-emerald-400 border-b border-zinc-800 pb-2 mb-3">
                          Current Active Content
                        </div>
                        <div className="space-y-3 text-xs">
                          {Object.keys(currentData).map((key) => (
                            <div key={`cur-${key}`}>
                              <span className="font-mono text-zinc-400 block text-[11px] mb-0.5">{key}:</span>
                              <div className="bg-zinc-900 p-2 rounded text-zinc-200 font-sans border border-zinc-800/60">
                                {formatFieldVal(currentData[key])}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Selected Version */}
                      <div className="bg-zinc-950/70 border border-cyan-900/40 rounded-xl p-4">
                        <div className="text-xs font-bold text-cyan-400 border-b border-zinc-800 pb-2 mb-3">
                          Version #{selectedVersion.version} Historical Data
                        </div>
                        <div className="space-y-3 text-xs">
                          {selectedVersion.data && typeof selectedVersion.data === 'object' ? (
                            Object.keys(selectedVersion.data).map((key) => {
                              const curVal = currentData ? currentData[key] : undefined;
                              const verVal = selectedVersion.data[key];
                              const isDifferent = JSON.stringify(curVal) !== JSON.stringify(verVal);
                              return (
                                <div key={`ver-${key}`}>
                                  <span className="font-mono text-zinc-400 flex items-center justify-between text-[11px] mb-0.5">
                                    <span>{key}:</span>
                                    {isDifferent && (
                                      <span className="text-[10px] text-amber-400 bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-800/40">
                                        Changed
                                      </span>
                                    )}
                                  </span>
                                  <div
                                    className={`p-2 rounded font-sans text-zinc-200 border ${
                                      isDifferent ? 'bg-amber-950/20 border-amber-500/40' : 'bg-zinc-900 border-zinc-800/60'
                                    }`}
                                  >
                                    {formatFieldVal(verVal)}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <pre className="text-xs font-mono text-zinc-300">{JSON.stringify(selectedVersion.data, null, 2)}</pre>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 flex-1">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" /> Snapshot Payload Inspection
                    </h4>
                    <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 overflow-y-auto max-h-[360px]">
                      {selectedVersion.data && typeof selectedVersion.data === 'object' ? (
                        <div className="space-y-4 text-xs">
                          {Object.entries(selectedVersion.data).map(([key, value]) => (
                            <div key={key} className="border-b border-zinc-800/60 pb-3 last:border-0 last:pb-0">
                              <span className="font-mono font-bold text-cyan-400 text-xs block mb-1">{key}</span>
                              <div className="text-zinc-300 font-sans leading-relaxed">{formatFieldVal(value)}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap">{JSON.stringify(selectedVersion.data, null, 2)}</pre>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-500">
                <History className="w-12 h-12 stroke-[1.5] mb-3 text-zinc-600" />
                <p className="text-sm font-medium text-zinc-400">Select a version from the timeline on the left to inspect or roll back.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/50 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>DuckDB Version Kernel active — revision snapshots are immutable & rollbackable.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
