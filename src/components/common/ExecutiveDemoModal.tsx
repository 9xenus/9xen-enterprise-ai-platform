import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { SolutionDynamicFields } from './SolutionDynamicFields';
import {
  X,
  Sparkles,
  Calendar,
  Building,
  Mail,
  User,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ExecutiveDemoModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { cmsData, submitContact } = useCms();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [selectedSuite, setSelectedSuite] = useState('9xen Nexus Agent Framework');
  const [datePreference, setDatePreference] = useState('Within 48 hours');
  const [notes, setNotes] = useState('');
  const [dynamicFieldsData, setDynamicFieldsData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const formattedDynamicFields = Object.entries(dynamicFieldsData)
      .map(([k, v]) => `• ${k}: ${v}`)
      .join('\n');

    const fullMessage = `Executive Briefing Request:
Suite: ${selectedSuite}
Timeframe: ${datePreference}
Company: ${company}

[Solution-Specific Parameters]:
${formattedDynamicFields || 'Standard architectural walkthrough'}

[Additional Priorities/Notes]:
${notes || 'N/A'}`;

    await submitContact({
      name,
      email,
      company,
      subject: `Executive Demo Request - ${company} (${selectedSuite})`,
      message: fullMessage,
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Decorative banner */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-violet-600 to-indigo-600" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Briefing Requested</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Thank you, <span className="text-cyan-400 font-bold">{name}</span>. An executive solutions architect will review your enterprise requirements and confirm the secure briefing calendar invite within 4 hours.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[11px] font-bold font-mono mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Confidential Briefing</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Schedule Executive Demo
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Experience a private, live demonstration of our autonomous model pipelines tailored to your industry regulations.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Your Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Elena Rostova"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Corporate Email *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="elena@enterprise.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Enterprise / Institution *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Global Health Systems"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Target Timeline</span>
                  </label>
                  <select
                    value={datePreference}
                    onChange={(e) => setDatePreference(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Within 48 hours">Within 48 hours</option>
                    <option value="This Week">This Week</option>
                    <option value="Next Week">Next Week</option>
                    <option value="Exploring for Q3 / Q4">Exploring for Q3 / Q4</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Target Product or Service Interest *</label>
                <select
                  value={selectedSuite}
                  onChange={(e) => setSelectedSuite(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <optgroup label="📦 Featured Products (Live from CMS)">
                    {cmsData.products?.map((prod) => (
                      <option key={prod.id} value={prod.title}>
                        📦 {prod.title} {prod.tagline ? `— ${prod.tagline}` : ''}
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="⚡ Enterprise Core Services (Live from CMS)">
                    {cmsData.services?.map((srv) => (
                      <option key={srv.id} value={srv.title}>
                        ⚡ {srv.title}
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="🛠️ Custom Development Services">
                    <option value="Custom Trading Bot Engineering (MT5/FIX)">
                      🤖 Custom Trading Bot & Prop Firm Pass Guarantee Suite
                    </option>
                    <option value="Custom Enterprise Agent & AI SaaS Development">
                      🔄 Custom Enterprise Autonomous AI Agent & Dashboard Engineering
                    </option>
                    <option value="Red-Teaming & AI Safety Engineering">
                      🛡️ Dedicated AI Red-Teaming & Penetration Audits
                    </option>
                  </optgroup>
                </select>
              </div>

              {/* Dynamic Solution-Specific Questionnaire */}
              <SolutionDynamicFields
                selectedSolution={selectedSuite}
                onChange={setDynamicFieldsData}
                accentColor="cyan"
              />

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Key Priorities or Current Infrastructure (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Migrating from public LLM APIs to on-premise fine-tuned models with strict HIPAA constraints..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-violet-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{submitting ? 'Connecting...' : 'Request Private Executive Briefing'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
                <Lock className="w-3 h-3 text-cyan-400" />
                <span>Protected by Mutual NDA & Enterprise Security Protocol</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
