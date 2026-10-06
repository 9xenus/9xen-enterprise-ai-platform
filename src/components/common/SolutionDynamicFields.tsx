import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Cpu,
  ShieldAlert,
  Code2,
  Database,
  Sliders,
  Sparkles,
  Server,
  Key,
  Layers,
  Activity,
  CheckCircle,
  Bot,
  ShieldCheck,
  Building2,
  ShoppingCart,
  Briefcase,
  FileCheck,
  Lock,
} from 'lucide-react';

export type SolutionCategory =
  | 'agent'
  | 'regtech'
  | 'security'
  | 'llm_dev'
  | 'ecommerce'
  | 'realestate'
  | 'finance'
  | 'trading'
  | 'customDev'
  | 'general';

export function getSolutionCategory(solutionName: string): SolutionCategory {
  const lower = (solutionName || '').toLowerCase();

  // 1. Agentic Core & Autonomous Workflows
  if (
    lower.includes('agentic core') ||
    lower.includes('nexus') ||
    lower.includes('autonomous agent') ||
    lower.includes('multi-agent') ||
    lower.includes('workflow agent')
  ) {
    return 'agent';
  }

  // 2. RegTech & Compliance
  if (
    lower.includes('reguletter') ||
    lower.includes('regtech') ||
    lower.includes('regulatory') ||
    lower.includes('compliance') ||
    lower.includes('audit') ||
    lower.includes('sec') ||
    lower.includes('finra')
  ) {
    return 'regtech';
  }

  // 3. AI Security & Gateway
  if (
    lower.includes('gateway') ||
    lower.includes('guardrail') ||
    lower.includes('firewall') ||
    lower.includes('prompt injection') ||
    lower.includes('security proxy') ||
    lower.includes('red-team')
  ) {
    return 'security';
  }

  // 4. Custom LLM Dev, Dataset Curation & Synthia
  if (
    lower.includes('synthia') ||
    lower.includes('custom llm') ||
    lower.includes('data training') ||
    lower.includes('fine-tuning') ||
    lower.includes('dataset') ||
    lower.includes('sovereign vpc') ||
    lower.includes('air-gapped')
  ) {
    return 'llm_dev';
  }

  // 5. E-commerce AI & Retail Intelligence
  if (
    lower.includes('e-commerce') ||
    lower.includes('ecommerce') ||
    lower.includes('retail') ||
    lower.includes('recommendation') ||
    lower.includes('catalog') ||
    lower.includes('dynamic pricing')
  ) {
    return 'ecommerce';
  }

  // 6. Real Estate AI Chatbot
  if (
    lower.includes('real estate') ||
    lower.includes('property') ||
    lower.includes('mls') ||
    lower.includes('brokerage')
  ) {
    return 'realestate';
  }

  // 7. Banking & Finance AI
  if (
    lower.includes('banking') ||
    lower.includes('insurance') ||
    lower.includes('underwriting') ||
    lower.includes('fraud detection') ||
    lower.includes('credit scoring')
  ) {
    return 'finance';
  }

  // 8. Quant Trading & Algo Bot
  if (
    lower.includes('trading') ||
    lower.includes('quant') ||
    lower.includes('alphabot') ||
    lower.includes('mt5') ||
    lower.includes('forex') ||
    lower.includes('crypto') ||
    lower.includes('prop') ||
    lower.includes('bot') ||
    lower.includes('arbitrage')
  ) {
    return 'trading';
  }

  // 9. Custom Dev
  if (
    lower.includes('custom') ||
    lower.includes('saas') ||
    lower.includes('development') ||
    lower.includes('engineering') ||
    lower.includes('software')
  ) {
    return 'customDev';
  }

  return 'general';
}

export interface SolutionDynamicFieldsProps {
  selectedSolution: string;
  onChange: (fieldValues: Record<string, string>) => void;
  accentColor?: 'cyan' | 'amber' | 'emerald' | 'violet';
}

