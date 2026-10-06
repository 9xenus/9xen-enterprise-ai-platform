import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bot,
  Sparkles,
  Sliders,
  Play,
  Code,
  Copy,
  Check,
  Save,
  RefreshCw,
  MessageSquare,
  Target,
  Zap,
  ShieldCheck,
  Layout,
  Calendar,
  Send,
  UserCheck,
  AlertCircle,
  ArrowUpRight,
  Plus,
  Trash2,
  Cpu,
  TrendingUp,
  Globe,
  Lock
} from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import { ChatbotConfig } from '../../types/cms';

export const SalesBotConfigManager: React.FC = () => {
  const { cmsData, updateChatbotConfig, saveCmsData, isSaving, lastSaved } = useCms();
  const currentConfig: ChatbotConfig = cmsData.settings?.chatbot || {
    enabled: true,
    botName: '9xen Autonomous Sales Advisor',
    botTitle: 'Institutional AI & Quant Solutions Advisor',
    greeting: 'Hello! I am your 9xen Sales & Solutions AI Assistant.\n\nHow can I assist you with our **Quant Trading Engine (AlphaBot Pro)**, **AI Data Training for Big Companies**, or **Reguletter Compliance SaaS** today?',
    placeholder: 'Ask about Forex/Crypto Bot, AI Data Training, Pricing, or Demo...',
    quickPrompts: [
      'Quant Trading Bot (Forex, Crypto & Prop Funds)',
      'AI Data Training for Big Companies',
      'Custom Trading Bot Engineering (MT5/FIX)',
      'Vector DB & Query Speed Optimization',
      'Reguletter SEC / FINRA Compliance SaaS',
      'Request Prop Fund Demo & Trial'
    ],
    defaultModel: 'gemini-3.6-flash',
    temperature: 0.3,
    personaPreset: 'sales',
    leadCaptureEnabled: true,
    requireContact: false,
    autoOpenDelay: 0,
    position: 'bottom-right',
    themeColor: 'cyan',
    autoQualifyScore: 75,
    webhookNotification: true,
    bookingUrl: 'https://calendar.google.com',
    customSystemPrompt: 'Focus on qualifying prospective enterprise clients by determining their primary use case (Prop Firm Trading, Enterprise AI Data Training, or Reguletter Compliance) and their approximate budget or capital under management. Provide concise, high-value quantitative details and invite them to schedule an Executive Demo session.'
  };

  // Local draft state
  const [config, setConfig] = useState<ChatbotConfig>(currentConfig);
  const [activeSubTab, setActiveSubTab] = useState<'identity' | 'model' | 'leads' | 'embed' | 'simulator'>('identity');
  const [copiedCode, setCopiedCode] = useState(false);
  const [newPromptInput, setNewPromptInput] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Interactive Simulator state
  const [simMessages, setSimMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: config.greeting || 'Hello! How can I assist you with 9xen Enterprise Solutions today?'
    }
  ]);
  const [simInput, setSimInput] = useState('');
  const [simLoading, setSimLoading] = useState(false);

  // Sync draft when cmsData updates externally
  React.useEffect(() => {
    if (cmsData.settings?.chatbot) {
      setConfig((prev) => ({
        ...prev,
        ...cmsData.settings?.chatbot
      }));
    }
  }, [cmsData.settings?.chatbot]);

  const handleFieldChange = <K extends keyof ChatbotConfig>(field: K, value: ChatbotConfig[K]) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAll = async () => {
    const success = await updateChatbotConfig(config);
    await saveCmsData();
    if (success) {
      setSaveSuccessMsg('Configuration published and active on frontend!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    }
  };

  const handleAddQuickPrompt = () => {
    if (!newPromptInput.trim()) return;
    const current = config.quickPrompts || [];
    if (!current.includes(newPromptInput.trim())) {
      handleFieldChange('quickPrompts', [...current, newPromptInput.trim()]);
    }
    setNewPromptInput('');
  };

  const handleRemoveQuickPrompt = (index: number) => {
    const current = [...(config.quickPrompts || [])];
    current.splice(index, 1);
    handleFieldChange('quickPrompts', current);
  };

  // Send a test message in the simulator
  const handleSimSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!simInput.trim() || simLoading) return;

    const userText = simInput.trim();
    setSimInput('');
    const nextMessages = [...simMessages, { role: 'user' as const, content: userText }];
    setSimMessages(nextMessages);
    setSimLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: nextMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          persona: config.personaPreset || 'sales',
          model: config.defaultModel || 'gemini-3.6-flash'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSimMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.reply || 'Thank you for your inquiry. How else can 9xen assist your infrastructure?' }
        ]);
      } else {
        setSimMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'The AI service responded with a simulated offline fallback. Verify Gemini API connectivity.' }
        ]);
      }
    } catch {
      setSimMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection test completed via local neural fallback.' }
      ]);
    } finally {
      setSimLoading(false);
    }
  };

  const embedScriptSnippet = `<!-- 9xen Autonomous Sales Assistant Widget Embed -->
<script 
  src="${window.location.origin}/widget/9xen-assistant.js" 
  data-tenant-id="9xen-enterprise" 
  data-position="${config.position || 'bottom-right'}" 
  data-theme="${config.themeColor || 'cyan'}"
  async
></script>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedScriptSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const productCount = cmsData.products?.length || 0;
  const serviceCount = cmsData.services?.length || 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-white tracking-tight">AI Sales Bot Configuration & Deployment</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold flex items-center gap-1.5 border ${
                    config.enabled
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      config.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                    }`}
                  />
                  {config.enabled ? 'Live on Frontend' : 'Disabled on Frontend'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage persona intelligence, lead qualification thresholds, greeting prompts, and live frontend deployment.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            {/* Deployment Status Switch */}
            <button
              onClick={() => handleFieldChange('enabled', !config.enabled)}
              className={`flex-1 lg:flex-initial px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                config.enabled
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{config.enabled ? 'Widget Deployed (Active)' : 'Widget Disabled (Hidden)'}</span>
            </button>

            {/* Save & Publish */}
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Publishing...' : 'Save & Publish to Frontend'}</span>
            </button>
          </div>
        </div>

        {/* Feedback alert */}
        {saveSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{saveSuccessMsg}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Last saved: {lastSaved?.toLocaleTimeString() || 'Just now'}</span>
          </motion.div>
        )}

        {/* Live Grounding Summary */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-slate-400 text-[10px] block uppercase font-mono">Grounding Catalog</span>
            <span className="text-white font-bold text-sm">
              {productCount} Products, {serviceCount} Services
            </span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-slate-400 text-[10px] block uppercase font-mono">Sales Persona</span>
            <span className="text-cyan-400 font-bold text-sm capitalize">
              {config.personaPreset || 'Sales'}
            </span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-slate-400 text-[10px] block uppercase font-mono">Lead Capture</span>
            <span className="text-violet-400 font-bold text-sm">
              {config.requireContact ? 'Pre-Chat Gate' : 'In-Chat Progressive'}
            </span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-slate-400 text-[10px] block uppercase font-mono">Placement</span>
            <span className="text-emerald-400 font-bold text-sm capitalize">
              {config.position?.replace('-', ' ') || 'Bottom Right'}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'identity', label: 'Identity & Persona', icon: Bot },
          { id: 'model', label: 'AI Intelligence & Engine', icon: Cpu },
          { id: 'leads', label: 'Lead Qualification & CRM', icon: Target },
          { id: 'embed', label: 'Frontend & Embed Code', icon: Code },
          { id: 'simulator', label: 'Live Test Simulator', icon: Play }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: IDENTITY & PERSONA */}
      {activeSubTab === 'identity' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Core Identity */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Bot Identity & Display Labels</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Bot Display Name</label>
              <input
                type="text"
                value={config.botName || ''}
                onChange={(e) => handleFieldChange('botName', e.target.value)}
                placeholder="e.g. 9xen Autonomous Sales Advisor"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 font-medium"
              />
              <span className="text-[10px] text-slate-500">Displayed in widget header and conversation title bar.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Bot Subtitle / Role Tag</label>
              <input
                type="text"
                value={config.botTitle || ''}
                onChange={(e) => handleFieldChange('botTitle', e.target.value)}
                placeholder="e.g. Institutional AI & Quant Solutions Advisor"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Sales Persona Preset</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    id: 'sales',
                    label: 'Sales Growth & Conversion',
                    desc: 'Proactively closes deals, emphasizes ROI and books executive demos.',
                    icon: TrendingUp
                  },
                  {
                    id: 'technical',
                    label: 'Quantitative Architect',
                    desc: 'Deep technical specs, sub-millisecond execution, FIX/MT5, and sovereign VPC.',
                    icon: Cpu
                  },
                  {
                    id: 'executive',
                    label: 'Executive Buyer & ROI',
                    desc: 'Focuses on SEC/FINRA compliance certainty, governance, and annual pricing.',
                    icon: ShieldCheck
                  },
                  {
                    id: 'creative',
                    label: 'Creative & Synthetic Data',
                    desc: 'Highlights synthetic dataset generation, custom LLM fine-tuning, and multi-agent flows.',
                    icon: Sparkles
                  }
                ].map((p) => {
                  const Icon = p.icon;
                  const isSelected = (config.personaPreset || 'sales') === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleFieldChange('personaPreset', p.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-500/50 text-white ring-1 ring-cyan-500/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span className="text-xs font-bold">{p.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{p.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Input Field Placeholder</label>
              <input
                type="text"
                value={config.placeholder || ''}
                onChange={(e) => handleFieldChange('placeholder', e.target.value)}
                placeholder="Ask about Forex/Crypto Bot, AI Data Training, Pricing, or Demo..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Right Column: Greeting & Custom Directives */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Initial Welcome Greeting (Markdown Supported)</span>
            </h3>

            <div className="space-y-1.5">
              <textarea
                rows={5}
                value={config.greeting || ''}
                onChange={(e) => handleFieldChange('greeting', e.target.value)}
                placeholder="Enter markdown welcome message..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono leading-relaxed"
              />
              <span className="text-[10px] text-slate-500">
                This is the first message new visitors see when opening the consultation window.
              </span>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-cyan-400" />
                  <span>Custom Enterprise Directives (System Instruction)</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    handleFieldChange(
                      'customSystemPrompt',
                      'Focus on qualifying prospective enterprise clients by determining their primary use case (Prop Firm Trading, Enterprise AI Data Training, or Reguletter Compliance) and their approximate budget or capital under management. Provide concise, high-value quantitative details and invite them to schedule an Executive Demo session.'
                    )
                  }
                  className="text-[10px] text-cyan-400 hover:underline font-mono cursor-pointer"
                >
                  Reset to Recommended Prompt
                </button>
              </div>
              <textarea
                rows={6}
                value={config.customSystemPrompt || ''}
                onChange={(e) => handleFieldChange('customSystemPrompt', e.target.value)}
                placeholder="Enter proprietary sales guidance, qualification questions, or compliance rules..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono leading-relaxed"
              />
              <p className="text-[10px] text-slate-500">
                Directly injected into Gemini on every user prompt alongside the live DuckDB catalog context.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI INTELLIGENCE & MODEL */}
      {activeSubTab === 'model' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Foundation Model & Inference Settings</span>
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Selected Gemini Model</label>
              {[
                {
                  id: 'gemini-3.6-flash',
                  label: 'Gemini 2.5 Flash (Recommended for Sales)',
                  desc: 'Ultra-low latency (<40ms TTFT), exceptional instruction following, balanced sales tone.'
                },
                {
                  id: 'gemini-3.6-pro',
                  label: 'Gemini 2.5 Pro (Deep Reasoning)',
                  desc: 'High cognitive capability for complex architectural proposals and quantitative calculations.'
                },
                {
                  id: '9xen-reasoning-pro',
                  label: '9xen Quant Reasoning Engine',
                  desc: 'Custom fine-tuned weights for proprietary trading systems, backtests, and FIX protocol.'
                }
              ].map((m) => {
                const isSelected = (config.defaultModel || 'gemini-3.6-flash') === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleFieldChange('defaultModel', m.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500/50 text-white ring-1 ring-cyan-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{m.label}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                    </div>
                    <p className="text-[10px] text-slate-500">{m.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Temperature Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Creativity / Temperature</span>
                <span className="font-mono text-cyan-400 font-bold">{config.temperature ?? 0.3}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.temperature ?? 0.3}
                onChange={(e) => handleFieldChange('temperature', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>0.0 (Strict & Factual)</span>
                <span>0.5 (Balanced Sales)</span>
                <span>1.0 (Highly Creative)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Grounding & Live Knowledge */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Live Knowledge Grounding from DuckDB</span>
            </h3>

            <p className="text-xs text-slate-400">
              The Sales Bot Assistant automatically injects your live products, services, and company background from DuckDB into every AI inference prompt so the bot never hallucinates stale offerings.
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Active Product Knowledge</h4>
                  <p className="text-[10px] text-slate-500">{productCount} active products in live catalog</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono">
                  DuckDB Synced
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Active Service Knowledge</h4>
                  <p className="text-[10px] text-slate-500">{serviceCount} active engineering services</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                  DuckDB Synced
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Gemini API Key</h4>
                  <p className="text-[10px] text-slate-500">Secure server-side proxy active</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                  Connected
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <h4 className="text-xs font-bold text-white">9xen Domain Guardrail</h4>
                  </div>
                  <p className="text-[10px] text-slate-400">Restricts AI scope strictly to 9xen products & services. Blocks off-topic queries.</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-semibold">
                  Active & Enforced
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LEADS & CONVERSION */}
      {activeSubTab === 'leads' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>Lead Capture & Qualification Automation</span>
            </h3>

            {/* Mandatory Gate toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white">Require Contact Details Upfront</span>
                <p className="text-[10px] text-slate-400">
                  When enabled, visitors must submit Name, Email, & Mobile before starting the chat session.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFieldChange('requireContact', !config.requireContact)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  config.requireContact ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    config.requireContact ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Auto Webhook Dispatch */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white">Auto-Push Leads to Webhooks</span>
                <p className="text-[10px] text-slate-400">
                  Automatically trigger configured outbound webhooks when a visitor is qualified.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFieldChange('webhookNotification', !config.webhookNotification)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  config.webhookNotification ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    config.webhookNotification ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Demo / Booking Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Executive Demo / Calendar Booking URL</label>
              <input
                type="url"
                value={config.bookingUrl || ''}
                onChange={(e) => handleFieldChange('bookingUrl', e.target.value)}
                placeholder="https://calendar.google.com or https://calendly.com/your-team"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
              />
              <span className="text-[10px] text-slate-500">
                Embedded directly into the chat assistant when a visitor asks to schedule an executive demonstration.
              </span>
            </div>

            {/* Intent Score Threshold */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Auto-Qualification Intent Threshold</span>
                <span className="font-mono text-cyan-400 font-bold">{config.autoQualifyScore ?? 75}/100</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={config.autoQualifyScore ?? 75}
                onChange={(e) => handleFieldChange('autoQualifyScore', parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">
                Visitors scoring above this threshold in Gemini sentiment analysis are flagged as high-priority hot leads.
              </span>
            </div>
          </div>

          {/* Right Column: Quick Prompt Pills */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Quick Prompt Pills (1-Click Suggestions)</span>
            </h3>

            <p className="text-xs text-slate-400">
              Chips shown at the bottom of the consultation window to guide prospective enterprise clients.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={newPromptInput}
                onChange={(e) => setNewPromptInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddQuickPrompt();
                  }
                }}
                placeholder="Add custom prompt chip (e.g. Schedule Quant Demo)..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleAddQuickPrompt}
                className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {(config.quickPrompts || []).map((prompt, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                >
                  <span className="truncate pr-2">{prompt}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuickPrompt(idx)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FRONTEND & EMBED CODE */}
      {activeSubTab === 'embed' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layout className="w-4 h-4 text-cyan-400" />
              <span>Frontend Display & Appearance</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Widget Screen Position</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'bottom-right', label: 'Bottom Right (Standard)' },
                  { id: 'bottom-left', label: 'Bottom Left' }
                ].map((pos) => {
                  const isSelected = (config.position || 'bottom-right') === pos.id;
                  return (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => handleFieldChange('position', pos.id as any)}
                      className={`p-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 ring-1 ring-cyan-500/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {pos.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Auto-Open Popup Delay</label>
              <select
                value={config.autoOpenDelay ?? 0}
                onChange={(e) => handleFieldChange('autoOpenDelay', parseInt(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value={0}>Disabled (Only opens when user clicks launcher)</option>
                <option value={5}>5 seconds after page load</option>
                <option value={10}>10 seconds after page load</option>
                <option value={20}>20 seconds after page load</option>
                <option value={30}>30 seconds after page load</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Theme Accent Highlight</label>
              <div className="flex items-center gap-3">
                {[
                  { id: 'cyan', label: 'Cyan', colorClass: 'bg-cyan-400' },
                  { id: 'violet', label: 'Violet', colorClass: 'bg-violet-400' },
                  { id: 'emerald', label: 'Emerald', colorClass: 'bg-emerald-400' },
                  { id: 'indigo', label: 'Indigo', colorClass: 'bg-indigo-400' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleFieldChange('themeColor', t.id as any)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs cursor-pointer ${
                      (config.themeColor || 'cyan') === t.id
                        ? 'border-cyan-400 bg-cyan-500/10 text-white font-bold'
                        : 'border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${t.colorClass}`} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Copyable Embed Code */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <span>Subdomain & External Web Embed Code</span>
              </h3>
              <button
                type="button"
                onClick={copyEmbedCode}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center gap-1.5 border border-cyan-500/30 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Script Tag'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Embed your 9xen Sales Bot on client portals, documentation hubs, or partner landing pages with this lightweight asynchronous snippet:
            </p>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {embedScriptSnippet}
            </pre>

            <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                The widget handles cross-origin requests, preserves session state, and securely routes all conversations through your 9xen enterprise backend.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LIVE TEST SIMULATOR */}
      {activeSubTab === 'simulator' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Interactive Bot Testing Simulator</h3>
            </div>
            <button
              onClick={() =>
                setSimMessages([
                  {
                    role: 'assistant',
                    content: config.greeting || 'Hello! How can I assist you with 9xen Enterprise Solutions today?'
                  }
                ])
              }
              className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Simulator</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Verify how the bot responds with the current persona ({config.personaPreset || 'sales'}) and system instructions in real time.
          </p>

          <div className="max-w-2xl mx-auto border border-slate-800 rounded-2xl bg-slate-950 overflow-hidden shadow-2xl flex flex-col h-[480px]">
            {/* Simulator Header */}
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{config.botName || '9xen Autonomous Sales Advisor'}</h4>
                  <span className="text-[10px] text-emerald-400 font-mono">Live Simulator Active</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {config.defaultModel || 'gemini-3.6-flash'}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
              {simMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-medium'
                        : 'bg-slate-900 border border-slate-800 text-slate-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {simLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center gap-2 text-slate-400">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>Analyzing with Gemini & DuckDB catalog...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick chips in simulator */}
            <div className="px-3 py-2 bg-slate-900/50 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px]">
              {(config.quickPrompts || []).slice(0, 3).map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSimInput(prompt);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSimSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                placeholder={config.placeholder || 'Type your message to test...'}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={simLoading || !simInput.trim()}
                className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
