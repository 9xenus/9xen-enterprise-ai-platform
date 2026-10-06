import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  ShieldCheck,
  Zap,
  ArrowRight,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useCms } from '../../../context/CmsContext';

interface ChatProposalBuilderProps {
  onInjectIntoChat?: (proposalText: string) => void;
  onOpenLeadForm?: (prefillNotes: string) => void;
  initialData?: any;
}

export const ChatProposalBuilder: React.FC<ChatProposalBuilderProps> = ({
  onInjectIntoChat,
  onOpenLeadForm,
}) => {
  const { cmsData } = useCms();

  // Tier selection
  const [tier, setTier] = useState<'trader' | 'fund' | 'enterprise'>('fund');
  const [solutionType, setSolutionType] = useState<string>('Quant Trading Engine (AlphaBot Pro)');
  const [contractTerm, setContractTerm] = useState<'monthly' | 'annual'>('annual');
  const [includeDedicatedVpc, setIncludeDedicatedVpc] = useState<boolean>(true);
  const [includeSla247, setIncludeSla247] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Pricing calculation
  const basePrices = {
    trader: { monthly: 499, annual: 399 },
    fund: { monthly: 1499, annual: 1199 },
    enterprise: { monthly: 3999, annual: 3199 },
  };

  const vpcAddon = includeDedicatedVpc ? (contractTerm === 'annual' ? 650 : 800) : 0;
  const slaAddon = includeSla247 ? (contractTerm === 'annual' ? 400 : 500) : 0;
  const baseMonthly = basePrices[tier][contractTerm];
  const totalMonthly = baseMonthly + vpcAddon + slaAddon;
  const annualSavings = contractTerm === 'annual' ? (basePrices[tier].monthly - basePrices[tier].annual) * 12 : 0;

  const getProposalSummary = () => {
    return `[OFFICIAL 9XEN INSTITUTIONAL PROPOSAL DRAFT]
• Solution: ${solutionType}
• Tier: ${tier.toUpperCase()} (${tier === 'trader' ? 'Prop Challenge & Pro Trader' : tier === 'fund' ? 'Institutional Fund & MAM Multi-Account' : 'Enterprise Sovereign VPC & Unlimited Seats'})
• Billing: ${contractTerm === 'annual' ? 'Annual Commitment (20% Discount applied)' : 'Monthly Flexible Term'}
• Base Architecture Rate: $${baseMonthly.toLocaleString()}/mo
• Private VPC Air-Gapped Gateway: ${includeDedicatedVpc ? `Included (+$${vpcAddon}/mo)` : 'Standard Multi-Tenant Cloud'}
• Dedicated 24/7 Quant & Engineering SLA: ${includeSla247 ? `Included (+$${slaAddon}/mo)` : 'Standard 8x5 Support'}
• Total Estimated Monthly Investment: $${totalMonthly.toLocaleString()}/mo ${contractTerm === 'annual' ? `(Annualized: $${(totalMonthly * 12).toLocaleString()}/yr, Savings: $${annualSavings.toLocaleString()})` : ''}
• Security Standard: SOC-2 Type II, EU AI Act Article 14, Zero Telemetry Data Retention Guarantee.`;
  };

  const handleCopyProposal = () => {
    navigator.clipboard.writeText(getProposalSummary());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInject = () => {
    onInjectIntoChat(`Here is our configured proposal configuration for your review:\n\n${getProposalSummary()}\n\nCan you confirm sandbox availability and contract onboarding lead time?`);
  };

  const handleBook = () => {
    onOpenLeadForm(getProposalSummary());
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 text-xs">
      {/* Header Info */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-blue-950/40 border border-emerald-500/20 text-emerald-200 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-emerald-300">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Instant Institutional Proposal & Quote Builder</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono font-bold">
            LIVE CONFIG
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Configure an official institutional quote with custom SLA, VPC isolation, and volume discounts.
        </p>
      </div>

      {/* Solution Selector */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-mono text-slate-400">Target Enterprise Solution:</label>
        <select
          value={solutionType}
          onChange={(e) => setSolutionType(e.target.value)}
          className="w-full bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-cyan-300 font-bold outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="Quant Trading Engine (AlphaBot Pro)">🤖 Quant Trading Engine (AlphaBot Pro & FIX 4.4)</option>
          <option value="Sovereign AI Data Training Cluster">⚡ Sovereign AI Data Training (NVIDIA H100 Cluster)</option>
          <option value="9xen Nexus Autonomous Agentic Core">🔄 9xen Nexus Autonomous Multi-Agent Core</option>
          <option value="Reguletter Compliance & Regulatory Engine">🛡️ Reguletter SaaS Compliance & SEC Automation</option>
        </select>
      </div>

      {/* Tier Selector Cards */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setTier('trader')}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            tier === 'trader'
              ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md shadow-cyan-500/10'
              : 'bg-[#121212] border-white/10 hover:border-white/20'
          }`}
        >
          <div>
            <span className="text-[9px] font-mono uppercase text-cyan-400 font-bold block">PRO TRADER</span>
            <h4 className="text-[11px] font-bold text-white mt-0.5">Trader Tier</h4>
          </div>
          <div className="mt-2 text-xs font-mono font-bold text-white">
            ${basePrices.trader[contractTerm]}<span className="text-[9px] font-normal text-slate-400">/mo</span>
          </div>
        </button>

        <button
          onClick={() => setTier('fund')}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
            tier === 'fund'
              ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md shadow-emerald-500/10'
              : 'bg-[#121212] border-white/10 hover:border-white/20'
          }`}
        >
          <span className="absolute -top-2 right-2 px-1.5 py-0.2 bg-emerald-500 text-black text-[8px] font-black rounded-full uppercase">
            POPULAR
          </span>
          <div>
            <span className="text-[9px] font-mono uppercase text-emerald-400 font-bold block">FUND / MAM</span>
            <h4 className="text-[11px] font-bold text-white mt-0.5">Master Fund</h4>
          </div>
          <div className="mt-2 text-xs font-mono font-bold text-white">
            ${basePrices.fund[contractTerm]}<span className="text-[9px] font-normal text-slate-400">/mo</span>
          </div>
        </button>

        <button
          onClick={() => setTier('enterprise')}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            tier === 'enterprise'
              ? 'bg-purple-500/10 border-purple-500/50 shadow-md shadow-purple-500/10'
              : 'bg-[#121212] border-white/10 hover:border-white/20'
          }`}
        >
          <div>
            <span className="text-[9px] font-mono uppercase text-purple-400 font-bold block">SOVEREIGN</span>
            <h4 className="text-[11px] font-bold text-white mt-0.5">Enterprise</h4>
          </div>
          <div className="mt-2 text-xs font-mono font-bold text-white">
            ${basePrices.enterprise[contractTerm]}<span className="text-[9px] font-normal text-slate-400">/mo</span>
          </div>
        </button>
      </div>

      {/* Contract & Addon Options */}
      <div className="bg-[#121212] border border-white/10 rounded-xl p-3 space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <span className="text-slate-300 font-medium">Billing Term:</span>
          <div className="flex items-center bg-black/60 p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => setContractTerm('monthly')}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                contractTerm === 'monthly' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setContractTerm('annual')}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                contractTerm === 'annual' ? 'bg-emerald-500 text-black' : 'text-white/50 hover:text-white'
              }`}
            >
              Annual (20% OFF)
            </button>
          </div>
        </div>

        {/* Checkbox 1: VPC */}
        <label className="flex items-center justify-between cursor-pointer py-1">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeDedicatedVpc}
              onChange={(e) => setIncludeDedicatedVpc(e.target.checked)}
              className="accent-emerald-500 rounded cursor-pointer"
            />
            <span className="text-slate-300">Dedicated Air-Gapped VPC Gateway</span>
          </div>
          <span className="font-mono text-emerald-400 font-bold">
            +${vpcAddon}/mo
          </span>
        </label>

        {/* Checkbox 2: 24/7 SLA */}
        <label className="flex items-center justify-between cursor-pointer py-1">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeSla247}
              onChange={(e) => setIncludeSla247(e.target.checked)}
              className="accent-emerald-500 rounded cursor-pointer"
            />
            <span className="text-slate-300">24/7 Dedicated Quant Engineering SLA</span>
          </div>
          <span className="font-mono text-emerald-400 font-bold">
            +${slaAddon}/mo
          </span>
        </label>
      </div>

      {/* Quote Summary Box */}
      <div className="p-3.5 rounded-2xl bg-black/80 border border-emerald-500/30 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Estimated Total Monthly Rate:</span>
          <div className="text-right">
            <span className="text-base font-black text-emerald-400 font-mono">
              ${totalMonthly.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400"> / month</span>
          </div>
        </div>

        {contractTerm === 'annual' && (
          <div className="flex items-center justify-between text-[10px] text-emerald-300/90 font-mono bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
            <span>Annual Commitment Discount:</span>
            <span>Saved ${annualSavings.toLocaleString()} / year</span>
          </div>
        )}

        <div className="pt-1 flex items-center justify-between text-[9px] text-slate-400 font-mono">
          <span>• Zero-Data Retention SLA</span>
          <span>• 14-Day Full Sandbox Trial</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        <button
          onClick={handleInject}
          className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Inject Proposal into Chat</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleCopyProposal}
          className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Quote</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
