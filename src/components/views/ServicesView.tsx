import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { AutoTranslate } from '../common/AutoTranslate';
import {
  Cpu,
  Shield,
  Layers,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Calculator,
  Terminal,
  Server,
  Zap,
} from 'lucide-react';

interface Props {
  onOpenDemo: () => void;
  selectedId?: string;
}

export const ServicesView: React.FC<Props> = ({ onOpenDemo, selectedId }) => {
  const { cmsData } = useCms();
  const { services } = cmsData;
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Interactive Quote Calculator
  const [modelType, setModelType] = useState('agent_orchestration');
  const [computeTier, setComputeTier] = useState('dedicated_vpc');
  const [slaLevel, setSlaLevel] = useState('24_7_dedicated');

  const calculateEstimate = () => {
    let base = 12000;
    if (modelType === 'llm_fine_tuning') base += 8500;
    if (modelType === 'regtech_audit') base += 6000;
    if (modelType === 'enterprise_multimodal') base += 14000;

    if (computeTier === 'on_premise') base += 11000;
    if (computeTier === 'air_gapped') base += 18000;

    if (slaLevel === 'four_nine') base += 5000;
    return base;
  };

  const filteredServices = (services || []).filter((s) => {
    if (activeCategory === 'all') return true;
    return s.category === activeCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold font-mono uppercase">
          <Zap className="w-3.5 h-3.5" />
          <span>Services & Engineering</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white dark:text-white light:text-slate-950 tracking-tight">
          Enterprise Autonomous Solutions
        </h1>
        <p className="text-sm sm:text-base text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">
          From custom model pre-training and distillation to autonomous multi-agent state machines, we construct compliant AI pipelines customized to your data architecture.
        </p>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {[
            { id: 'all', label: 'All Services' },
            { id: 'ai_dev', label: 'Autonomous Agents' },
            { id: 'fine_tuning', label: 'Model Distillation' },
            { id: 'regtech', label: 'Compliance & Audit' },
            { id: 'infrastructure', label: 'VPC & Cloud' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100 text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Services List */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredServices.map((service) => {
          const isSelected = selectedId === service.id;
          return (
            <div
              key={service.id}
              id={`service-${service.id}`}
              className={`p-8 rounded-3xl bg-slate-900/60 dark:bg-slate-900/60 light:bg-white border transition-all space-y-6 flex flex-col justify-between shadow-sm ${
                isSelected
                  ? 'border-cyan-500 ring-2 ring-cyan-500/30'
                  : 'border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                    {service.category}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white dark:text-white light:text-slate-950">
                  <AutoTranslate text={service.title} />
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 dark:text-slate-300 light:text-slate-600 leading-relaxed">
                  <AutoTranslate text={service.fullDescription || service.shortDescription} />
                </p>

                {/* Features Checklist */}
                {service.features && service.features.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
                      Technical Capabilities:
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300 dark:text-slate-300 light:text-slate-700">
                      {service.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span><AutoTranslate text={feat} /></span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-100 flex items-center justify-between">
                <button
                  onClick={onOpenDemo}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Request Scope Review</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono text-slate-500">Tier 1 SLA Included</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Interactive Architecture & Cost Estimator */}
      <section className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs font-bold font-mono mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Engineering Configurator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Estimate Your Deployment Footprint
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure target model architectures, compute boundaries, and compliance tiers to generate an immediate implementation baseline.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <label className="font-bold text-slate-300">Solution Objective</label>
              <select
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="agent_orchestration">Autonomous Multi-Agent Cluster</option>
                <option value="llm_fine_tuning">Private LLM Fine-Tuning (LoRA/Weights)</option>
                <option value="regtech_audit">RegTech & SOC-2 Guardrail Layer</option>
                <option value="enterprise_multimodal">Multimodal Intelligent Document Suite</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-slate-300">Compute & Network Isolation</label>
              <select
                value={computeTier}
                onChange={(e) => setComputeTier(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="dedicated_vpc">Dedicated VPC Peering (AWS/GCP/Azure)</option>
                <option value="on_premise">On-Premise Hybrid Kubernetes (Bare Metal)</option>
                <option value="air_gapped">Air-Gapped Sovereign Hardware Facility</option>
              </select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="font-bold text-slate-300">Target Availability & SLA</label>
              <select
                value={slaLevel}
                onChange={(e) => setSlaLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="24_7_dedicated">24/7 Dedicated Architectural Support (99.9% Uptime)</option>
                <option value="four_nine">Mission-Critical Tier 1 (99.99% Uptime SLA + 15m Response)</option>
              </select>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                Estimated Monthly Compute & Mgmt
              </div>
              <div className="text-3xl font-black text-white font-mono mt-1">
                ${calculateEstimate().toLocaleString()}
                <span className="text-xs text-slate-400 font-sans font-normal"> / mo</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                Includes dedicated GPU cluster reservations, continuous red-teaming, encrypted storage, and automated rollback checkpoints.
              </p>
            </div>

            <div className="pt-6">
              <button
                onClick={onOpenDemo}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-xs font-bold shadow-md shadow-cyan-500/20 hover:opacity-95 transition-opacity cursor-pointer"
              >
                Request Detailed Architecture PDF
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
