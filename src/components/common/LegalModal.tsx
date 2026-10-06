import React from 'react';
import { X, Shield, FileText } from 'lucide-react';
import { useCms } from '../../context/CmsContext';

interface LegalModalProps {
  type: 'privacy' | 'terms';
  isOpen: boolean;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, isOpen, onClose }) => {
  const { cmsData } = useCms();
  const companyName = cmsData?.settings?.companyName || '9xen';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {type === 'privacy' ? <Shield className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {type === 'privacy' ? 'Data Privacy & SOC-2 Compliance Policy' : 'Terms of Service & Enterprise SLA'}
              </h2>
              <p className="text-xs text-slate-400">Effective Date: January 1, 2026 • Version 3.4.1</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed pr-2">
          {type === 'privacy' ? (
            <>
              <h3 className="text-base font-bold text-white">1. Commitment to Data Sovereignty</h3>
              <p>
                At {companyName}, we hold that enterprise models and proprietary data belong exclusively to the client. Under no circumstances are client-supplied training datasets, fine-tuning artifacts, or inference prompts ingested into public foundation models or shared across multi-tenant boundaries.
              </p>

              <h3 className="text-base font-bold text-white">2. SOC-2 Type II & Zero-Retention Inference</h3>
              <p>
                Our infrastructure guarantees zero-retention logging options for enterprise and regulated sector deployments (Healthcare, Financial Services, Defense). All transient inference memory is wiped immediately following the delivery of completion tokens.
              </p>

              <h3 className="text-base font-bold text-white">3. Cryptographic Storage & Encryption</h3>
              <p>
                All data in transit is protected via TLS 1.3 with forward secrecy. Data at rest is encrypted utilizing client-managed or dedicated KMS keys (AES-256-GCM). Isolated VPC deployments offer total network encapsulation.
              </p>

              <h3 className="text-base font-bold text-white">4. GDPR, HIPAA, and CCPA Compliance</h3>
              <p>
                We provide standardized Data Processing Addendums (DPAs), Standard Contractual Clauses (SCCs), and Business Associate Agreements (BAAs) for organizations subject to HIPAA and GDPR regulations.
              </p>

              <h3 className="text-base font-bold text-white">5. Independent Auditing</h3>
              <p>
                Our systems undergo bi-annual third-party penetration testing and continuous vulnerability scanning. Audited SOC-2 Type II reports and ISO/IEC 27001 certifications are available upon request under mutual NDA.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-base font-bold text-white">1. Master Services Agreement & SLA</h3>
              <p>
                These Terms of Service govern all enterprise licenses, model deployments, and autonomous workflow nodes managed by {companyName}. We provide a guaranteed 99.95% uptime SLA for dedicated compute clusters and model endpoint gateways.
              </p>

              <h3 className="text-base font-bold text-white">2. Intellectual Property Rights</h3>
              <p>
                Clients retain 100% ownership of all fine-tuned model checkpoint weights, distilled adapters (LoRA/QLoRA), embeddings, and generated completions produced through their dedicated environments.
              </p>

              <h3 className="text-base font-bold text-white">3. Acceptable Use Policy</h3>
              <p>
                Customers agree not to utilize {companyName} systems for unlawful surveillance, unauthorized penetration testing of third-party networks, or development of autonomous harmful kinetic systems.
              </p>

              <h3 className="text-base font-bold text-white">4. Compute Credits & Resource Governance</h3>
              <p>
                Enterprise compute allocations are monitored in real time. Dynamic auto-scaling guardrails ensure workloads remain within pre-approved resource quotas without unexpected latency bottlenecks.
              </p>

              <h3 className="text-base font-bold text-white">5. Governing Law</h3>
              <p>
                These Terms shall be interpreted and enforced under the laws of the State of California, United States, without regard to conflict of law principles.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            I Understand & Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
