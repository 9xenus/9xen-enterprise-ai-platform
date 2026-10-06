import React, { useState } from 'react';
import { Users, Plus, Edit, Building, Mail, Phone, DollarSign, TrendingUp, Settings2, Tag } from 'lucide-react';

export const EnterpriseCustomersManager: React.FC = () => {
  const [view, setView] = useState<'list' | 'fields'>('list');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Enterprise Customer Management</h2>
          <p className="text-xs text-slate-400">Advanced CRM with custom fields & dynamic data</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-lg text-xs ${view === 'list' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}`}>Customers</button>
          <button onClick={() => setView('fields')} className={`px-3 py-1.5 rounded-lg text-xs ${view === 'fields' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}`}>Custom Fields</button>
        </div>
      </div>

      {view === 'list' && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-white font-medium">Customer Directory</span>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-cyan-400">
              <Plus className="w-4 h-4" /> Add Customer
            </button>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-8 text-center text-slate-400 text-sm">No customers yet. Add your first enterprise customer.</div>
          </div>
        </div>
      )}

      {view === 'fields' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Custom Fields</h3>
            </div>
            <button className="px-3 py-1.5 bg-cyan-500 text-slate-950 rounded-lg text-xs font-bold">Add Field</button>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3">
                <Tag className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-sm text-white">Contract Start Date</div>
                  <div className="text-[10px] text-slate-500">date • customer</div>
                </div>
              </div>
              <span className="text-[10px] text-cyan-400">Custom</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3">
                <Tag className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-sm text-white">SLA Level</div>
                  <div className="text-[10px] text-slate-500">dropdown • customer</div>
                </div>
              </div>
              <span className="text-[10px] text-cyan-400">Custom</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