export const SolutionDynamicFields: React.FC<SolutionDynamicFieldsProps> = ({
  selectedSolution,
  onChange,
  accentColor = 'cyan',
}) => {
  const category = getSolutionCategory(selectedSolution);

  // 1. Agentic Core state
  const [agentDeployment, setAgentDeployment] = useState('AWS / GCP Private VPC (Isolated K8s Cluster)');
  const [agentIntegrations, setAgentIntegrations] = useState('CRM (Salesforce/HubSpot) + Slack/Teams + SQL DB');
  const [agentObjective, setAgentObjective] = useState('Autonomous Multi-Agent Workflow Automation');
  const [agentSecurityGate, setAgentSecurityGate] = useState('Cryptographic Human-in-the-Loop Approval & Role Gates');

  // 2. RegTech & Compliance state
  const [regJurisdiction, setRegJurisdiction] = useState('US & EU (SEC, FINRA, FCA, GDPR, EU AI Act)');
  const [regAuditScope, setRegAuditScope] = useState('Continuous Real-Time Policy & Ledger Auditing');
  const [regDocumentVolume, setRegDocumentVolume] = useState('10,000+ Internal Policies & Regulatory Rules');
  const [regReportType, setRegReportType] = useState('Automated Auditor-Ready Gap Analysis & Discrepancy Logs');

  // 3. AI Security & Gateway state
  const [secThroughput, setSecThroughput] = useState('100,000 Requests / Minute (< 12ms Latency)');
  const [secDlpRules, setSecDlpRules] = useState('Real-Time PII Masking, Secret Redaction & Token Quotas');
  const [secDefenseLevel, setSecDefenseLevel] = useState('Zero-Trust Prompt Injection & Jailbreak Firewall');

  // 4. Custom LLM & Synthia Dataset state
  const [llmDatasetScope, setLlmDatasetScope] = useState('Domain Fine-Tuning (LoRA / QLoRA) + RAG Embeddings');
  const [llmCompute, setLlmCompute] = useState('Dedicated NVIDIA H100 / B200 Sovereign GPU Cluster');
  const [llmPrivacy, setLlmPrivacy] = useState('Zero-Data Retention + Epsilon-Differential Privacy');
  const [llmTargetModel, setLlmTargetModel] = useState('Custom Foundation / Distilled Open-Weights (Llama/Gemini)');

  // 5. E-commerce AI state
  const [ecomCatalogSize, setEcomCatalogSize] = useState('50,000 - 500,000 SKUs');
  const [ecomFeatures, setEcomFeatures] = useState('Vector Semantic Search + Dynamic Pricing Engine');
  const [ecomPlatform, setEcomPlatform] = useState('Shopify Plus / Custom Headless / Magento');

  // 6. Real Estate AI Chatbot state
  const [reCrm, setReCrm] = useState('Salesforce / HubSpot / Follow Up Boss / Zillow MLS');
  const [reChannels, setReChannels] = useState('Web Widget + WhatsApp + SMS 24/7');
  const [reScope, setReScope] = useState('Automated Property Inquiries, Lead Pre-Qualification & Viewing Booking');

  // 7. Banking & Finance AI state
  const [finUseCases, setFinUseCases] = useState('Real-Time Fraud Anomaly Detection & Risk Modeling');
  const [finDataCompliance, setFinDataCompliance] = useState('SOC2 Type II + ISO 27001 + Bank Grade Zero-Trust');
  const [finLatency, setFinLatency] = useState('Sub-50ms Transaction Scoring');

  // 8. Quant Trading & Algo Bot state
  const [tradingPlatform, setTradingPlatform] = useState('MetaTrader 5 (MT5) & FIX Protocol 4.4');
  const [tradingInstruments, setTradingInstruments] = useState('Forex Majors (EUR/USD, GBP/JPY) & Gold (XAU/USD)');
  const [tradingDrawdown, setTradingDrawdown] = useState('Strict 4% Max Daily Loss & Hard Equity Stop-Loss');
  const [tradingAccountType, setTradingAccountType] = useState('Prop Firm Challenge ($100k - $200k) / Hedge Fund');

  // 9. Custom Dev state
  const [devScope, setDevScope] = useState('Rapid 2-4 Week Production Sprint');
  const [devStack, setDevStack] = useState('React / TypeScript / Node.js / Python / DuckDB');
  const [devRequirements, setDevRequirements] = useState('Full-Stack Production Architecture + API Integrations');

  // 10. General state
  const [genDeployment, setGenDeployment] = useState('Cloud SaaS / Dedicated Hybrid Cluster');
  const [genSeats, setGenSeats] = useState('11-50 Enterprise Seats');
  const [genTimeline, setGenTimeline] = useState('Immediate (Within 48 hours)');

  // Notify parent on any state change
  useEffect(() => {
    let payload: Record<string, string> = {};

    switch (category) {
      case 'agent':
        payload = {
          'Deployment Environment': agentDeployment,
          'System Integrations': agentIntegrations,
          'Primary Automation Objective': agentObjective,
          'Security & Approval Gate': agentSecurityGate,
        };
        break;
      case 'regtech':
        payload = {
          'Target Jurisdictions': regJurisdiction,
          'Audit Scope & Frequency': regAuditScope,
          'Document & Policy Volume': regDocumentVolume,
          'Reporting Deliverable': regReportType,
        };
        break;
      case 'security':
        payload = {
          'Target Throughput & Latency': secThroughput,
          'DLP & Redaction Requirements': secDlpRules,
          'Firewall Defense Configuration': secDefenseLevel,
        };
        break;
      case 'llm_dev':
        payload = {
          'Fine-Tuning Scope': llmDatasetScope,
          'Compute Allocation': llmCompute,
          'Privacy & Data Isolation': llmPrivacy,
          'Base Architecture': llmTargetModel,
        };
        break;
      case 'ecommerce':
        payload = {
          'Catalog SKU Size': ecomCatalogSize,
          'Target AI Features': ecomFeatures,
          'E-Commerce Infrastructure': ecomPlatform,
        };
        break;
      case 'realestate':
        payload = {
          'CRM / MLS Integration': reCrm,
          'Deployment Channels': reChannels,
          'Automation Scope': reScope,
        };
        break;
      case 'finance':
        payload = {
          'Financial AI Scope': finUseCases,
          'Compliance Standard': finDataCompliance,
          'Scoring Latency SLA': finLatency,
        };
        break;
      case 'trading':
        payload = {
          'Trading Platform & Protocols': tradingPlatform,
          'Target Instruments': tradingInstruments,
          'Drawdown & Risk Limit': tradingDrawdown,
          'Execution & Account Type': tradingAccountType,
        };
        break;
      case 'customDev':
        payload = {
          'Delivery Sprint Scope': devScope,
          'Tech Stack': devStack,
          'System Architecture': devRequirements,
        };
        break;
      case 'general':
      default:
        payload = {
          'Deployment Mode': genDeployment,
          'Estimated User Scale': genSeats,
          'Implementation Target': genTimeline,
        };
        break;
    }

    onChange(payload);
  }, [
    category,
    agentDeployment,
    agentIntegrations,
    agentObjective,
    agentSecurityGate,
    regJurisdiction,
    regAuditScope,
    regDocumentVolume,
    regReportType,
    secThroughput,
    secDlpRules,
    secDefenseLevel,
    llmDatasetScope,
    llmCompute,
    llmPrivacy,
    llmTargetModel,
    ecomCatalogSize,
    ecomFeatures,
    ecomPlatform,
    reCrm,
    reChannels,
    reScope,
    finUseCases,
    finDataCompliance,
    finLatency,
    tradingPlatform,
    tradingInstruments,
    tradingDrawdown,
    tradingAccountType,
    devScope,
    devStack,
    devRequirements,
    genDeployment,
    genSeats,
    genTimeline,
  ]);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-4 shadow-inner">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center space-x-2">
          {category === 'agent' && <Bot className="w-4 h-4 text-cyan-400" />}
          {category === 'regtech' && <FileCheck className="w-4 h-4 text-emerald-400" />}
          {category === 'security' && <ShieldAlert className="w-4 h-4 text-rose-400" />}
          {category === 'llm_dev' && <Cpu className="w-4 h-4 text-violet-400" />}
          {category === 'ecommerce' && <ShoppingCart className="w-4 h-4 text-amber-400" />}
          {category === 'realestate' && <Building2 className="w-4 h-4 text-teal-400" />}
          {category === 'finance' && <Briefcase className="w-4 h-4 text-blue-400" />}
          {category === 'trading' && <TrendingUp className="w-4 h-4 text-cyan-400" />}
          {category === 'customDev' && <Code2 className="w-4 h-4 text-indigo-400" />}
          {category === 'general' && <Layers className="w-4 h-4 text-slate-400" />}

          <span className="font-bold text-white uppercase tracking-wider text-[11px]">
            Target Specifications: {selectedSolution}
          </span>
        </div>
        <span className="text-[10px] text-cyan-400 font-mono font-semibold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
          Auto-Calibrated
        </span>
      </div>

      {/* 1. AGENTIC CORE */}
      {category === 'agent' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-slate-400 font-medium mb-1 block">Deployment Environment</label>
            <select
              value={agentDeployment}
              onChange={(e) => setAgentDeployment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            >
              <option value="AWS / GCP Private VPC (Isolated K8s Cluster)">AWS / GCP Private VPC (Isolated K8s)</option>
              <option value="On-Premise Air-Gapped Kubernetes">On-Premise Air-Gapped Kubernetes</option>
              <option value="9xen Managed Dedicated Cloud Node">9xen Managed Dedicated Cloud Node</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-medium mb-1 block">Primary System Integrations</label>
            <input
              type="text"
              value={agentIntegrations}
              onChange={(e) => setAgentIntegrations(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium mb-1 block">Automation Objective</label>
            <input
              type="text"
              value={agentObjective}
              onChange={(e) => setAgentObjective(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium mb-1 block">Governance & Security Gate</label>
            <select
              value={agentSecurityGate}
              onChange={(e) => setAgentSecurityGate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            >
              <option value="Cryptographic Human-in-the-Loop Approval & Role Gates">Human-in-the-Loop Approval Gates</option>
              <option value="Fully Autonomous Execution with Real-Time Telemetry Audit">Autonomous with Telemetry Audit</option>
              <option value="Two-Person Rule / Multi-Sig Authorization">Two-Person Rule Authorization</option>
            </select>
          </div>
        </div>
      )}

      {/* 2. REGTECH & COMPLIANCE */}
      {category === 'regtech' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-slate-400 font-medium mb-1 block">Target Regulatory Frameworks</label>
            <input
              type="text"
              value={regJurisdiction}
              onChange={(e) => setRegJurisdiction(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium mb-1 block">Audit Scope & Frequency</label>
            <select
              value={regAuditScope}
              onChange={(e) => setRegAuditScope(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            >
              <option value="Continuous Real-Time Policy & Ledger Auditing">Continuous Real-Time Auditing</option>
              <option value="Weekly / Monthly Automated Compliance Digest">Weekly / Monthly Digest</option>
              <option value="Pre-Exam Regulatory Audit Readiness Sprint">Pre-Exam Readiness Sprint</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-medium mb-1 block">Document & Policy Volume</label>
            <input
              type="text"
              value={regDocumentVolume}
              onChange={(e) => setRegDocumentVolume(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium mb-1 block">Primary Deliverable</label>
            <input
              type="text"
              value={regReportType}
              onChange={(e) => setRegReportType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            />
          </div>
        </div>
      )}

      {/* 3. AI SECURITY & GATEWAY */}
      {category === 'security' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-slate-400 font-medium mb-1 block">Target Throughput & Latency SLA</label>
            <input
              type="text"
              value={secThroughput}
              onChange={(e) => setSecThroughput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium mb-1 block">DLP & Redaction Rules</label>
            <input
              type="text"
              value={secDlpRules}
              onChange={(e) => setSecDlpRules(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-slate-400 font-medium mb-1 block">Firewall & Guardrail Configuration</label>
            <select
              value={secDefenseLevel}
              onChange={(e) => setSecDefenseLevel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            >
              <option value="Zero-Trust Prompt Injection & Jailbreak Firewall">Zero-Trust Prompt Injection & Jailbreak Firewall</option>
              <option value="Multi-LLM Cost Routing & Token Quota Enforcement">Multi-LLM Cost Routing & Token Quotas</option>
              <option value="Full Enterprise Telemetry, Audit Logging & PII Masking">Full Enterprise Telemetry, Logging & Masking</option>
            </select>
          </div>
        </div>
      )}

      {/* 4. CUSTOM LLM & SYNTHIA DATASET */}
      {category === 'llm_dev' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-slate-400 font-medium mb-1 block">Fine-Tuning Scope & Methodology</label>
            <select
              value={llmDatasetScope}
              onChange={(e) => setLlmDatasetScope(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            >
              <option value="Domain Fine-Tuning (LoRA / QLoRA) + RAG Embeddings">LoRA / QLoRA + RAG Embeddings</option>
              <option value="Synthia Synthetic Dataset Curation & RLHF">Synthia Synthetic Dataset Curation & RLHF</option>
              <option value="Full Model Pre-training / Continual Pre-training">Full Model Continual Pre-training</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-medium mb-1 block">Compute Cluster Allocation</label>
            <select
              value={llmCompute}
              onChange={(e) => setLlmCompute(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            >
              <option value="Dedicated NVIDIA H100 / B200 Sovereign GPU Cluster">Dedicated NVIDIA H100 / B200 Cluster</option>
              <option value="Private Cloud On-Demand (AWS Trainium / GCP TPU)">On-Demand Cloud Cluster</option>
              <option value="Customer-Owned On-Premise GPU Infrastructure">Customer On-Premise GPU Infra</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-medium mb-1 block">Data Isolation & Governance</label>
            <input
              type="text"
              value={llmPrivacy}
              onChange={(e) => setLlmPrivacy(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium mb-1 block">Base Model Architecture</label>
            <input
              type="text"
              value={llmTargetModel}
              onChange={(e) => setLlmTargetModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            />
          </div>
        </div>
      )}

      {/* 5. E-COMMERCE AI */}
      {category === 'ecommerce' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-slate-400 font-medium mb-1 block">Product Catalog SKU Size</label>
            <select
              value={ecomCatalogSize}
              onChange={(e) => setEcomCatalogSize(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            >
              <option value="10,000 - 50,000 SKUs">10,000 - 50,000 SKUs</option>
              <option value="50,000 - 500,000 SKUs">50,000 - 500,000 SKUs</option>
              <option value="1M+ Enterprise Global Catalog">1M+ Enterprise Global Catalog</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-medium mb-1 block">Core AI Capabilities</label>
            <input
              type="text"
              value={ecomFeatures}
              onChange={(e) => setEcomFeatures(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-slate-400 font-medium mb-1 block">E-commerce Tech Stack / Platform</label>
            <input
              type="text"
              value={ecomPlatform}
              onChange={(e) => setEcomPlatform(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            />
          </div>
        </div>
      )}

      {/* 6. REAL ESTATE AI CHATBOT */}
      {category === 'realestate' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-slate-400 font-medium mb-1 block">CRM / MLS Provider</label>
            <input
              type="text"
              value={reCrm}
              onChange={(e) => setReCrm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium mb-1 block">Deployment Channels</label>
            <select
              value={reChannels}
              onChange={(e) => setReChannels(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            >
              <option value="Web Widget + WhatsApp + SMS 24/7">Web Widget + WhatsApp + SMS 24/7</option>
              <option value="Web Widget Only">Web Widget Only</option>
              <option value="Multi-Channel Omnichannel Integration">Omnichannel Integration</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-slate-400 font-medium mb-1 block">Automated Lead Workflow Scope</label>
            <input
              type="text"
              value={reScope}
              onChange={(e) => setReScope(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            />
          </div>
        </div>
      )}

      {/* 7. BANKING & FINANCE AI */}
      {category === 'finance' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-slate-400 font-medium mb-1 block">Financial AI Use Case</label>
            <input
              type="text"
              value={finUseCases}
              onChange={(e) => setFinUseCases(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium mb-1 block">Compliance & Security Level</label>
            <input
              type="text"
              value={finDataCompliance}
              onChange={(e) => setFinDataCompliance(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-slate-400 font-medium mb-1 block">Latency / SLA Requirement</label>
            <input
              type="text"
              value={finLatency}
              onChange={(e) => setFinLatency(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            />
          </div>
        </div>
      )}

      {/* 8. QUANT TRADING & ALGO BOT */}
      {category === 'trading' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-slate-400 font-medium mb-1 block">Execution Platform / Protocol</label>
            <select
              value={tradingPlatform}
              onChange={(e) => setTradingPlatform(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            >
              <option value="MetaTrader 5 (MT5) & FIX Protocol 4.4">MetaTrader 5 (MT5) & FIX Protocol 4.4</option>
              <option value="Binance & Bybit Futures Websocket API">Binance & Bybit Futures API</option>
              <option value="LMAX Institutional Prime Broker Bridge">LMAX Prime Broker Bridge</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-medium mb-1 block">Target Instruments</label>
            <input
              type="text"
              value={tradingInstruments}
              onChange={(e) => setTradingInstruments(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium mb-1 block">Drawdown & Risk Hard Limits</label>
            <select
              value={tradingDrawdown}
              onChange={(e) => setTradingDrawdown(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            >
              <option value="Strict 4% Max Daily Loss & Hard Equity Stop-Loss">Strict 4% Max Daily Drawdown</option>
              <option value="Custom Quant Fund Risk Parameters">Custom Quant Fund Risk Parameters</option>
              <option value="Zero-Slippage HFT Liquidity Arbitrage">Zero-Slippage Arbitrage</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-medium mb-1 block">Account & Execution Type</label>
            <select
              value={tradingAccountType}
              onChange={(e) => setTradingAccountType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            >
              <option value="Prop Firm Challenge ($100k - $200k) / Hedge Fund">Prop Firm Evaluation ($100k - $200k)</option>
              <option value="Institutional AUM Management ($1M - $25M+)">Institutional AUM ($1M - $25M+)</option>
              <option value="Multi-Account Manager (MAM/PAMM) Mirroring">MAM/PAMM 500+ Account Mirroring</option>
            </select>
          </div>
        </div>
      )}

      {/* 9. CUSTOM DEV */}
      {category === 'customDev' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-slate-400 font-medium mb-1 block">Delivery Sprint Scope</label>
            <select
              value={devScope}
              onChange={(e) => setDevScope(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            >
              <option value="Rapid 2-4 Week Production Sprint">Rapid 2-4 Week Production Sprint</option>
              <option value="Comprehensive Enterprise MVP Build">Comprehensive Enterprise MVP</option>
              <option value="Long-term Dedicated Engineering Team">Dedicated Engineering Pod</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-medium mb-1 block">Target Tech Stack</label>
            <input
              type="text"
              value={devStack}
              onChange={(e) => setDevStack(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-slate-400 font-medium mb-1 block">Architecture Requirements</label>
            <input
              type="text"
              value={devRequirements}
              onChange={(e) => setDevRequirements(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            />
          </div>
        </div>
      )}

      {/* 10. GENERAL */}
      {category === 'general' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-slate-400 font-medium mb-1 block">Deployment Model</label>
            <select
              value={genDeployment}
              onChange={(e) => setGenDeployment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            >
              <option value="Cloud SaaS / Dedicated Hybrid Cluster">Cloud SaaS / Dedicated Hybrid Cluster</option>
              <option value="Self-Hosted Air-Gapped Private VPC">Self-Hosted Private VPC</option>
              <option value="Custom Enterprise Integration">Custom Enterprise Integration</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-medium mb-1 block">Estimated User Scale</label>
            <select
              value={genSeats}
              onChange={(e) => setGenSeats(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-cyan-500"
            >
              <option value="1-10 Seats (Pilot Team)">1-10 Seats (Pilot Team)</option>
              <option value="11-50 Enterprise Seats">11-50 Enterprise Seats</option>
              <option value="50+ Global Enterprise Deployment">50+ Global Enterprise</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
