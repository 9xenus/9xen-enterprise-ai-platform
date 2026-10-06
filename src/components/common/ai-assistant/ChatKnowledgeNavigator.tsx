import React, { useState } from 'react';
import { Search, BookOpen, Shield, Cpu, Activity, Copy, Check, Terminal, ExternalLink, Zap } from 'lucide-react';

interface KnowledgeItem {
  id: string;
  category: 'Trading Engine' | 'AI Training & GPU' | 'Agentic Core' | 'Security & Compliance';
  title: string;
  summary: string;
  details: string;
  codeSnippet?: string;
  tags: string[];
}

const KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: 'kb-1',
    category: 'Trading Engine',
    title: 'FIX Protocol 4.4 / MT5 Bridge Latency & Specifications',
    summary: 'Direct market access gateway with <1.8ms tick-to-trade and multi-account MAM allocation.',
    details: 'Supports FIX 4.4 / 5.0 SP2 session layers, MetaTrader 5 Expert Advisor memory-mapped bridge, cTrader Open API, and Binance/Bybit WebSocket feeds with automatic reconnect heartbeat.',
    codeSnippet: `// FIX 4.4 Message Spec Example
8=FIX.4.4|9=148|35=D|49=9XEN_QUANT|56=BROKER_GATEWAY|34=1024|52=20260904-12:00:00.120|11=ORD_9X_0912|21=1|55=EUR/USD|54=1|60=20260904-12:00:00.118|40=1|44=1.08450|10=045|`,
    tags: ['FIX 4.4', 'MT5 Bridge', 'Drawdown Limiter', 'Forex & Crypto'],
  },
  {
    id: 'kb-2',
    category: 'Trading Engine',
    title: 'AlphaBot Pro Automated Prop Firm Drawdown Guard',
    summary: 'Hardware-enforced daily 4% & overall 8% drawdown stop-out guards to guarantee funded account safety.',
    details: 'Monitors real-time equity vs balance tick-by-tick. Triggers immediate microsecond order neutralization and hedge placement if drawdown threshold reaches 3.8% of daily allowable risk.',
    tags: ['FTMO', 'MFF', 'Drawdown Guard', 'Hedge Mode'],
  },
  {
    id: 'kb-3',
    category: 'AI Training & GPU',
    title: 'Sovereign NVIDIA H100 GPU Cluster Data Pipeline',
    summary: 'Dedicated 8x H100 SXM5 nodes with InfiniBand NDR 400Gbps inter-GPU fabric for zero-leakage enterprise fine-tuning.',
    details: 'Supports FP8/BF16 mixed precision, DeepSpeed ZeRO-3, Megatron-LM tensor parallelism, and synthetic instruction data generation with automated PII redacting filters.',
    codeSnippet: `curl -X POST "https://api.9xen.ai/v1/training/clusters" \\
  -H "Authorization: Bearer xen_live_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "cluster_type": "H100_SXM5_8X",
    "dataset_id": "ds_enterprise_prop_01",
    "framework": "DeepSpeed_ZeRO3",
    "zero_data_retention": true
  }'`,
    tags: ['H100 SXM5', 'InfiniBand', 'Data Synthesis', 'Fine-Tuning'],
  },
  {
    id: 'kb-4',
    category: 'Agentic Core',
    title: '9xen Nexus Autonomous Multi-Agent Orchestration',
    summary: 'Stateful cognitive agents capable of parallel tool use, asynchronous web retrieval, and task breakdown.',
    details: 'Coordinates specialized sub-agents (Quant Researcher, Risk Auditor, Execution Manager) through cryptographic token-gated communication with rollback capabilities.',
    tags: ['Nexus Core', 'State Machine', 'Tool Calling', 'Zero Telemetry'],
  },
  {
    id: 'kb-5',
    category: 'Security & Compliance',
    title: 'SOC-2 Type II, ISO 27001 & EU AI Act Article 14 Compliance',
    summary: 'Complete cryptographic compliance envelope, air-gapped deployment, and automated human-in-the-loop audit logs.',
    details: 'Every inference and model transaction generates an immutable SHA-256 hash stored in DuckDB audit logs. Zero user data is retained for foundation model retraining.',
    tags: ['SOC-2 Type II', 'EU AI Act', 'DuckDB Audit', 'Air-Gapped'],
  },
];

interface ChatKnowledgeNavigatorProps {
  onInsertPrompt?: (promptText: string) => void;
  initialData?: any;
}

export const ChatKnowledgeNavigator: React.FC<ChatKnowledgeNavigatorProps> = ({ onInsertPrompt }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['All', 'Trading Engine', 'AI Training & GPU', 'Agentic Core', 'Security & Compliance'];

  const filteredItems = KNOWLEDGE_BASE.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 text-xs">
      {/* Search & Filter Header */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FIX protocol, H100 specs, MT5 bridge, SOC-2..."
            className="w-full bg-[#141414] border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-white outline-none focus:border-cyan-500/50 text-xs placeholder:text-white/30"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-cyan-500 text-black font-bold shadow'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-[#121212] border border-white/10 hover:border-cyan-500/30 rounded-xl p-3.5 space-y-2.5 transition-all group"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-mono text-cyan-400 font-bold">
                  {item.category}
                </span>
                <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors mt-0.5">
                  {item.title}
                </h4>
              </div>
              <button
                onClick={() => onInsertPrompt(`Can you explain the technical implementation details for ${item.title}?`)}
                className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 text-[10px] font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                title="Ask AI about this"
              >
                <Zap className="w-3 h-3" />
                <span>Ask AI</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">{item.details}</p>

            {item.codeSnippet && (
              <div className="rounded-lg bg-black border border-white/10 overflow-hidden font-mono text-[11px]">
                <div className="flex items-center justify-between px-2.5 py-1 bg-white/5 border-b border-white/5 text-white/50 text-[10px]">
                  <span className="flex items-center gap-1 text-cyan-400 font-bold">
                    <Terminal className="w-3 h-3" />
                    <span>SPEC_SNIPPET</span>
                  </span>
                  <button
                    onClick={() => handleCopyCode(item.id, item.codeSnippet!)}
                    className="hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-2.5 text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  <code>{item.codeSnippet}</code>
                </pre>
              </div>
            )}

            <div className="flex flex-wrap gap-1 pt-1">
              {item.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-mono text-white/50"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
