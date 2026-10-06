import React from 'react';
import { useCms } from '../../context/CmsContext';
import { AutoTranslate } from '../common/AutoTranslate';
import {
  Database,
  Lock,
  Cpu,
  Shield,
  Layers,
  Network,
  Zap,
  CheckCircle2,
  FileCheck,
  Server,
  ArrowRight,
} from 'lucide-react';

interface Props {
  onOpenDemo: () => void;
  selectedId?: string;
}

export const PlatformsView: React.FC<Props> = ({ onOpenDemo, selectedId }) => {
  const { cmsData } = useCms();
  const { platforms } = cmsData;

  const securityHighlights = [
    {
      title: 'Dedicated VPC Peering',
      desc: 'Connect your cloud subnets via AWS PrivateLink or GCP VPC Peering. Zero public internet exposure.',
      icon: <Network className="w-5 h-5 text-cyan-400" />,
    },
    {
      title: 'Zero-Retention Inference',
      desc: 'Session context is wiped immediately after token delivery. Never retained or logged without consent.',
      icon: <Lock className="w-5 h-5 text-violet-400" />,
    },
    {
      title: 'DuckDB In-Memory OLAP Engine',
      desc: 'High-speed column-store analytics embedded locally for real-time telemetry and auditing at scale.',
      icon: <Database className="w-5 h-5 text-emerald-400" />,
    },
    {
      title: 'SOC-2 Type II Certified',
      desc: 'Independent third-party verification of security, availability, confidentiality, and privacy controls.',
      icon: <Shield className="w-5 h-5 text-amber-400" />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold font-mono uppercase">
          <Database className="w-3.5 h-3.5" />
          <span>Architecture & Infrastructure</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white dark:text-white light:text-slate-950 tracking-tight">
          Enterprise Security & Computational Engine
        </h1>
        <p className="text-sm sm:text-base text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">
          Deep-dive into 9xen's multi-tenant isolation, DuckDB high-performance analytics core, and cryptographic perimeter protections.
        </p>
      </section>

      {/* Security Architecture Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {securityHighlights.map((item, i) => (
          <div
            key={i}
            className="p-6 rounded-3xl bg-slate-900/60 dark:bg-slate-900/60 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-sm space-y-3"
          >
            <div className="p-3 rounded-2xl bg-slate-950 dark:bg-slate-950 light:bg-slate-50 w-fit border border-slate-800 dark:border-slate-800 light:border-slate-200">
              {item.icon}
            </div>
            <h3 className="text-base font-bold text-white dark:text-white light:text-slate-950">
              {item.title}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </section>

      {/* Platform Items */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white dark:text-white light:text-slate-950">
            Deployment Configurations
          </h2>
          <p className="text-xs text-slate-400 mt-1">Specifications for sovereign cloud and hybrid clusters</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(platforms || []).map((plat) => (
            <div
              key={plat.id}
              id={`platform-${plat.id}`}
              className="p-6 rounded-3xl bg-slate-900/60 dark:bg-slate-900/60 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 flex flex-col justify-between shadow-sm hover:border-cyan-500/40 transition-all"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-cyan-400">
                    {plat.category}
                  </span>
                  <h3 className="text-xl font-bold text-white dark:text-white light:text-slate-950">
                    <AutoTranslate text={plat.name} />
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1">
                    <AutoTranslate text={plat.tagline} />
                  </p>
                </div>

                <p className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-600 leading-relaxed">
                  <AutoTranslate text={plat.description} />
                </p>

                {plat.keyFeatures && plat.keyFeatures.length > 0 && (
                  <ul className="space-y-1.5 text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 pt-2">
                    {plat.keyFeatures.map((kf, kfIdx) => (
                      <li key={kfIdx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span><AutoTranslate text={kf} /></span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-100 flex items-center justify-between">
                <button
                  onClick={onOpenDemo}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Request Cluster Spec</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Compliance Matrix */}
      <section className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono mb-2">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Audited Governance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Enterprise Compliance Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Continuous automated telemetry safeguards compliance across international regulatory jurisdictions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-white flex items-center justify-between">
              <span>SOC-2 Type II</span>
              <span className="text-emerald-400 text-[10px] uppercase">Verified</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Annual AICPA Trust Services Criteria audit for security, availability, and confidentiality.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-white flex items-center justify-between">
              <span>HIPAA BAA Ready</span>
              <span className="text-emerald-400 text-[10px] uppercase">Compliant</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Encrypted PHI handling with dedicated BAA agreements for clinical health systems.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-white flex items-center justify-between">
              <span>GDPR / CCPA</span>
              <span className="text-emerald-400 text-[10px] uppercase">Enforced</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Right to erasure, data residency guarantees across EU and US data centers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
