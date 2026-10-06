import React, { useState, useEffect } from 'react';
import { Bot, Brain, CreditCard, HeadphonesIcon, Zap, Activity, Settings } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  model: string;
  enabled: boolean;
  temperature: number;
}

export const AutonomousAgentsManager: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    fetch('/api/chat/autonomous/agents')
      .then(r => r.json())
      .then(d => setAgents(d || []))
      .catch(() => setAgents([]));
  }, []);

  const iconForRole = (role: string) => {
    switch (role) {
      case 'sales': return <Zap className="w-5 h-5 text-emerald-400" />;
      case 'support': return <HeadphonesIcon className="w-5 h-5 text-cyan-400" />;
      case 'billing': return <CreditCard className="w-5 h-5 text-amber-400" />;
      case 'orchestrator': return <Brain className="w-5 h-5 text-violet-400" />;
      default: return <Bot className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">Autonomous AI Agents</h2>
        <p className="text-xs text-slate-400">Sales, Technical Support, Billing & Orchestration agents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map(agent => (
          <div key={agent.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-4 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-700">
                  {iconForRole(agent.role)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{agent.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-700 rounded-full text-slate-300 uppercase">{agent.role}</span>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${agent.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700 text-slate-400'}`}>
                {agent.enabled ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Settings className="w-3.5 h-3.5" /> Capabilities
              </div>
              <div className="flex flex-wrap gap-1.5">
                {agent.capabilities.map(cap => (
                  <span key={cap} className="text-[10px] px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-300">{cap}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-700">
                <div className="text-slate-500">Model</div>
                <div className="text-white font-mono">{agent.model}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-700">
                <div className="text-slate-500">Temperature</div>
                <div className="text-white font-mono">{agent.temperature}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> Autonomous reasoning enabled
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-2">Chatbot API</h3>
        <code className="text-[10px] text-cyan-400 font-mono">POST /api/chat/autonomous</code>
        <p className="text-xs text-slate-400 mt-2">Send {`{ sessionId, message, context }`} to get autonomous responses routed by intent (sales/tech/billing/orchestrator)</p>
      </div>
    </div>
  );
};
