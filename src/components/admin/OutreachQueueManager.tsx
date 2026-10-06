import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { OutreachLead } from '../../types/cms';
import {
  Send,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Archive,
  Mail,
  DollarSign,
  Copy,
  Check,
  RefreshCw,
  Plus,
  FileText,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Zap,
  Info,
  Tag,
  Target,
  Bot,
  ListFilter,
  ShieldCheck,
  CheckSquare,
  Flame,
  Activity,
  HeartPulse,
  Compass
} from 'lucide-react';

interface Props {
  onSwitchToFunnel?: () => void;
}

export const OutreachQueueManager: React.FC<Props> = ({ onSwitchToFunnel }) => {
  const {
    cmsData,
    approveAndSendOutreach,
    regenerateLeadDraft,
    classifySingleLead,
    batchClassifyLeads,
    analyzeSingleLeadSentiment,
    batchAnalyzeLeadSentiment,
    deleteOutreachLead,
  } = useCms();

  const queue = cmsData.outreachQueue || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [intentFilter, setIntentFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(queue[0]?.id || null);

  // Edit state per lead
  const [draftSubjects, setDraftSubjects] = useState<Record<string, string>>({});
  const [draftBodies, setDraftBodies] = useState<Record<string, string>>({});
  const [customPrompts, setCustomPrompts] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [isClassifying, setIsClassifying] = useState<Record<string, boolean>>({});
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState<Record<string, boolean>>({});
  const [isBatchClassifying, setIsBatchClassifying] = useState(false);
  const [isBatchAnalyzingSentiment, setIsBatchAnalyzingSentiment] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // New simulated lead modal/form
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simName, setSimName] = useState('');
  const [simEmail, setSimEmail] = useState('');
  const [simCompany, setSimCompany] = useState('');
  const [simSolution, setSimSolution] = useState('Quant Trading Bot for Hedge Fund');
  const [simMessage, setSimMessage] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4500);
  };

  const filteredQueue = queue.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.solutionOfInterest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.userMessage || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.sentiment?.tone || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || lead.status.toLowerCase().replace(/\s+/g, '_') === statusFilter;

    const matchesIntent =
      intentFilter === 'all' || lead.intentScore.toLowerCase() === intentFilter;

    const tag = (lead.classificationTag || (lead.intentScore === 'Medium' ? 'Informational' : 'High Intent')).toLowerCase();
    const matchesTag =
      tagFilter === 'all' ||
      (tagFilter === 'high_intent' && tag === 'high intent') ||
      (tagFilter === 'informational' && tag === 'informational');

    const leadPolarity = (lead.sentiment?.polarity || 'neutral').toLowerCase();
    const matchesSentiment =
      sentimentFilter === 'all' || leadPolarity === sentimentFilter.toLowerCase();

    const leadPriority = lead.sentiment?.priorityLevel || (lead.intentScore === 'Critical' ? 'P1 - Immediate' : lead.intentScore === 'High' ? 'P2 - High' : 'P3 - Standard');
    const matchesPriority =
      priorityFilter === 'all' ||
      (priorityFilter === 'p1' && leadPriority.startsWith('P1')) ||
      (priorityFilter === 'p2' && leadPriority.startsWith('P2')) ||
      (priorityFilter === 'p3' && leadPriority.startsWith('P3'));

    return matchesSearch && matchesStatus && matchesIntent && matchesTag && matchesSentiment && matchesPriority;
  });

  const pendingCount = queue.filter((l) => l.status === 'Pending Review').length;
  const approvedCount = queue.filter((l) => l.status === 'Approved & Sent').length;
  const p1UrgentCount = queue.filter(
    (l) => (l.sentiment?.priorityLevel?.startsWith('P1') || l.intentScore === 'Critical')
  ).length;
  const highIntentCount = queue.filter(
    (l) => (l.classificationTag || (l.intentScore === 'Medium' ? 'Informational' : 'High Intent')) === 'High Intent'
  ).length;

  const handleRunBatchClassification = async () => {
    setIsBatchClassifying(true);
    showToast('⚡ Running Gemini Lead Classification Engine on all leads...');
    const success = await batchClassifyLeads();
    setIsBatchClassifying(false);
    if (success) {
      showToast('✨ Gemini Classification Engine successfully updated all leads!');
    } else {
      showToast('❌ Failed running batch Gemini classification.');
    }
  };

  const handleRunBatchSentiment = async () => {
    setIsBatchAnalyzingSentiment(true);
    showToast('🎭 Analyzing real-time sentiment & emotional tones for all leads...');
    const success = await batchAnalyzeLeadSentiment();
    setIsBatchAnalyzingSentiment(false);
    if (success) {
      showToast('✨ Successfully extracted emotional tones & response priorities for all leads!');
    } else {
      showToast('❌ Failed running batch sentiment analysis.');
    }
  };

  const handleSingleClassify = async (lead: OutreachLead) => {
    setIsClassifying((prev) => ({ ...prev, [lead.id]: true }));
    const success = await classifySingleLead(lead);
    setIsClassifying((prev) => ({ ...prev, [lead.id]: false }));
    if (success) {
      showToast(`⚡ Lead ${lead.name} re-classified with Gemini!`);
    } else {
      showToast(`❌ Lead classification failed.`);
    }
  };

  const handleSingleSentimentAnalyze = async (lead: OutreachLead) => {
    setIsAnalyzingSentiment((prev) => ({ ...prev, [lead.id]: true }));
    const sentiment = await analyzeSingleLeadSentiment(lead);
    setIsAnalyzingSentiment((prev) => ({ ...prev, [lead.id]: false }));
    if (sentiment) {
      showToast(`🎭 Sentiment evaluated: "${sentiment.tone}" (${sentiment.priorityLevel})`);
    } else {
      showToast(`❌ Sentiment analysis failed.`);
    }
  };

  const templates = cmsData.outreachTemplates || [];
  const [selectedTemplates, setSelectedTemplates] = useState<Record<string, string>>({});

  const handleRegenerate = async (lead: OutreachLead) => {
    setIsGenerating((prev) => ({ ...prev, [lead.id]: true }));
    const customInstruction = customPrompts[lead.id] || '';
    const templateId = selectedTemplates[lead.id];
    const result = await regenerateLeadDraft(lead, customInstruction, templateId);
    setIsGenerating((prev) => ({ ...prev, [lead.id]: false }));

    if (result) {
      setDraftSubjects((prev) => ({ ...prev, [lead.id]: result.subject }));
      setDraftBodies((prev) => ({ ...prev, [lead.id]: result.body }));
      showToast(`✨ Gemini regenerated draft response using template "${result.templateUsed || 'Default'}"`);
    } else {
      showToast(`❌ Failed to regenerate draft with Gemini.`);
    }
  };

  const handleApproveAndSend = async (lead: OutreachLead) => {
    const subject = draftSubjects[lead.id] || lead.suggestedSubject;
    const body = draftBodies[lead.id] || lead.suggestedDraftResponse;

    const success = await approveAndSendOutreach(lead.id, subject, body);
    if (success) {
      showToast(`🚀 Outreach response approved and dispatched to ${lead.email}!`);
    }
  };

  const handleCopyDraft = (lead: OutreachLead) => {
    const subject = draftSubjects[lead.id] || lead.suggestedSubject;
    const body = draftBodies[lead.id] || lead.suggestedDraftResponse;
    const fullText = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setCopiedId(lead.id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('📋 Email subject and draft copied to clipboard!');
  };

  const handleSimulateNewLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName || !simEmail) return;

    setIsSimulating(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: simName,
          email: simEmail,
          company: simCompany || 'Enterprise Client',
          subject: simSolution,
          message: simMessage || `Inquiry regarding ${simSolution}.`,
        }),
      });

      if (res.ok) {
        showToast(`⚡ Lead sentiment evaluated & pushed to Outreach Queue!`);
        setShowSimulateModal(false);
        setSimName('');
        setSimEmail('');
        setSimCompany('');
        setSimMessage('');
      }
    } catch {
      showToast(`Failed to simulate lead submission.`);
    } finally {
      setIsSimulating(false);
    }
  };

  const fillHighIntentPreset = () => {
    setSimName('Vikram Malhotra');
    setSimEmail('v.malhotra@quantumcap.com');
    setSimCompany('Quantum Capital Hedge Fund');
    setSimSolution('Quant Trading Engine (AlphaBot Pro)');
    setSimMessage(
      'We manage a $20M AUM fund and need urgent sub-1.8ms FIX protocol connectivity by next week. Can we schedule an onboarding call immediately?'
    );
  };

  const fillSkepticalPreset = () => {
    setSimName('Dr. Richard Thornton');
    setSimEmail('r.thornton@novabiomed.com');
    setSimCompany('NovaBio Therapeutics');
    setSimSolution('AI Data Training & Sovereign VPC');
    setSimMessage(
      'We have severe HIPAA audit concerns regarding previous vendors. Before committing budget, we need verifiable proof of zero-data retention on an air-gapped node.'
    );
  };

  const fillInformationalPreset = () => {
    setSimName('Dr. Sarah Jenkins');
    setSimEmail('s.jenkins@mit.edu');
    setSimCompany('MIT Computer Science AI Lab');
    setSimSolution('General Architecture & Whitepaper');
    setSimMessage(
      'We are researching DuckDB analytical query benchmarks for a university academic paper. Where can we review documentation?'
    );
  };

  // Helper for polarity style
  const getPolarityBadge = (polarity?: string, tone?: string) => {
    switch (polarity) {
      case 'urgent':
        return {
          bg: 'bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-rose-300 border-rose-500/50',
          icon: <Flame className="w-3 h-3 text-rose-400 animate-pulse" />,
          label: tone || 'Urgent',
        };
      case 'positive':
        return {
          bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/50',
          icon: <HeartPulse className="w-3 h-3 text-emerald-400" />,
          label: tone || 'Enthusiastic',
        };
      case 'skeptical':
        return {
          bg: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/50',
          icon: <Activity className="w-3 h-3 text-amber-400" />,
          label: tone || 'Skeptical / Needs Proof',
        };
      case 'frustrated':
        return {
          bg: 'bg-gradient-to-r from-rose-500/30 to-red-500/20 text-rose-200 border-rose-500/60',
          icon: <Flame className="w-3 h-3 text-red-400" />,
          label: tone || 'Frustrated',
        };
      case 'neutral':
      default:
        return {
          bg: 'bg-gradient-to-r from-slate-700/40 to-slate-800/40 text-slate-300 border-slate-700',
          icon: <Compass className="w-3 h-3 text-slate-400" />,
          label: tone || 'Informational / Neutral',
        };
    }
  };

  // Helper for Priority Badge
  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    if (priority.startsWith('P1')) {
      return (
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
          <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
          <span>{priority}</span>
        </span>
      );
    }
    if (priority.startsWith('P2')) {
      return (
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>{priority}</span>
        </span>
      );
    }
    return (
      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
        <Clock className="w-3 h-3 text-slate-400" />
        <span>{priority}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-cyan-500/40 flex items-center space-x-3 text-sm animate-in fade-in slide-in-from-bottom-4">
          <Bot className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700/60 shadow-xl text-white">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/30 text-cyan-400 shadow-inner">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Real-Time Sentiment Analysis & Outreach Queue
                <span className="text-xs bg-cyan-500/20 text-cyan-300 font-semibold px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                  Gemini Emotional Tone Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates real-time conversational sentiment, highlights emotional tone (<strong className="text-rose-400">Urgent</strong>, <strong className="text-emerald-300">Enthusiastic</strong>, <strong className="text-amber-300">Skeptical</strong>), and prioritizes responses.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onSwitchToFunnel && (
            <button
              onClick={onSwitchToFunnel}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-500/40 shadow-lg transition-all hover:scale-102 cursor-pointer"
            >
              <Target className="w-4 h-4 text-cyan-400" />
              <span>Visual Funnel Pipeline</span>
            </button>
          )}

          <button
            onClick={handleRunBatchSentiment}
            disabled={isBatchAnalyzingSentiment}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/40 shadow-lg transition-all hover:scale-102 disabled:opacity-50"
          >
            <HeartPulse className={`w-4 h-4 text-amber-400 ${isBatchAnalyzingSentiment ? 'animate-pulse' : ''}`} />
            <span>{isBatchAnalyzingSentiment ? 'Analyzing Sentiments...' : 'Analyze Emotional Sentiments'}</span>
          </button>

          <button
            onClick={handleRunBatchClassification}
            disabled={isBatchClassifying}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-cyan-500/40 shadow-lg transition-all hover:scale-102 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${isBatchClassifying ? 'animate-spin' : ''}`} />
            <span>{isBatchClassifying ? 'Classifying Queue...' : 'Run Full Classification'}</span>
          </button>

          <button
            onClick={() => setShowSimulateModal(true)}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>Simulate Lead Entry</span>
          </button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/30">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{p1UrgentCount}</div>
              <div className="text-xs text-slate-400 font-medium">P1 Immediate Priority</div>
            </div>
          </div>
          <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-md border border-rose-500/30 font-bold">
            &lt; 15 min SLA
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{highIntentCount}</div>
              <div className="text-xs text-slate-400 font-medium">High Intent Leads</div>
            </div>
          </div>
          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-500/30">
            Commercial
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{pendingCount}</div>
              <div className="text-xs text-slate-400 font-medium">Pending Review</div>
            </div>
          </div>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30">
            Draft Ready
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{approvedCount}</div>
              <div className="text-xs text-slate-400 font-medium">Approved & Sent</div>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
            Closed
          </span>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col xl:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="relative w-full xl:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads, sentiment, signals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Sentiment Filter */}
          <div className="flex items-center space-x-2">
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-xs text-slate-400 font-medium">Sentiment:</span>
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500 font-medium"
            >
              <option value="all">All Emotional Tones</option>
              <option value="urgent">🔥 Urgent Only</option>
              <option value="positive">💚 Positive / Enthusiastic</option>
              <option value="skeptical">⚠️ Skeptical / Compliance</option>
              <option value="neutral">ℹ️ Neutral / Informational</option>
            </select>
          </div>

          {/* Priority Level Filter */}
          <div className="flex items-center space-x-2">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-slate-400 font-medium">Response Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Response Priorities</option>
              <option value="p1">P1 - Immediate (&lt;15m)</option>
              <option value="p2">P2 - High (&lt;2h)</option>
              <option value="p3">P3 - Standard (&lt;24h)</option>
            </select>
          </div>

          {/* Classification Tag Filter */}
          <div className="flex items-center space-x-2">
            <Tag className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs text-slate-400 font-medium">Classification:</span>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500 font-medium"
            >
              <option value="all">All Classification Tags</option>
              <option value="high_intent">⚡ High Intent</option>
              <option value="informational">ℹ️ Informational</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <ListFilter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved_&_sent">Approved & Sent</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lead Cards List */}
      <div className="space-y-4">
        {filteredQueue.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400">
            <Mail className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <h3 className="text-base font-semibold text-slate-200">No Matching Leads Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try resetting your sentiment or priority filter, or simulate a new lead inquiry.
            </p>
          </div>
        ) : (
          filteredQueue.map((lead) => {
            const isExpanded = expandedLeadId === lead.id;
            const currentSubject = draftSubjects[lead.id] ?? lead.suggestedSubject;
            const currentBody = draftBodies[lead.id] ?? lead.suggestedDraftResponse;

            const classificationTag =
              lead.classificationTag || (lead.intentScore === 'Medium' ? 'Informational' : 'High Intent');
            const isHighIntent = classificationTag === 'High Intent';

            const sentiment = lead.sentiment;
            const polarityBadge = getPolarityBadge(sentiment?.polarity, sentiment?.tone);
            const priorityLevel = sentiment?.priorityLevel || (lead.intentScore === 'Critical' ? 'P1 - Immediate' : lead.intentScore === 'High' ? 'P2 - High' : 'P3 - Standard');

            return (
              <div
                key={lead.id}
                className={`bg-slate-900/95 border transition-all rounded-2xl overflow-hidden shadow-lg ${
                  sentiment?.polarity === 'urgent'
                    ? 'border-rose-500/50 shadow-rose-950/20 ring-1 ring-rose-500/20'
                    : isHighIntent
                    ? 'border-cyan-500/40 shadow-cyan-950/20'
                    : 'border-slate-800 shadow-blue-950/10'
                }`}
              >
                {/* Summary Header */}
                <div
                  onClick={() => setExpandedLeadId(isExpanded ? null : lead.id)}
                  className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-3 rounded-xl border flex-shrink-0 ${
                        sentiment?.polarity === 'urgent'
                          ? 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                          : isHighIntent
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                          : 'bg-blue-500/10 border-blue-500/40 text-blue-400'
                      }`}
                    >
                      {sentiment?.polarity === 'urgent' ? (
                        <Flame className="w-5 h-5 animate-pulse text-rose-400" />
                      ) : isHighIntent ? (
                        <Zap className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <Info className="w-5 h-5 text-blue-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-white">{lead.name}</span>
                        {lead.company && (
                          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-700 font-medium">
                            {lead.company}
                          </span>
                        )}

                        {/* Sentiment & Tone Badge */}
                        <span
                          className={`text-xs font-bold px-3 py-0.5 rounded-full border flex items-center gap-1.5 shadow-sm ${polarityBadge.bg}`}
                        >
                          {polarityBadge.icon}
                          <span>{polarityBadge.label}</span>
                          {sentiment?.score !== undefined && (
                            <span className="text-[10px] opacity-90 border-l border-slate-600/60 pl-1.5 ml-0.5">
                              {sentiment.score}% Tone Match
                            </span>
                          )}
                        </span>

                        {/* Priority Level Badge */}
                        {getPriorityBadge(priorityLevel)}

                        {/* Automated Classification Tag Badge */}
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                            isHighIntent
                              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                              : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                          }`}
                        >
                          {isHighIntent ? <Zap className="w-3 h-3 text-cyan-400" /> : <Info className="w-3 h-3 text-blue-400" />}
                          <span>{classificationTag}</span>
                        </span>

                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                            lead.status === 'Approved & Sent'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {lead.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          {lead.email}
                        </span>
                        <span className="flex items-center gap-1 text-cyan-300 font-medium">
                          <FileText className="w-3.5 h-3.5 text-cyan-400" />
                          {lead.solutionOfInterest}
                        </span>
                        {lead.aumOrBudget && (
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <DollarSign className="w-3.5 h-3.5" />
                            {lead.aumOrBudget}
                          </span>
                        )}
                        <span className="text-slate-500">
                          {new Date(lead.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-slate-800 pt-3 lg:pt-0">
                    <span className="text-xs text-slate-400">
                      {isExpanded ? 'Collapse Analysis' : 'Review Tone & Draft'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="border-t border-slate-800/80 bg-slate-950/80 p-6 space-y-6">
                    {/* Real-time Sentiment & Psychological Drivers Intelligence Card */}
                    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 shadow-inner">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                        <div className="flex items-center space-x-2">
                          <HeartPulse className="w-4 h-4 text-rose-400 animate-pulse" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Real-Time Sentiment Analysis & Emotional Tone Insights
                          </h4>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            disabled={isAnalyzingSentiment[lead.id]}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSingleSentimentAnalyze(lead);
                            }}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg border border-rose-500/30 transition-all disabled:opacity-50"
                          >
                            <HeartPulse className={`w-3.5 h-3.5 text-rose-400 ${isAnalyzingSentiment[lead.id] ? 'animate-pulse' : ''}`} />
                            <span>Re-analyze Sentiment</span>
                          </button>

                          <button
                            type="button"
                            disabled={isClassifying[lead.id]}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSingleClassify(lead);
                            }}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg border border-cyan-500/30 transition-all disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isClassifying[lead.id] ? 'animate-spin' : ''}`} />
                            <span>Full Classification</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Emotional Triggers & Drivers */}
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            Detected Emotional Triggers:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {(sentiment?.emotionalTriggers && sentiment.emotionalTriggers.length > 0
                              ? sentiment.emotionalTriggers
                              : [
                                  'Immediate decision timeline',
                                  'Technical execution speed requirements',
                                  'High capital deployment interest'
                                ]
                            ).map((trigger, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-slate-800/90 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1"
                              >
                                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                                {trigger}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Recommended Rep Response Strategy */}
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-cyan-400" />
                            Recommended Rep Tone & Strategy:
                          </span>
                          <div className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/80 leading-relaxed font-sans">
                            {sentiment?.recommendedTone ||
                              'Direct, authoritative, and fast-paced. Address technical requirements immediately with live sandbox access.'}
                          </div>
                        </div>

                        {/* Priority Response Level & Summary */}
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-rose-400" />
                            Agent Priority & Summary:
                          </span>
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-400">Response SLA:</span>
                              {getPriorityBadge(priorityLevel)}
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {sentiment?.summary || lead.classificationReason || lead.intentReason}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Gemini Classification Analysis Card */}
                    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center space-x-2">
                          <Bot className="w-4 h-4 text-cyan-400" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Gemini Automated Classification Signals
                          </h4>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Extracted Buying Signals */}
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-amber-400" />
                            Detected Buying Signals & Technical Requirements:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {(lead.buyingSignals && lead.buyingSignals.length > 0
                              ? lead.buyingSignals
                              : isHighIntent
                              ? [
                                  'High-intent commercial evaluation',
                                  'Specific technical platform component requested',
                                  'Immediate sandbox or trial interest'
                                ]
                              : ['Academic or educational research scope', 'General documentation inquiry']
                            ).map((signal, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-slate-800/90 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1"
                              >
                                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                                {signal}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* AI Rationale & Next Action */}
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                            AI Classification Rationale:
                          </span>
                          <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                            {lead.classificationReason || lead.intentReason || 'Evaluated conversation content and user inquiry.'}
                          </p>

                          {lead.suggestedAction && (
                            <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 pt-1">
                              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Recommended Action: {lead.suggestedAction}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Client Conversation / Message Box */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <MessageSquare className="w-4 h-4 text-cyan-400" />
                          Client Message / Sales Assistant Chat Transcript
                        </span>
                      </div>
                      <p className="text-sm text-slate-200 bg-slate-950/90 p-3.5 rounded-lg border border-slate-800/80 italic font-mono leading-relaxed">
                        "{lead.userMessage || 'Inquiry submitted via platform.'}"
                      </p>
                    </div>

                    {/* Gemini Pre-Draft Response Box */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                          Suggested Response Draft (Tuned to Tone: "{sentiment?.tone || 'Professional'}")
                        </label>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleCopyDraft(lead)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all"
                          >
                            {copiedId === lead.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400 font-semibold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                                <span>Copy Subject & Draft</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Subject Line Field */}
                      <div>
                        <label className="text-xs text-slate-400 font-medium mb-1 block">Subject Line:</label>
                        <input
                          type="text"
                          value={currentSubject}
                          onChange={(e) =>
                            setDraftSubjects((prev) => ({ ...prev, [lead.id]: e.target.value }))
                          }
                          className="w-full bg-slate-900 border border-slate-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      {/* Draft Body Textarea */}
                      <div>
                        <label className="text-xs text-slate-400 font-medium mb-1 block">Email Body Draft:</label>
                        <textarea
                          rows={9}
                          value={currentBody}
                          onChange={(e) =>
                            setDraftBodies((prev) => ({ ...prev, [lead.id]: e.target.value }))
                          }
                          className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm p-4 rounded-xl focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
                        />
                      </div>

                      {/* Custom Gemini Instruction Prompt & Template Selector */}
                      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-center gap-3">
                        <div className="w-full md:w-56 flex-shrink-0">
                          <select
                            value={selectedTemplates[lead.id] || ''}
                            onChange={(e) =>
                              setSelectedTemplates((prev) => ({ ...prev, [lead.id]: e.target.value }))
                            }
                            className="w-full bg-slate-950 border border-slate-800 text-xs text-cyan-300 px-2.5 py-2 rounded-lg focus:outline-none focus:border-cyan-500 font-medium"
                          >
                            <option value="">Auto-Detect Best Template</option>
                            {templates.map((t) => (
                              <option key={t.id} value={t.id}>
                                [{t.category}] {t.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <input
                          type="text"
                          placeholder="Custom instruction for Gemini (e.g. 'Match urgent tone and offer 15-min Zoom today')..."
                          value={customPrompts[lead.id] || ''}
                          onChange={(e) =>
                            setCustomPrompts((prev) => ({ ...prev, [lead.id]: e.target.value }))
                          }
                          className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
                        />

                        <button
                          type="button"
                          disabled={isGenerating[lead.id]}
                          onClick={() => handleRegenerate(lead)}
                          className="w-full md:w-auto flex-shrink-0 inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating[lead.id] ? 'animate-spin' : ''}`} />
                          <span>{isGenerating[lead.id] ? 'Generating...' : 'Regenerate Draft'}</span>
                        </button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => deleteOutreachLead(lead.id)}
                          className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          <span>Archive Lead</span>
                        </button>

                        <div className="flex items-center space-x-3 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => handleApproveAndSend(lead)}
                            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-102"
                          >
                            <Send className="w-4 h-4" />
                            <span>Approve & Dispatch Outreach Email</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Simulate Lead Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Simulate Lead Submission & Real-Time Sentiment</h3>
              </div>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-semibold block">Quick Emotional Tone Presets:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={fillHighIntentPreset}
                  className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold text-left flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>🔥 Urgent ($20M)</span>
                </button>
                <button
                  type="button"
                  onClick={fillSkepticalPreset}
                  className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold text-left flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>⚠️ Skeptical / HIPAA</span>
                </button>
                <button
                  type="button"
                  onClick={fillInformationalPreset}
                  className="px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold text-left flex items-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  <span>ℹ️ Academic</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSimulateNewLead} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1 block">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium mb-1 block">Work Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. v.malhotra@quantumcap.com"
                  value={simEmail}
                  onChange={(e) => setSimEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium mb-1 block">Company / Fund Name</label>
                <input
                  type="text"
                  placeholder="e.g. Quantum Capital Hedge Fund"
                  value={simCompany}
                  onChange={(e) => setSimCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium mb-1 block">Product / Solution Interested</label>
                <input
                  type="text"
                  value={simSolution}
                  onChange={(e) => setSimSolution(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium mb-1 block">Inquiry / Conversation Message</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Managing $20M AUM Forex fund requiring sub-1.8ms FIX protocol bridge..."
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-3 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSimulating}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
                >
                  {isSimulating ? (
                    <span>Running Gemini Sentiment Analysis...</span>
                  ) : (
                    <>
                      <Bot className="w-4 h-4" />
                      <span>Analyze & Push Lead</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
