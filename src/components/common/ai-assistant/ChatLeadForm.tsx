import React, { useState } from 'react';
import { useCms } from '../../../context/CmsContext';
import { SolutionDynamicFields } from '../SolutionDynamicFields';
import { UserCheck, CheckCircle2, Loader2, Sparkles, Building2, Mail, Phone, DollarSign, Calendar, ArrowRight } from 'lucide-react';

interface ChatLeadFormProps {
  onSuccess?: (leadDetails: any) => void;
  prefillSolution?: string;
  prefillNotes?: string;
  initialData?: any;
}

export const ChatLeadForm: React.FC<ChatLeadFormProps> = ({
  onSuccess,
  prefillSolution,
  prefillNotes,
}) => {
  const { cmsData, refreshCmsData } = useCms();

  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadAum, setLeadAum] = useState('$100k - $1M');
  const [leadProduct, setLeadProduct] = useState(prefillSolution || 'Quant Trading Engine (AlphaBot Pro)');
  const [leadPhone, setLeadPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [leadMessage, setLeadMessage] = useState(prefillNotes || '');
  const [dynamicLeadFields, setDynamicLeadFields] = useState<Record<string, string>>({});
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadEmail.trim() || leadSubmitting) return;

    setLeadSubmitting(true);
    try {
      const formattedDynamic = Object.entries(dynamicLeadFields)
        .map(([k, v]) => `• ${k}: ${v}`)
        .join('\n');

      const fullMessagePayload = `[Executive Sandbox & Discovery Request]
Interested Product / Solution: ${leadProduct}
Contact Phone/Handle: ${leadPhone || 'N/A'}
Preferred Demonstration Date/Window: ${preferredDate || 'Earliest available'}

[Solution-Specific Parameters]:
${formattedDynamic || 'Standard institutional parameters'}

[Client Specifications / Architecture Notes]:
${leadMessage || 'Requested Sandbox Trial Access'}`;

      const payload = {
        name: leadName.trim(),
        email: leadEmail.trim(),
        company: leadCompany.trim() ? `${leadCompany.trim()} (AUM: ${leadAum})` : `AUM: ${leadAum}`,
        subject: `Sales Lead: ${leadProduct}`,
        message: fullMessagePayload,
      };

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmitted(true);
        refreshCmsData();
        onSuccess({
          name: leadName,
          email: leadEmail,
          company: leadCompany,
          aum: leadAum,
          product: leadProduct,
          formattedDynamic,
          preferredDate,
        });
      } else {
        alert('Failed to submit request. Please try again.');
      }
    } catch (err) {
      console.error('Lead submission error:', err);
      alert('An error occurred submitting your lead details.');
    } finally {
      setLeadSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 my-auto">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-emerald-400 animate-pulse" />
        </div>
        <div>
          <h4 className="text-base font-bold text-white">Trial Request Dispatched!</h4>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            Your parameters have been logged in DuckDB. Our Quant Solutions Engineer will provide sandbox access credentials within 1-2 business hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
      {/* Header Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-600/10 border border-amber-500/30 text-amber-200 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <UserCheck className="w-4 h-4" />
            <span>Institutional Sandbox & Discovery Trial</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
            ZERO TELEMETRY
          </span>
        </div>
        <p className="text-[11px] text-amber-200/80 leading-relaxed">
          Receive dedicated trial API credentials, FIX 4.4 sandbox connectivity, and custom parameter presets.
        </p>
      </div>

      <form onSubmit={handleLeadSubmit} className="space-y-3.5">
        <div>
          <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-amber-400" />
            <span>Full Name & Title *</span>
          </label>
          <input
            type="text"
            required
            value={leadName}
            onChange={(e) => setLeadName(e.target.value)}
            placeholder="e.g. Alexander Vance, Head of Quantitative Trading"
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
              <Mail className="w-3 h-3 text-amber-400" />
              <span>Work / Institutional Email *</span>
            </label>
            <input
              type="email"
              required
              value={leadEmail}
              onChange={(e) => setLeadEmail(e.target.value)}
              placeholder="vance@apexcap.com"
              className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3 text-amber-400" />
              <span>Telegram / Phone Handle</span>
            </label>
            <input
              type="text"
              value={leadPhone}
              onChange={(e) => setLeadPhone(e.target.value)}
              placeholder="@alexvance_quant / +1 (555)..."
              className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-400 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Company / Fund Entity</label>
            <input
              type="text"
              value={leadCompany}
              onChange={(e) => setLeadCompany(e.target.value)}
              placeholder="Apex Quant Capital LLC"
              className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-amber-400" />
              <span>Target Capital / AUM</span>
            </label>
            <select
              value={leadAum}
              onChange={(e) => setLeadAum(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-400 font-mono cursor-pointer"
            >
              <option value="<$100k">&lt; $100k (Individual / Funded Challenge)</option>
              <option value="$100k - $1M">$100k - $1M (Prop Fund Trader)</option>
              <option value="$1M - $10M">$1M - $10M (Hedge Fund / Family Office)</option>
              <option value="$10M+">$10M+ (Institutional Asset Manager)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-slate-400 mb-1">Target Solution of Interest *</label>
          <select
            value={leadProduct}
            onChange={(e) => setLeadProduct(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-amber-300 font-bold outline-none focus:border-amber-400 cursor-pointer"
          >
            <optgroup label="📦 Products (Live from CMS)">
              {cmsData.products?.map((prod) => (
                <option key={prod.id} value={prod.title}>
                  📦 {prod.title}
                </option>
              ))}
            </optgroup>

            <optgroup label="⚡ Core Services (Live from CMS)">
              {cmsData.services?.map((srv) => (
                <option key={srv.id} value={srv.title}>
                  ⚡ {srv.title}
                </option>
              ))}
            </optgroup>

            <optgroup label="🛠️ Specialized Deployments">
              <option value="Custom Quant Trading Bot & FIX 4.4 Engine">
                🤖 Custom Quant Trading Bot & FIX 4.4 Bridge
              </option>
              <option value="Autonomous Enterprise Agentic Core & Jira/ERP Integration">
                🔄 Autonomous Multi-Agent Core & SaaS Automation
              </option>
              <option value="Dedicated NVIDIA H100 Sovereign Fine-Tuning Cluster">
                ⚡ Sovereign NVIDIA H100 Data Preparation Cluster
              </option>
            </optgroup>
          </select>
        </div>

        {/* Dynamic Questionnaire based on selected solution */}
        <SolutionDynamicFields
          selectedSolution={leadProduct}
          onChange={setDynamicLeadFields}
          accentColor="amber"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-400" />
              <span>Preferred Demo Timing</span>
            </label>
            <input
              type="text"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              placeholder="e.g. This Thursday at 2 PM EST"
              className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-amber-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Architecture Notes</label>
            <input
              type="text"
              value={leadMessage}
              onChange={(e) => setLeadMessage(e.target.value)}
              placeholder="e.g. MT5 Bridge with 4% daily stop limit"
              className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-amber-400 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={leadSubmitting}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-black font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {leadSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Registering Institutional Sandbox in DuckDB...</span>
            </>
          ) : (
            <>
              <UserCheck className="w-4 h-4" />
              <span>Submit Sandbox & Demo Request</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
