import React, { useState, useEffect } from 'react';
import { useCms } from '../../context/CmsContext';
import { AutoTranslate } from '../common/AutoTranslate';
import { FileUploader } from '../common/FileUploader';
import { SolutionDynamicFields, getSolutionCategory } from '../common/SolutionDynamicFields';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Lock,
  ChevronDown,
  Sparkles,
  Layers,
  Bot,
  ShieldCheck,
  Building2,
  ShoppingCart,
  Briefcase,
  FileCheck,
  TrendingUp,
  Cpu,
  Code2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  initialItemId?: string;
  initialCategory?: 'products' | 'services' | 'platforms' | 'customDev' | 'general';
  initialSolution?: string;
  onNavigate?: (tab: string, itemId?: string) => void;
}

export const ContactView: React.FC<Props> = ({
  initialItemId,
  initialCategory,
  initialSolution,
  onNavigate,
}) => {
  const { cmsData, submitContact } = useCms();
  const { settings, products = [], services = [], platforms = [] } = cmsData;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [inquiryType, setInquiryType] = useState<'products' | 'services' | 'platforms' | 'customDev' | 'general'>(
    initialCategory || 'products'
  );

  // Determine initial selected solution
  const getInitialSolution = () => {
    if (initialSolution) return initialSolution;
    if (initialItemId) {
      const matchProd = products.find((p) => p.id === initialItemId || p.slug === initialItemId);
      if (matchProd) return matchProd.title;
      const matchSrv = services.find((s) => s.id === initialItemId);
      if (matchSrv) return matchSrv.title;
      const matchPlat = platforms.find((p) => p.id === initialItemId || p.slug === initialItemId);
      if (matchPlat) return matchPlat.name;
    }
    if (inquiryType === 'products' && products.length > 0) {
      return products[0].title;
    }
    if (inquiryType === 'services' && services.length > 0) {
      return services[0].title;
    }
    if (inquiryType === 'platforms' && platforms.length > 0) {
      return platforms[0].name;
    }
    return products[0]?.title || '9xen Agentic Core';
  };

  const [selectedSolution, setSelectedSolution] = useState<string>(getInitialSolution());
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [dynamicFieldsData, setDynamicFieldsData] = useState<Record<string, string>>({});
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Synchronize when initial props change
  useEffect(() => {
    if (initialCategory) setInquiryType(initialCategory);
    if (initialSolution) setSelectedSolution(initialSolution);
    else if (initialItemId) {
      const matchProd = products.find((p) => p.id === initialItemId || p.slug === initialItemId);
      if (matchProd) {
        setInquiryType('products');
        setSelectedSolution(matchProd.title);
      }
      const matchSrv = services.find((s) => s.id === initialItemId);
      if (matchSrv) {
        setInquiryType('services');
        setSelectedSolution(matchSrv.title);
      }
    }
  }, [initialItemId, initialCategory, initialSolution, products, services]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const fullSubject = `[Inquiry: ${inquiryType.toUpperCase()}] ${selectedSolution} - ${subject || company || 'Corporate'}`;

    const formattedDynamic = Object.entries(dynamicFieldsData)
      .map(([k, v]) => `• ${k}: ${v}`)
      .join('\n');

    const fullMessagePayload = `[Inquiry Category: ${inquiryType}]
[Selected Solution: ${selectedSolution}]

[Solution-Specific Parameters]:
${formattedDynamic || 'Standard parameters'}

[Client Requirements]:
${message || 'Enterprise technical consultation & demo request.'}`;

    const res = await submitContact({
      name,
      email,
      company,
      subject: fullSubject,
      message: fullMessagePayload,
      attachmentUrl,
      attachmentName,
    });
    setSubmitting(false);
    setFeedback(res);
    if (res.success) {
      setName('');
      setEmail('');
      setCompany('');
      setSubject('');
      setMessage('');
      setAttachmentUrl('');
      setAttachmentName('');
    }
  };

  const handleSelectSolutionQuickBadge = (type: 'products' | 'services' | 'platforms' | 'customDev' | 'general', title: string) => {
    setInquiryType(type);
    setSelectedSolution(title);
  };

  const faqs = [
    {
      q: 'How does 9xen ensure proprietary enterprise data and model weights remain isolated?',
      a: 'We deploy isolated, single-tenant VPC pipelines with hardware-enforced cryptographic boundaries. Zero customer data or prompt logs are ingested into foundational training corpora, with strict Zero Data Retention (ZDR) guarantees.',
    },
    {
      q: 'Can 9xen products & models run on-premise or in an air-gapped facility?',
      a: 'Yes. The entire 9xen portfolio (Agentic Core, Reguletter, Enterprise Gateway, Synthia, and Quant Engine) supports hybrid Kubernetes clusters and air-gapped hardware configurations with zero external network phone-home dependencies.',
    },
    {
      q: 'What compliance frameworks are supported out of the box?',
      a: 'We offer pre-configured guardrails and auditing layers aligned with SOC-2 Type II, HIPAA BAA, FINRA, SEC 17a-4, GDPR, and EU AI Act Article 14 standards.',
    },
    {
      q: 'What is the deployment timeline for enterprise solutions and custom models?',
      a: 'Standard enterprise pilot deployments typically launch within 2 to 4 weeks, including VPC peering, model fine-tuning validation, and automated red-teaming benchmarks.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold font-mono uppercase">
          <Mail className="w-3.5 h-3.5" />
          <span>Global Enterprise Inquiries & Solutions</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Connect with Executive Solutions
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Request an architectural walkthrough, configure private sovereign model hosting, or explore enterprise licensing across our full product and service portfolio.
        </p>
      </section>

      {/* Quick Solution Selector Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select Your Target Solution for Instant Parameter Calibration:</span>
          </span>
          <span className="text-[11px] text-cyan-400 font-mono hidden sm:inline-block">
            Current: <strong className="text-white">{selectedSolution}</strong>
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {/* Products Badges */}
          {products.map((prod) => {
            const isSelected = selectedSolution === prod.title;
            return (
              <button
                key={prod.id}
                type="button"
                onClick={() => handleSelectSolutionQuickBadge('products', prod.title)}
                className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/10 scale-105'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>📦</span>
                <span>{prod.title}</span>
              </button>
            );
          })}

          {/* Services Badges */}
          {services.map((srv) => {
            const isSelected = selectedSolution === srv.title;
            return (
              <button
                key={srv.id}
                type="button"
                onClick={() => handleSelectSolutionQuickBadge('services', srv.title)}
                className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-violet-500/20 text-violet-300 border-violet-500/50 shadow-sm shadow-violet-500/10 scale-105'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>⚡</span>
                <span>{srv.title}</span>
              </button>
            );
          })}

          {/* Platforms Badges */}
          {platforms.map((plat) => {
            const isSelected = selectedSolution === plat.name;
            return (
              <button
                key={plat.id}
                type="button"
                onClick={() => handleSelectSolutionQuickBadge('platforms', plat.name)}
                className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/10 scale-105'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>🌐</span>
                <span>{plat.name}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => handleSelectSolutionQuickBadge('customDev', 'Custom Enterprise AI Agent & Workflow Engineering')}
            className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedSolution.includes('Custom')
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 scale-105'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <span>🛠️</span>
            <span>Custom Engineering</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form + Office Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact Form Left */}
        <div className="lg:col-span-7 p-6 sm:p-10 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl space-y-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Solution Transmission</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              Enterprise Inquiry & Discovery Briefing
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Your inquiry is processed and encrypted in our analytical core. An executive solutions architect will review your parameters and follow up within 2-4 hours.
            </p>
          </div>

          {feedback ? (
            <div
              className={`p-6 rounded-2xl border text-center space-y-3 ${
                feedback.success
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}
            >
              {feedback.success ? (
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
              ) : (
                <Lock className="w-10 h-10 mx-auto text-rose-400" />
              )}
              <h3 className="font-bold text-base text-white">
                {feedback.success ? 'Inquiry Successfully Dispatched & Enqueued' : 'Transmission Alert'}
              </h3>
              <p className="text-xs text-slate-300">{feedback.message}</p>
              <button
                onClick={() => setFeedback(null)}
                className="mt-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Marcus Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Corporate Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="marcus@institution.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Category Selector Tabs */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">
                  Inquiry Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setInquiryType('products');
                      setSelectedSolution(products[0]?.title || '9xen Agentic Core');
                    }}
                    className={`py-2 px-2.5 rounded-xl border transition-all text-center cursor-pointer ${
                      inquiryType === 'products'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    📦 Products
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInquiryType('services');
                      setSelectedSolution(services[0]?.title || 'Custom LLM Development');
                    }}
                    className={`py-2 px-2.5 rounded-xl border transition-all text-center cursor-pointer ${
                      inquiryType === 'services'
                        ? 'bg-violet-500/20 text-violet-300 border-violet-500/50 shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    ⚡ Core Services
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInquiryType('platforms');
                      setSelectedSolution(platforms[0]?.name || 'Reguletter RegTech');
                    }}
                    className={`py-2 px-2.5 rounded-xl border transition-all text-center cursor-pointer ${
                      inquiryType === 'platforms'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    🌐 Platforms
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInquiryType('customDev');
                      setSelectedSolution('Custom Enterprise AI Agent & Workflow Engineering');
                    }}
                    className={`py-2 px-2.5 rounded-xl border transition-all text-center cursor-pointer ${
                      inquiryType === 'customDev'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    🛠️ Custom Dev
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInquiryType('general');
                      setSelectedSolution('General Executive Partnership');
                    }}
                    className={`py-2 px-2.5 rounded-xl border transition-all text-center cursor-pointer ${
                      inquiryType === 'general'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    💬 General
                  </button>
                </div>
              </div>

              {/* Specific Solution Selection Dropdown (Dynamically loaded from CMS backend) */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300">
                  Target Product, Service or Platform *
                </label>
                <select
                  value={selectedSolution}
                  onChange={(e) => setSelectedSolution(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {inquiryType === 'products' && (
                    <>
                      {products.map((prod) => (
                        <option key={prod.id} value={prod.title}>
                          📦 {prod.title} {prod.tagline ? `— ${prod.tagline}` : ''}
                        </option>
                      ))}
                    </>
                  )}

                  {inquiryType === 'services' && (
                    <>
                      {services.map((srv) => (
                        <option key={srv.id} value={srv.title}>
                          ⚡ {srv.title} {srv.shortDescription ? `— ${srv.shortDescription.slice(0, 50)}...` : ''}
                        </option>
                      ))}
                    </>
                  )}

                  {inquiryType === 'platforms' && (
                    <>
                      {platforms.map((plat) => (
                        <option key={plat.id} value={plat.name}>
                          🌐 {plat.name} {plat.tagline ? `— ${plat.tagline}` : ''}
                        </option>
                      ))}
                    </>
                  )}

                  {inquiryType === 'customDev' && (
                    <>
                      <option value="Custom Enterprise AI Agent & Workflow Engineering">
                        🤖 Custom Enterprise Autonomous AI Agent & Workflow Engineering
                      </option>
                      <option value="Custom Algorithmic Trading Bot & MT5/FIX Protocol Development">
                        📈 Custom Trading Bot Engineering (MT5 / FIX 4.4 / Crypto / Prop Firm)
                      </option>
                      <option value="Custom Full-Stack AI SaaS & Analytics Dashboard">
                        📊 Custom Full-Stack AI SaaS & DuckDB In-Memory Dashboard
                      </option>
                      <option value="Red-Teaming & AI Safety Audit Services">
                        🛡️ Dedicated AI Red-Teaming, Penetration Testing & Guardrails
                      </option>
                      <option value="Sovereign LLM Fine-Tuning & Private VPC Cluster Setup">
                        🧠 Sovereign LLM Fine-Tuning & Private VPC Air-Gapped Setup
                      </option>
                    </>
                  )}

                  {inquiryType === 'general' && (
                    <>
                      <option value="General Executive Partnership">Executive Partnership Inquiry</option>
                      <option value="Academic Research & Open Model Access">Academic Research & Open Model Access</option>
                      <option value="Press & Media Inquiry">Press & Media Inquiry</option>
                      <option value="Career & Institutional Investment">Career & Institutional Investment</option>
                    </>
                  )}
                </select>
              </div>

              {/* Dynamic Solution-Specific Parameters */}
              <SolutionDynamicFields
                selectedSolution={selectedSolution}
                onChange={setDynamicFieldsData}
                accentColor="cyan"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Company / Fund / Institution *</label>
                  <input
                    type="text"
                    required
                    placeholder="Acme Capital / Global Health Systems"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Project / Engagement Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Q3 Pilot Architecture Review"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Detailed Message / Scope Requirements *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your target objectives, timeline, data compliance requirements, or specific questions..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              {/* Attachment */}
              <FileUploader
                value={attachmentUrl}
                onChange={(url, fileName) => {
                  setAttachmentUrl(url);
                  setAttachmentName(fileName || '');
                }}
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Transmit Enterprise Inquiry</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-Data Retention SLA • End-to-End Encrypted Transmission</span>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Global Locations & Architecture FAQs */}
        <div className="lg:col-span-5 space-y-8">
          {/* Executive Contact Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <span>Headquarters & Research Centers</span>
            </h3>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <div className="font-bold text-white text-sm">San Francisco — Global HQ</div>
                <div className="text-slate-400">{settings?.address || '500 Howard Street, Suite 1200, San Francisco, CA 94105'}</div>
                <div className="text-cyan-400 font-mono text-[11px] pt-1">Direct: {settings?.contactPhone || '+1 (800) 555-9XEN'}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <div className="font-bold text-white text-sm">New York — Quantitative & RegTech Lab</div>
                <div className="text-slate-400">1 World Trade Center, Floor 72, New York, NY 10007</div>
                <div className="text-emerald-400 font-mono text-[11px] pt-1">Desk: +1 (212) 555-0199</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <div className="font-bold text-white text-sm">London — European Sovereign Compute</div>
                <div className="text-slate-400">22 Bishopsgate, London EC2N 4BQ, United Kingdom</div>
                <div className="text-violet-400 font-mono text-[11px] pt-1">Desk: +44 20 7946 0912</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Direct Inquiries:</span>
              <a href={`mailto:${settings?.contactEmail || 'contact@9xen.com'}`} className="text-cyan-400 font-bold hover:underline">
                {settings?.contactEmail || 'contact@9xen.com'}
              </a>
            </div>
          </div>

          {/* Architecture FAQs */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <span>Security & Deployment FAQs</span>
            </h3>

            <div className="space-y-2.5">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950/40"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full p-3.5 text-left font-bold text-xs text-slate-200 hover:text-white flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-cyan-400 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
