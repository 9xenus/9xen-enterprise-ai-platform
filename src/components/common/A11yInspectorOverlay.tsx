import React, { useState, useEffect } from 'react';
import { scanDomForAccessibility, A11yAuditResult, A11yIssue } from '../../utils/a11yInspector';
import {
  Eye,
  X,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Sparkles,
  Info,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const A11yInspectorOverlay: React.FC<Props> = ({ isOpen, onClose }) => {
  const [audit, setAudit] = useState<A11yAuditResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<A11yIssue | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning'>('all');

  const runAudit = () => {
    setScanning(true);
    setTimeout(() => {
      const res = scanDomForAccessibility();
      setAudit(res);
      setScanning(false);
    }, 150);
  };

  useEffect(() => {
    if (isOpen) {
      runAudit();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredIssues = (audit?.issues || []).filter((i) => {
    if (filterSeverity === 'all') return true;
    return i.severity === filterSeverity;
  });

  return (
    <div
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl p-5 flex flex-col font-sans text-slate-300 animate-in slide-in-from-right duration-200"
      data-a11y-inspector-ignore="true"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>WCAG 2.1 AA Inspector</span>
              {audit && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                    audit.grade === 'AAA'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : audit.grade === 'AA'
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  Grade {audit.grade}
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">Live contrast & screen-reader checker</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={runAudit}
            disabled={scanning}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Re-scan DOM"
          >
            <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Close Inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Score Banner */}
      {audit && (
        <div className="my-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-2xl font-black text-white">{audit.overallScore}%</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Accessibility</div>
          </div>
          <div>
            <div className="text-2xl font-black text-rose-400">{audit.summary.critical}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Critical</div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400">{audit.summary.warning}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Warnings</div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-3">
        <button
          onClick={() => setFilterSeverity('all')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
            filterSeverity === 'all'
              ? 'bg-cyan-500 text-slate-950'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          All ({audit?.issues.length || 0})
        </button>
        <button
          onClick={() => setFilterSeverity('critical')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
            filterSeverity === 'critical'
              ? 'bg-rose-500 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Critical ({audit?.summary.critical || 0})
        </button>
        <button
          onClick={() => setFilterSeverity('warning')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
            filterSeverity === 'warning'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Warnings ({audit?.summary.warning || 0})
        </button>
      </div>

      {/* Issues scroll list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredIssues.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-xs font-bold text-white">No Issues Detected</p>
            <p className="text-[11px] text-slate-500">
              All scanned elements meet WCAG 2.1 AA accessibility contrast and label requirements!
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => setSelectedIssue(issue)}
              className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                selectedIssue?.id === issue.id
                  ? 'bg-slate-900 border-cyan-500'
                  : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span
                  className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                    issue.severity === 'critical'
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {issue.type}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{issue.wcagRule}</span>
              </div>
              <p className="font-bold text-white text-xs">{issue.message}</p>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{issue.suggestion}</p>
              <div className="mt-2 text-[10px] text-cyan-400 font-mono bg-slate-950 px-2 py-1 rounded truncate">
                {issue.elementSelector}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Selected Issue Detail Drawer */}
      {selectedIssue && (
        <div className="mt-3 p-3 rounded-2xl bg-slate-900 border border-slate-700 text-xs space-y-2">
          <div className="flex items-center justify-between font-bold text-white">
            <span>Issue Details</span>
            <button
              onClick={() => setSelectedIssue(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-300">{selectedIssue.suggestion}</p>
          {selectedIssue.details && (
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-950 p-2 rounded-xl text-slate-400">
              {selectedIssue.details.contrastRatio && (
                <div>Ratio: {selectedIssue.details.contrastRatio}:1</div>
              )}
              {selectedIssue.details.requiredRatio && (
                <div>Required: {selectedIssue.details.requiredRatio}:1</div>
              )}
              {selectedIssue.details.fgColor && <div>Text: {selectedIssue.details.fgColor}</div>}
              {selectedIssue.details.bgColor && <div>BG: {selectedIssue.details.bgColor}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
