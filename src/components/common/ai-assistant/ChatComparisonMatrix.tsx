import React, { useState } from 'react';
import { ShieldCheck, Check, X, ArrowRight, Zap, TrendingUp, Cpu, Server } from 'lucide-react';

interface ChatComparisonMatrixProps {
  onInsertPrompt?: (promptText: string) => void;
  onOpenLeadForm?: () => void;
  initialData?: any;
}

export const ChatComparisonMatrix: React.FC<ChatComparisonMatrixProps> = ({
  onInsertPrompt,
  onOpenLeadForm,
}) => {
  const [activeCategory, setActiveCategory] = useState<'quantBot' | 'enterpriseAi'>('quantBot');

  const quantComparison = [
    {
      feature: 'Tick-to-Trade Latency',
      xen: '<1.8ms (C++ Core + FIX Engine)',
      legacy: '45ms - 120ms (Python / WebSockets)',
      winner: '9xen',
    },
    {
      feature: 'Prop Firm Drawdown Guard',
      xen: 'Hardware Stop-Out (<3.8% Daily limit)',
      legacy: 'Software tick polling (High slippage risk)',
      winner: '9xen',
    },
    {
      feature: 'MAM Multi-Account Allocation',
      xen: 'Microsecond Synchronous Mirroring (50+ Accounts)',
      legacy: 'Sequential order loop (Latency skew)',
      winner: '9xen',
    },
    {
      feature: 'Telemetry Data Retention',
      xen: '0% Data Retained / Air-gapped VPC option',
      legacy: 'Cloud provider telemetry logged',
      winner: '9xen',
    },
    {
      feature: 'Live FIX 4.4 / MT5 Integration',
      xen: 'Native Dual-Stack Memory Mapped Bridge',
      legacy: 'Single broker EA or REST API only',
      winner: '9xen',
    },
  ];

  const enterpriseComparison = [
    {
      feature: 'Enterprise Compliance Guard',
      xen: 'SOC-2 Type II, ISO 27001, EU AI Act Art. 14',
      legacy: 'Standard public cloud terms',
      winner: '9xen',
    },
    {
      feature: 'Autonomous Agent Rollback',
      xen: 'Cryptographic state machine checkpoints',
      legacy: 'Stateless tool calls without rollback',
      winner: '9xen',
    },
    {
      feature: 'GPU Cluster Orchestration',
      xen: 'Dedicated NVIDIA 8x H100 SXM5 with InfiniBand',
      legacy: 'Shared public cloud GPU queues',
      winner: '9xen',
    },
    {
      feature: 'Prompt Caching Cost Reduction',
      xen: '50% automatic discount on cached tokens',
      legacy: 'Full price per token billed',
      winner: '9xen',
    },
  ];

  const currentRows = activeCategory === 'quantBot' ? quantComparison : enterpriseComparison;

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 text-xs">
      {/* Header Info */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-indigo-950/40 border border-blue-500/20 text-cyan-200 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-cyan-300">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Institutional Benchmark Matrix</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono font-bold">
            DUCKDB VERIFIED
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Compare 9xen hardware-accelerated engines against conventional retail bots and standard cloud LLMs.
        </p>
      </div>

      {/* Switcher */}
      <div className="flex items-center bg-black/60 p-1 rounded-xl border border-white/10">
        <button
          onClick={() => setActiveCategory('quantBot')}
          className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeCategory === 'quantBot' ? 'bg-cyan-500 text-black shadow' : 'text-white/60 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Quant Trading Engine</span>
        </button>
        <button
          onClick={() => setActiveCategory('enterpriseAi')}
          className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeCategory === 'enterpriseAi' ? 'bg-purple-500 text-white shadow' : 'text-white/60 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Enterprise AI & Sovereign Core</span>
        </button>
      </div>

      {/* Comparison Table */}
      <div className="rounded-xl border border-white/10 bg-[#121212] overflow-hidden">
        <div className="grid grid-cols-12 bg-white/5 p-2.5 font-mono text-[10px] font-bold text-slate-400 border-b border-white/10">
          <div className="col-span-5">SPECIFICATION</div>
          <div className="col-span-4 text-cyan-400">9XEN ARCHITECTURE</div>
          <div className="col-span-3 text-slate-500">CONVENTIONAL</div>
        </div>

        <div className="divide-y divide-white/5">
          {currentRows.map((row, idx) => (
            <div key={idx} className="grid grid-cols-12 p-3 text-[11px] items-center hover:bg-white/[0.02] transition-colors">
              <div className="col-span-5 font-medium text-slate-200 pr-2">
                {row.feature}
              </div>
              <div className="col-span-4 text-cyan-300 font-semibold flex items-center gap-1 pr-2">
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="leading-tight">{row.xen}</span>
              </div>
              <div className="col-span-3 text-slate-500 text-[10px] leading-tight">
                {row.legacy}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Prompt Injection */}
      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        <button
          onClick={() =>
            onInsertPrompt(
              `Can you explain why 9xen ${activeCategory === 'quantBot' ? 'AlphaBot Pro <1.8ms latency' : 'Sovereign H100 zero-data retention'} outperforms conventional solutions in a live institutional setup?`
            )
          }
          className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Ask AI About This Benchmark</span>
        </button>
        <button
          onClick={onOpenLeadForm}
          className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
        >
          <span>Request Sandbox Trial</span>
        </button>
      </div>
    </div>
  );
};
