import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { AutoTranslate } from '../common/AutoTranslate';
import { AiModelItem } from '../../types/cms';
import {
  Sparkles,
  Terminal,
  Cpu,
  CheckCircle2,
  Copy,
  Check,
  Play,
  ArrowRight,
  Database,
  Lock,
  Layers,
  BarChart3,
  Server,
  Zap,
  KeyRound,
  User,
  Bot,
  Code2,
  Shield,
  Activity
} from 'lucide-react';

interface Props {
  onOpenDemo: () => void;
  onNavigate: (tab: string, itemId?: string) => void;
}

const CODE_EXAMPLES = {
  python: `import openai

client = openai.OpenAI(
    base_url="https://api.9xen.ai/v1",
    api_key="sk-xen-live-..."
)

response = client.chat.completions.create(
    model="9xen-omni-2.5",
    messages=[
        {"role": "system", "content": "You are a senior systems engineer."},
        {"role": "user", "content": "Design an in-memory transactional cache with Rust."}
    ],
    temperature=0.2,
    max_tokens=2048,
    stream=True
)

for chunk in response:
    content = chunk.choices[0].delta.content or ""
    print(content, end="", flush=True)`,

  typescript: `import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.9xen.ai/v1',
  apiKey: "YOUR_NINEXEN_API_KEY",
});

async function generateArchitecture() {
  const completion = await client.chat.completions.create({
    model: '9xen-omni-2.5',
    messages: [
      { role: 'system', content: 'You are an enterprise AI architect.' },
      { role: 'user', content: 'Outline a multi-region VPC topology.' }
    ],
  });

  console.log(completion.choices[0].message.content);
}

generateArchitecture();`,

  curl: `curl https://api.9xen.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-xen-live-..." \\
  -d '{
    "model": "9xen-omni-2.5",
    "messages": [
      {
        "role": "system",
        "content": "You are a senior enterprise security auditor."
      },
      {
        "role": "user",
        "content": "Audit compliance for SOC2 Type II data ingestion."
      }
    ],
    "temperature": 0.1,
    "stream": true
  }'`
};

