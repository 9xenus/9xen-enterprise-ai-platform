import React, { useState, useMemo } from 'react';
import { useCms } from '../../context/CmsContext';
import { AutoTranslate } from '../common/AutoTranslate';
import {
  Layers,
  Award,
  Check,
  ArrowRight,
  FileText,
  Sparkles,
  Bot,
  Play,
  Terminal,
  Search,
  SlidersHorizontal,
  Table,
  LayoutGrid,
  ShieldCheck,
  Cpu,
  Zap,
  Code2,
  Copy,
  CheckCircle2,
  ExternalLink,
  Lock,
  Server,
  Activity,
  ChevronRight,
  Database,
  TrendingUp,
  BarChart3,
  ShieldAlert,
  DollarSign,
  Percent,
  RefreshCw,
  UserCheck,
  Globe2,
  Sliders,
  X,
} from 'lucide-react';
import { ProductItem } from '../../types/cms';

interface Props {
  onOpenDemo: () => void;
  selectedId?: string;
  onNavigate?: (tab: string, itemId?: string) => void;
}

export const ProductsView: React.FC<Props> = ({ onOpenDemo, selectedId, onNavigate }) => {
  const { cmsData } = useCms();
  const { products } = cmsData;

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeCodeProductId, setActiveCodeProductId] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [selectedPlanProduct, setSelectedPlanProduct] = useState<ProductItem | null>(null);

  const handlePurchase = async (productId: string, planType: string) => {
    setIsPurchasing(productId);
    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          planType,
          successUrl: `${window.location.origin}/checkout/success?product=${productId}`,
          cancelUrl: window.location.href,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Checkout session creation failed.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Unable to initiate checkout.');
    } finally {
      setIsPurchasing(null);
    }
  };

  // Quant Trading Bot Backtest Simulator State
  const [quantSymbol, setQuantSymbol] = useState<'EUR/USD' | 'BTC/USDT' | 'XAU/USD' | 'GBP/JPY' | 'ETH/USDT'>('EUR/USD');
  const [quantMode, setQuantMode] = useState<'Prop Firm Challenge' | 'HFT Momentum' | 'Cross-Exchange Arbitrage'>('Prop Firm Challenge');
  const [quantCapital, setQuantCapital] = useState<number>(200000);
  const [simulatingQuant, setSimulatingQuant] = useState<boolean>(false);
  const [quantResults, setQuantResults] = useState({
    pnlPct: 14.82,
    profitUsd: 29640,
    winRate: 78.4,
    trades: 1420,
    maxDailyDrawdown: 1.84,
    profitFactor: 2.65,
    sharpe: 3.12,
  });

  // Autonomous Simulator state
  const [agentTask, setAgentTask] = useState('Analyze investment portfolio exposure for Q3 macro inflation risks');
  const [simulating, setSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [simLogs, setSimLogs] = useState<string[]>([]);

  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    (products || []).forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return (products || []).filter((product) => {
      const matchesCat = selectedCategory === 'All' || product.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.title.toLowerCase().includes(q) ||
        product.tagline?.toLowerCase().includes(q) ||
        product.shortDescription?.toLowerCase().includes(q) ||
        product.category?.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleSimulate = async () => {
    if (simulating) return;
    setSimulating(true);
    setSimulationStep(1);
    setSimLogs([`[0.00s] Connecting to Gemini API gateway for: "${agentTask}"...`]);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Act as a 9xen Enterprise Autonomous Agent executing the following mission critical task. Generate a short, highly technical 4-5 line log output of the task execution process in a zero-trust sandbox: ${agentTask}` })
      });
      const data = await res.json();
      
      setSimulationStep(3);
      setSimLogs([
        `[0.00s] Execution initialized for: "${agentTask}"`,
        ...data.text.split('\n').filter((l: string) => l.trim().length > 0)
      ]);
    } catch (err) {
      setSimLogs([`Error connecting to AI backend. Please verify your connection.`]);
    } finally {
      setSimulationStep(4);
      setSimulating(false);
    }
  };

  const getProductCodeSnippet = (product: ProductItem) => {
    return `import { XenClient } from "@9xen/sdk";

// Initialize client with VPC endpoint
const client = new XenClient({
  apiKey: "YOUR_XEN_API_KEY",
  endpoint: "https://api.9xen.ai/v1",
});

// Invoke ${product.title} runtime
const session = await client.products.initialize("${product.slug || product.id}", {
  cluster: "dedicated-vpc-us-east",
  zeroDataRetention: true,
  concurrency: "auto",
});

const result = await session.execute({
  task: "Enterprise mission critical automation",
  auditTrail: true,
});

console.log("Telemetry & Output:", result.payload);`;
  };

  const runQuantSimulation = () => {
    if (simulatingQuant) return;
    setSimulatingQuant(true);
    setTimeout(() => {
      const baseProfit = quantMode === 'Prop Firm Challenge' ? 12.5 : quantMode === 'HFT Momentum' ? 18.4 : 9.2;
      const noise = (Math.random() - 0.5) * 4;
      const finalPct = Number((baseProfit + noise).toFixed(2));
      const profitUsd = Math.round(quantCapital * (finalPct / 100));
      const winRate = Number((72 + Math.random() * 12).toFixed(1));
      const maxDd = Number((1.2 + Math.random() * 1.5).toFixed(2));

      setQuantResults({
        pnlPct: finalPct,
        profitUsd,
        winRate,
        trades: Math.floor(800 + Math.random() * 1200),
        maxDailyDrawdown: maxDd,
        profitFactor: Number((2.1 + Math.random() * 0.8).toFixed(2)),
        sharpe: Number((2.8 + Math.random() * 0.7).toFixed(2)),
      });
      setSimulatingQuant(false);
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Header Banner */}
      <section className="text-center max-w-4xl mx-auto space-y-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs font-bold font-mono uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5" />
          <span>9xen Enterprise Product Portfolio</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white dark:text-white light:text-slate-950 tracking-tight">
          Cognitive Software & Foundation Engines
        </h1>
        <p className="text-base sm:text-lg text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Pre-built, customizable enterprise platforms engineered for autonomous multi-agent orchestration, continuous regulatory intelligence, and high-frequency quantitative trading.
        </p>

        {/* Global Quick Stats */}
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">10,000+</div>
            <div className="text-[11px] text-slate-400 font-medium">Concurrent Agents</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">&lt; 1.8ms</div>
            <div className="text-[11px] text-slate-400 font-medium">Quant Order Dispatch</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">4.0% Max</div>
            <div className="text-[11px] text-slate-400 font-medium">Prop Firm Drawdown Cap</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-xl sm:text-2xl font-black text-violet-400 font-mono">SOC-2</div>
            <div className="text-[11px] text-slate-400 font-medium">Type II & ISO 27001</div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCT LANDING SECTION: 9xen Institutional Quant Trading Engine (AlphaBot Pro) */}
      <section className="p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-900/80 border border-amber-500/30 shadow-2xl relative overflow-hidden space-y-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-slate-800 pb-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Institutional Quant FinTech</span>
              </span>
              <span className="text-[11px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Prop Funds & Hedge Funds
              </span>
              <span className="text-[11px] font-mono text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                MT5 / FIX 4.4 / Binance Live
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              9xen Institutional Quant Trading Engine (AlphaBot Pro)
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              High-frequency Forex & Crypto algorithmic trading bot engineered for <strong>Prop Firms (FTMO, FundedNext, MFF)</strong>, Crypto & Forex Hedge Funds, and AUM managers ($100k - $50M+). Features automated <strong>4% daily drawdown limiters</strong>, sub-1.8ms execution, orderbook delta momentum, and MAM/PAMM trade mirroring.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={onOpenDemo}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Request Trial & Demo</span>
            </button>
          </div>
        </div>

        {/* Interactive HFT Backtesting Simulator Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          {/* Controls */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                <span>Strategy Backtest Simulator</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Sub-1.8ms Latency</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Asset Pair / Market</label>
                <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                  {(['EUR/USD', 'BTC/USDT', 'XAU/USD', 'GBP/JPY', 'ETH/USDT'] as const).map((sym) => (
                    <button
                      key={sym}
                      onClick={() => setQuantSymbol(sym)}
                      className={`px-2.5 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                        quantSymbol === sym
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Execution Mode</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 font-mono text-[11px]">
                  {(['Prop Firm Challenge', 'HFT Momentum', 'Cross-Exchange Arbitrage'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setQuantMode(m)}
                      className={`px-2 py-1.5 rounded-lg border font-bold transition-all cursor-pointer text-center text-[10px] ${
                        quantMode === m
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Simulated Account Capital ($)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={10000}
                    max={1000000}
                    step={10000}
                    value={quantCapital}
                    onChange={(e) => setQuantCapital(Number(e.target.value))}
                    className="flex-1 accent-amber-400 cursor-pointer"
                  />
                  <span className="font-mono text-amber-400 font-bold w-24 text-right">
                    ${quantCapital.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={runQuantSimulation}
                disabled={simulatingQuant}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${simulatingQuant ? 'animate-spin' : ''}`} />
                <span>{simulatingQuant ? 'Calculating Neural Backtest...' : 'Run Walk-Forward Backtest'}</span>
              </button>
            </div>
          </div>

          {/* Results Output Metrics */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Simulated Backtest Performance ({quantSymbol} - {quantMode})</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Passed Prop Audit
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Total Return</div>
                <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                  +{quantResults.pnlPct}%
                </div>
                <div className="text-[10px] font-mono text-slate-500">+${quantResults.profitUsd.toLocaleString()}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Win Rate</div>
                <div className="text-lg font-black text-cyan-400 font-mono mt-0.5">
                  {quantResults.winRate}%
                </div>
                <div className="text-[10px] font-mono text-slate-500">{quantResults.trades} Executed</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Max Daily Loss</div>
                <div className="text-lg font-black text-amber-400 font-mono mt-0.5">
                  {quantResults.maxDailyDrawdown}%
                </div>
                <div className="text-[10px] font-mono text-emerald-400">&lt; 4.0% Limit</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Profit Factor</div>
                <div className="text-lg font-black text-violet-400 font-mono mt-0.5">
                  {quantResults.profitFactor}
                </div>
                <div className="text-[10px] font-mono text-slate-500">Sharpe: {quantResults.sharpe}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-300 space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span>Prop Firm Challenge Compliance:</span>
                <span className="text-emerald-400 font-bold">100% PASSED GUARANTEE</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-emerald-500 h-full w-[88%]" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                <span>Daily Drawdown Cap: 4.00%</span>
                <span>Actual Max: {quantResults.maxDailyDrawdown}%</span>
                <span>Buffer Remaining: {(4.00 - quantResults.maxDailyDrawdown).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Control Bar: Search, Category Filters, View Switcher */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search and View Mode */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, specs..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Architecture Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Comparison Table View"
              >
                <Table className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400 space-y-3">
            <Search className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm font-semibold">No products found matching &quot;{searchQuery}&quot;</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="text-xs text-cyan-400 hover:underline cursor-pointer"
            >
              Reset search filters
            </button>
          </div>
        )}
      </section>

      {/* VIEW 1: Grid Mode */}
      {viewMode === 'grid' && (
        <section className="space-y-10">
          {filteredProducts.map((product) => {
            const isSelected = selectedId === product.id;
            const isCodeOpen = activeCodeProductId === product.id;
            const codeSnippet = getProductCodeSnippet(product);

            return (
              <div
                key={product.id}
                id={`product-${product.id}`}
                className={`p-6 sm:p-10 rounded-3xl bg-slate-900/60 border transition-all duration-300 shadow-xl relative overflow-hidden ${
                  isSelected
                    ? 'border-violet-500 ring-2 ring-violet-500/30 bg-slate-900/80'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Background Accent Glow */}
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Product Information */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Tags and Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        {product.category}
                      </span>
                      {product.badge && (
                        <span className="text-xs font-bold text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" />
                          {product.badge}
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        Live Node
                      </span>
                    </div>

                    {/* Title and Tagline */}
                    <div>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                        <AutoTranslate text={product.title} />
                      </h2>
                      <p className="text-sm font-semibold text-cyan-400 mt-1">
                        <AutoTranslate text={product.tagline} />
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      <AutoTranslate text={product.fullDescription || product.shortDescription} />
                    </p>

                    {/* Key Features */}
                    {product.features && product.features.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                          Core Capabilities:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {product.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-300">
                              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                              <span><AutoTranslate text={feat} /></span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Specs / Tags Pills */}
                    {product.specs && product.specs.length > 0 && (
                      <div className="pt-2">
                        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
                          Architectural Specifications:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {product.specs.map((sp, sIdx) => {
                            const isObj = typeof sp === 'object' && sp !== null;
                            const label = isObj ? (sp as { label?: string }).label : null;
                            const val = isObj ? (sp as { value?: string }).value : String(sp);

                            return (
                              <div
                                key={sIdx}
                                className="text-[11px] font-mono px-3 py-1.5 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 inline-flex items-center gap-1.5"
                              >
                                {label && <span className="text-slate-500 font-semibold">{label}:</span>}
                                <span className="text-cyan-300 font-bold">{val}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                      {/* Primary Actions & Code Inspector Toggle */}
                    <div className="pt-4 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setSelectedPlanProduct(product)}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Deploy License</span>
                      </button>

                      <button
                        onClick={onOpenDemo}
                        className="px-6 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <span>Demo Walkthrough</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() =>
                          setActiveCodeProductId(isCodeOpen ? null : product.id)
                        }
                        className={`px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                          isCodeOpen
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-950 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{isCodeOpen ? 'Hide API SDK' : 'Inspect API SDK'}</span>
                      </button>

                      {product.specSheetUrl && (
                        <a
                          href={product.specSheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-3 rounded-xl bg-slate-950 text-slate-400 hover:text-white text-xs font-bold transition-colors flex items-center gap-2 border border-slate-800"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>PDF Spec</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Visual Architecture or Embedded Code */}
                  <div className="lg:col-span-5 space-y-4">
                    {isCodeOpen ? (
                      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
                        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                            <Terminal className="w-3.5 h-3.5" />
                            <span>typescript-sdk-sample.ts</span>
                          </div>
                          <button
                            onClick={() => handleCopyCode(product.id, codeSnippet)}
                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            {copiedCodeId === product.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy SDK</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-4 text-[11px] font-mono text-cyan-300 overflow-x-auto leading-relaxed max-h-[380px] scrollbar-thin">
                          {codeSnippet}
                        </pre>
                      </div>
                    ) : (
                      <div className="aspect-video lg:aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl relative group">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-gradient-to-b from-slate-900 to-slate-950">
                            <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
                              <Bot className="w-8 h-8 text-cyan-400" />
                            </div>
                            <div className="text-sm font-bold text-white">
                              {product.title} Runtime Node
                            </div>
                            <div className="text-xs text-slate-400 font-mono">
                              SOC-2 Isolated Enclave Ready
                            </div>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-slate-300">
                          <span>{product.pricingModel || 'Enterprise License'}</span>
                          <span className="text-cyan-400 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Air-Gapped Ready
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* VIEW 2: High-Density Enterprise Matrix Table Mode */}
      {viewMode === 'table' && (
        <section className="rounded-3xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white">Enterprise Architectural Matrix</h3>
              <p className="text-xs text-slate-400">
                Direct side-by-side technical comparison across isolation models, latency budgets, and deployment footprints.
              </p>
            </div>
            <button
              onClick={onOpenDemo}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Request Custom Enterprise SLA
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Product Suite</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Throughput / Latency</th>
                  <th className="px-6 py-4">Hosting Options</th>
                  <th className="px-6 py-4">Governance / Audit</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm font-sans">{p.title}</div>
                      <div className="text-[11px] text-slate-400 font-sans mt-0.5 line-clamp-1">{p.tagline}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-violet-500/10 text-violet-300 border border-violet-500/20 text-[10px]">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-cyan-300">
                      {p.specs?.[0]?.value || '< 250ms Dispatch'}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      AWS VPC / GKE / On-Prem
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        SOC-2 & Zero Retention
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={onOpenDemo}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-white font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Deploy</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Interactive Autonomous Simulator */}
      <section className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold font-mono mb-3">
            <Terminal className="w-3.5 h-3.5" />
            <span>Autonomous Multi-Agent Simulator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Enterprise Agent Swarm Execution Testbed
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            Experience how 9xen Agentic Core decomposes unstructured enterprise operations into verified multi-agent task graphs with zero-trust policy enforcement.
          </p>
        </div>

        {/* Simulator controls */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={agentTask}
              onChange={(e) => setAgentTask(e.target.value)}
              placeholder="Input mission-critical task..."
              className="flex-1 px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50 shadow-lg shadow-cyan-500/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{simulating ? 'Executing Swarm...' : 'Run Simulation'}</span>
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-mono text-[11px]">Task Presets:</span>
            {[
              'Stress-test tier 1 capital adequacy under Fed rate hike',
              'Perform SEC 17a-4 compliance audit on 10,000 internal emails',
              'Auto-generate air-gapped Helm chart deployment for AWS EKS',
            ].map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setAgentTask(preset)}
                className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              >
                {preset.slice(0, 38)}...
              </button>
            ))}
          </div>

          {/* Simulation Output Console */}
          {simLogs.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed shadow-inner animate-in fade-in duration-200 space-y-1">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-[10px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Isolated Sandbox Active (Cluster #812-VPC)
                </span>
                <span>Stage {simulationStep}/4</span>
              </div>
              {simLogs.map((line, i) => (
                <div key={i} className="pt-1">
                  {line}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Backend Dashboard Integration Callout */}
      <section className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-violet-950/40 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-violet-400 font-bold uppercase">
            <Database className="w-4 h-4" />
            <span>Backend Integration & Admin Controls</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Manage Products & API Telemetry in the Admin Dashboard
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            Authorized administrators can update product catalog specifications, inspect live DuckDB analytical queries, monitor token budgets, and provision API access keys in real time.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              // Open footer or trigger admin if possible
              if (onNavigate) {
                onNavigate('models');
              } else {
                onOpenDemo();
              }
            }}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 border border-slate-700"
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>Models & API Gateway</span>
          </button>
          <button
            onClick={onOpenDemo}
            className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-violet-500/20"
          >
            Executive Access
          </button>
        </div>
      </section>

      {/* Plan Selection Modal */}
      {selectedPlanProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">License Selection: {selectedPlanProduct.title}</h2>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Choose your deployment scale</p>
                </div>
              </div>
              <button onClick={() => setSelectedPlanProduct(null)} className="p-2 text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Starter */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 hover:border-cyan-500/30 transition-all group">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Starter</h3>
                  <div className="text-2xl font-black text-white">$99<span className="text-xs text-slate-500 font-normal ml-1">/mo</span></div>
                </div>
                <ul className="space-y-2 text-[11px] text-slate-400">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Single Instance Node</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Shared API Gateway</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Basic Monitoring</li>
                </ul>
                <button 
                  onClick={() => handlePurchase(selectedPlanProduct.id, 'starter')}
                  disabled={!!isPurchasing}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  {isPurchasing === selectedPlanProduct.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span>Select Starter</span>}
                </button>
              </div>

              {/* Professional */}
              <div className="p-6 rounded-2xl bg-slate-950 border-2 border-cyan-500/50 space-y-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 px-3 py-1 bg-cyan-500 text-slate-950 text-[10px] font-black uppercase tracking-tighter">Most Popular</div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Professional</h3>
                  <div className="text-2xl font-black text-white">$499<span className="text-xs text-slate-500 font-normal ml-1">/mo</span></div>
                </div>
                <ul className="space-y-2 text-[11px] text-slate-400">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> 5 Dedicated Nodes</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Private VPC Endpoint</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Priority Telemetry</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> AlphaBot Pro License</li>
                </ul>
                <button 
                  onClick={() => handlePurchase(selectedPlanProduct.id, 'professional')}
                  disabled={!!isPurchasing}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isPurchasing === selectedPlanProduct.id ? <RefreshCw className="w-3 h-3 animate-spin text-slate-950" /> : <span>Select Professional</span>}
                </button>
              </div>

              {/* Enterprise */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 hover:border-violet-500/30 transition-all group">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Enterprise</h3>
                  <div className="text-2xl font-black text-white">$1,999<span className="text-xs text-slate-500 font-normal ml-1">/mo</span></div>
                </div>
                <ul className="space-y-2 text-[11px] text-slate-400">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Unlimited Autonomy</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Air-Gapped / On-Prem</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Dedicated SRE Support</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Custom LLM Fine-tuning</li>
                </ul>
                <button 
                  onClick={() => handlePurchase(selectedPlanProduct.id, 'enterprise')}
                  disabled={!!isPurchasing}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-violet-600 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  {isPurchasing === selectedPlanProduct.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span>Select Enterprise</span>}
                </button>
              </div>
            </div>
            <div className="p-4 bg-slate-950/50 text-center border-t border-slate-800">
              <p className="text-[10px] text-slate-500">Secure checkout handled by Stripe Enterprise. All licenses subject to SOC-2 compliance audits.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
