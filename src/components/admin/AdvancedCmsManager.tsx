import React, { useState } from 'react';
import { Blocks, FileType, Workflow, Tags, Plus, Code, Layout } from 'lucide-react';

export const AdvancedCmsManager: React.FC = () => {
  const [tab, setTab] = useState<'blocks' | 'forms' | 'workflows' | 'taxonomies'>('blocks');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">Advanced CMS</h2>
        <p className="text-xs text-slate-400">Global blocks, form builder, workflows, taxonomies</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'blocks', label: 'Content Blocks', icon: Blocks },
          { id: 'forms', label: 'Form Builder', icon: FileType },
          { id: 'workflows', label: 'Workflows', icon: Workflow },
          { id: 'taxonomies', label: 'Taxonomies', icon: Tags },
        ].map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id as any)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs ${active ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}`}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'blocks' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700 flex justify-between">
            <div className="flex items-center gap-2"><Blocks className="w-4 h-4 text-cyan-400" /><span className="text-sm text-white font-medium">Reusable Blocks</span></div>
            <button className="px-3 py-1.5 bg-cyan-500 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1"><Plus className="w-3 h-3" /> Add Block</button>
          </div>
          <div className="p-8 text-center text-slate-400 text-sm">No blocks created yet.</div>
        </div>
      )}

      {tab === 'forms' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700 flex justify-between">
            <div className="flex items-center gap-2"><FileType className="w-4 h-4 text-cyan-400" /><span className="text-sm text-white font-medium">Dynamic Forms</span></div>
            <button className="px-3 py-1.5 bg-cyan-500 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1"><Plus className="w-3 h-3" /> New Form</button>
          </div>
          <div className="p-8 text-center text-slate-400 text-sm">Form builder ready - drag & drop fields</div>
        </div>
      )}

      {tab === 'workflows' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700 flex justify-between">
            <div className="flex items-center gap-2"><Workflow className="w-4 h-4 text-cyan-400" /><span className="text-sm text-white font-medium">Content Approval</span></div>
            <button className="px-3 py-1.5 bg-cyan-500 text-slate-950 rounded-lg text-xs font-bold">Configure</button>
          </div>
          <div className="p-8 text-center text-slate-400 text-sm">Approval workflows for content publishing</div>
        </div>
      )}

      {tab === 'taxonomies' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700 flex justify-between">
            <div className="flex items-center gap-2"><Tags className="w-4 h-4 text-cyan-400" /><span className="text-sm text-white font-medium">Categories & Tags</span></div>
            <button className="px-3 py-1.5 bg-cyan-500 text-slate-950 rounded-lg text-xs font-bold">Add Term</button>
          </div>
          <div className="p-8 text-center text-slate-400 text-sm">Manage hierarchical taxonomies</div>
        </div>
      )}
    </div>
  );
};