export const ModelsView: React.FC<Props> = ({ onOpenDemo, onNavigate }) => {
  const { cmsData } = useCms();
  const models = (cmsData.models && cmsData.models.length > 0 ? cmsData.models : []) as AiModelItem[];

  const [selectedModelId, setSelectedModelId] = useState<string>(models[0]?.id || '9xen-omni-2.5');
  const [activeTab, setActiveTab] = useState<'overview' | 'benchmarks' | 'pricing' | 'playground'>('overview');
  const [activeLang, setActiveLang] = useState<'python' | 'typescript' | 'curl'>('python');
  const [copied, setCopied] = useState(false);

  // Playground state
  const [promptInput, setPromptInput] = useState('Analyze financial exposure risk for multi-region cloud deployment under GDPR guidelines.');
  const [playgroundOutput, setPlaygroundOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // AI Summary state
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const currentModel = models.find((m) => m.id === selectedModelId) || models[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(CODE_EXAMPLES[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunPlayground = () => {
    setIsGenerating(true);
    setPlaygroundOutput('');
    setTimeout(() => {
      setPlaygroundOutput(
        `[9xen-OS Secure Kernel v3.4]\n[Model: ${currentModel?.name || '9xen Omni 2.5'}]\n[Execution Time: 42ms | Tokens: 488 out / 120 in]\n\nSECURE AUDIT FINDINGS:\n1. GDPR Article 32 Compliance: Verified encrypted data-at-rest across all EU nodes.\n2. Cross-Border Transfer: Zero leakage detected; cryptographic enclaves active.\n3. Risk Score: Low (0.02% probability of non-compliant payload routing).\n\nRecommendation: Proceed with auto-scaling VPC deployment.`
      );
      setIsGenerating(false);
    }, 900);
  };

  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    try {
      const textToSummarize = models.map(m => `${m.name}: ${m.tagline} - ${m.description}`).join('\n');
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSummarize, title: '9xen Foundation Models Overview' }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSummary(data.summary);
      } else {
        setAiSummary('9xen Foundation Models provide state-of-the-art multimodal reasoning, deep mathematical verification, ultra-low latency routing, and enterprise code synthesis with uncompromising data privacy.');
      }
    } catch {
      setAiSummary('9xen Foundation Models provide state-of-the-art multimodal reasoning, deep mathematical verification, ultra-low latency routing, and enterprise code synthesis with uncompromising data privacy.');
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-20 px-6 sm:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.08),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-wide uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Enterprise Neural Foundation Models</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-6 max-w-4xl leading-[1.1]">
            <AutoTranslate text="Frontier Intelligence Engineered for Regulated Enterprises" />
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mb-8 leading-relaxed">
            <AutoTranslate text="Explore 9xen's proprietary large language, reasoning, and code models. Deployed on sovereign private clouds with guaranteed zero data leakage." />
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleGenerateSummary}
              disabled={isSummarizing}
              className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center gap-2.5 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isSummarizing ? 'animate-spin' : ''}`} />
              <span>{isSummarizing ? 'Generating Executive Brief...' : aiSummary ? 'Regenerate AI Brief' : '⚡ Generate AI Fast Summary'}</span>
            </button>
            <button
              onClick={onOpenDemo}
              className="px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Request API Access</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>

          {aiSummary && (
            <div className="mt-8 p-6 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 max-w-3xl space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase">
                <Sparkles className="w-4 h-4" />
                <span>AI Executive Briefing (Fast Reading)</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{aiSummary}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
          {[
            { id: 'overview', label: 'Models Overview', icon: Cpu },
            { id: 'benchmarks', label: 'Benchmarks & Evals', icon: BarChart3 },
            { id: 'pricing', label: 'Token Economics', icon: Zap },
            { id: 'playground', label: 'Interactive API Playground', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-16">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {models.map((model) => (
                <div
                  key={model.id}
                  className={`p-8 rounded-3xl border transition-all flex flex-col justify-between ${
                    selectedModelId === model.id
                      ? 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/20 border-cyan-500/50 shadow-xl shadow-cyan-500/5'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
                        {model.badge}
                      </span>
                      <span className="text-xs font-mono text-slate-400">Context: {model.contextWindow}</span>
                    </div>

                    <h3 className="text-2xl font-black text-white mb-3">{model.name}</h3>
                    <p className="text-sm font-medium text-cyan-300 mb-4">{model.tagline}</p>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">{model.description}</p>

                    <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs">
                      <div>
                        <span className="text-slate-500 block mb-1">Max Output</span>
                        <strong className="text-white font-mono">{model.maxOutput}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1">Speed</span>
                        <strong className="text-white font-mono">{model.speed}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1">Input / Out</span>
                        <strong className="text-white font-mono">{model.inputPrice}</strong>
                      </div>
                    </div>

                    <div className="space-y-2 mb-8">
                      <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">Key Architecture Highlights:</span>
                      {model.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Best for: {model.bestFor}</span>
                    <button
                      onClick={() => {
                        setSelectedModelId(model.id);
                        setActiveTab('playground');
                      }}
                      className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border border-cyan-500/30"
                    >
                      <span>Test in Playground</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: BENCHMARKS */}
        {activeTab === 'benchmarks' && (
          <div className="space-y-12">
            <div className="bg-slate-900/60 p-8 sm:p-12 rounded-3xl border border-slate-800">
              <div className="max-w-2xl mb-12">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">Rigorous Enterprise Evaluation Suite</h2>
                <p className="text-sm text-slate-400">
                  Every 9xen model is evaluated against standardized academic and adversarial enterprise benchmarks to ensure zero regression in logic, coding, and safety.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {models.map((model) => (
                  <div key={model.id} className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-lg">{model.name}</h3>
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                        {model.badge}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {model.benchmarks.map((b, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-slate-400">{b.label}</span>
                            <span className="text-white font-bold">{b.score}</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-1000"
                              style={{ width: b.score.includes('%') ? b.score : '88%' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRICING */}
        {activeTab === 'pricing' && (
          <div className="space-y-12">
            <div className="bg-slate-900/60 p-8 sm:p-12 rounded-3xl border border-slate-800">
              <div className="max-w-2xl mb-12">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">Transparent Token Economics</h2>
                <p className="text-sm text-slate-400">
                  Pay-as-you-go billing with automatic 50% prompt caching discount on repeated system prompts and codebase indexes.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-mono text-slate-400 uppercase">
                      <th className="py-4 px-4">Model Name</th>
                      <th className="py-4 px-4">Context Window</th>
                      <th className="py-4 px-4">Input Price (per 1M tokens)</th>
                      <th className="py-4 px-4">Output Price (per 1M tokens)</th>
                      <th className="py-4 px-4">Prompt Caching Discount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {models.map((model) => (
                      <tr key={model.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-4 px-4 font-bold text-white">{model.name}</td>
                        <td className="py-4 px-4 font-mono text-cyan-400">{model.contextWindow}</td>
                        <td className="py-4 px-4 font-mono text-slate-300">{model.inputPrice}</td>
                        <td className="py-4 px-4 font-mono text-slate-300">{model.outputPrice}</td>
                        <td className="py-4 px-4 font-mono text-emerald-400">50% off</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PLAYGROUND */}
        {activeTab === 'playground' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Controls */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Select Foundation Model</span>
                </h3>
                <div className="space-y-2">
                  {models.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedModelId(m.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        selectedModelId === m.id
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm">{m.name}</div>
                        <div className="text-[11px] text-slate-500">{m.tagline}</div>
                      </div>
                      <span className="text-xs font-mono text-cyan-400">{m.contextWindow}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Prompt Input</label>
                  <textarea
                    rows={4}
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 focus:outline-hidden focus:border-cyan-500"
                  />
                </div>

                <button
                  onClick={handleRunPlayground}
                  disabled={isGenerating}
                  className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Play className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Executing Neural Inference...' : 'Run Inference Request'}</span>
                </button>
              </div>

              {/* Code Integration snippet box */}
              <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold">
                    <Code2 className="w-4 h-4" />
                    <span>API Integration Snippet</span>
                  </div>
                  <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {(['python', 'typescript', 'curl'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveLang(lang)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                          activeLang === lang ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative bg-slate-950 rounded-2xl p-4 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
                  <button
                    onClick={handleCopyCode}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Copy code"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre className="whitespace-pre">{CODE_EXAMPLES[activeLang]}</pre>
                </div>
              </div>
            </div>

            {/* Right: Output Stream */}
            <div className="lg:col-span-7">
              <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-6 h-full flex flex-col">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>Streaming Output Terminal ({currentModel?.name})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-mono text-emerald-400">Connected</span>
                  </div>
                </div>

                <div className="flex-1 bg-slate-950 rounded-2xl p-6 border border-slate-800 font-mono text-xs sm:text-sm text-cyan-200 overflow-y-auto min-h-[400px] whitespace-pre-wrap leading-relaxed">
                  {playgroundOutput || '// Click "Run Inference Request" to test live streaming output from the selected 9xen model...'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
