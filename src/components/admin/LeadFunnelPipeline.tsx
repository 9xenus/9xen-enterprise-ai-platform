import React, { useState, useMemo } from 'react';
import { useCms } from '../../context/CmsContext';
import { OutreachLead } from '../../types/cms';
import {
  TrendingUp,
  Target,
  Send,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  BookOpen,
  ArrowRight,
  Sparkles,
  Search,
  Building2,
  Mail,
  DollarSign,
  Plus,
  RefreshCw,
  Zap,
  ChevronRight,
  BarChart3,
  Users,
  X,
  Bot,
  Webhook,
  Plug
} from 'lucide-react';
import {
  FunnelChart,
  Funnel,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LabelList
} from 'recharts';

const CustomFunnelTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl text-xs space-y-2 font-mono shadow-2xl text-slate-200 min-w-[180px]">
        <div className="flex items-center gap-1.5 border-b border-slate-800/80 pb-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.fill }} />
          <span className="text-white font-bold">{data.name}</span>
        </div>
        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-400">Active Leads:</span>
            <strong className="text-white font-mono">{data.value}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Stage Conv:</span>
            <strong className="text-emerald-400 font-mono">{(data.prevRate || 0).toFixed(1)}%</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Overall Conv:</span>
            <strong className="text-cyan-400 font-mono">{(data.rate || 0).toFixed(1)}%</strong>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const LeadFunnelPipeline: React.FC = () => {
  const {
    cmsData,
    updateLeadStage,
    saveOutreachLead,
    approveAndSendOutreach,
    classifySingleLead,
    batchClassifyLeads,
  } = useCms();

  const queue = cmsData.outreachQueue || [];

  // Filtering states
  const [tagFilter, setTagFilter] = useState<'all' | 'High Intent' | 'Informational'>('all');
  const [solutionFilter, setSolutionFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFunnelStage, setSelectedFunnelStage] = useState<'all' | 'New Inquiry' | 'Outreach Sent' | 'Demo Scheduled' | 'Closed'>('all');
  const [agentSourceFilter, setAgentSourceFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Action states & modals
  const [isBatchClassifying, setIsBatchClassifying] = useState(false);
  const [classifyingLeadId, setClassifyingLeadId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Demo scheduling modal state
  const [demoModalLead, setDemoModalLead] = useState<OutreachLead | null>(null);
  const [demoDate, setDemoDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16)
  );
  const [demoMeetingType, setDemoMeetingType] = useState<string>(
    'Live FIX Protocol 4.4 & MT5 Bridge Walkthrough'
  );
  const [demoHost, setDemoHost] = useState<string>('Lead Quant Systems Architect');
  const [demoNotes, setDemoNotes] = useState<string>('');

  // Quick Dispatch modal state
  const [dispatchModalLead, setDispatchModalLead] = useState<OutreachLead | null>(null);
  const [dispatchSubject, setDispatchSubject] = useState('');
  const [dispatchBody, setDispatchBody] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);

  // New simulated lead modal
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadCompany, setNewLeadCompany] = useState('');
  const [newLeadSolution, setNewLeadSolution] = useState('Quant Trading Bot (AlphaBot Pro for Forex/Crypto/Prop Funds)');
  const [newLeadBudget, setNewLeadBudget] = useState('$10M+ Fund AUM');
  const [newLeadMessage, setNewLeadMessage] = useState('');
  const [newLeadTag, setNewLeadTag] = useState<'High Intent' | 'Informational'>('High Intent');
  const [newLeadInitialStage, setNewLeadInitialStage] = useState<'New Inquiry' | 'Outreach Sent' | 'Demo Scheduled' | 'Closed'>('New Inquiry');
  const [newLeadAgentSource, setNewLeadAgentSource] = useState<string>('Nexus Assistant');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper to determine normalized lead stage
  const getLeadStage = (lead: OutreachLead): 'New Inquiry' | 'Outreach Sent' | 'Demo Scheduled' | 'Closed' => {
    if (lead.stage) return lead.stage;
    if (lead.demoScheduledAt) return 'Demo Scheduled';
    if (lead.status === 'Approved & Sent') return 'Outreach Sent';
    return 'New Inquiry';
  };

  // Helper to get normalized classification tag
  const getLeadTag = (lead: OutreachLead): 'High Intent' | 'Informational' => {
    if (lead.classificationTag) return lead.classificationTag;
    return lead.intentScore === 'Medium' ? 'Informational' : 'High Intent';
  };

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return queue.filter((lead) => {
      const stage = getLeadStage(lead);
      const tag = getLeadTag(lead);

      // Search term
      const matchesSearch =
        !searchTerm ||
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.solutionOfInterest.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.userMessage || '').toLowerCase().includes(searchTerm.toLowerCase());

      // Tag filter
      const matchesTag = tagFilter === 'all' || tag === tagFilter;

      // Solution filter
      const matchesSolution =
        solutionFilter === 'all' ||
        lead.solutionOfInterest.toLowerCase().includes(solutionFilter.toLowerCase());

      // Funnel Stage selection filter
      const matchesStage =
        selectedFunnelStage === 'all' || stage === selectedFunnelStage;

      // AI Agent Source filter
      const matchesAgentSource =
        agentSourceFilter === 'all' ||
        (lead.agentSource || (lead as any).source || 'Nexus Assistant').toLowerCase() === agentSourceFilter.toLowerCase();

      return matchesSearch && matchesTag && matchesSolution && matchesStage && matchesAgentSource;
    });
  }, [queue, searchTerm, tagFilter, solutionFilter, selectedFunnelStage, agentSourceFilter]);

  // Funnel Analytics calculations
  const totalLeads = queue.length;
  const stage1Leads = queue.filter((l) => getLeadStage(l) === 'New Inquiry');
  const stage2Leads = queue.filter((l) => getLeadStage(l) === 'Outreach Sent');
  const stage3Leads = queue.filter((l) => getLeadStage(l) === 'Demo Scheduled');
  const stage4Leads = queue.filter((l) => getLeadStage(l) === 'Closed');

  // Progressive funnel count (all leads that reached or passed each stage)
  const reachedInquiry = totalLeads;
  const reachedOutreach = stage2Leads.length + stage3Leads.length + stage4Leads.length;
  const reachedDemo = stage3Leads.length + stage4Leads.length;
  const reachedClosed = stage4Leads.length;

  const convInquiryToOutreach = reachedInquiry > 0 ? (reachedOutreach / reachedInquiry) * 100 : 0;
  const convOutreachToDemo = reachedOutreach > 0 ? (reachedDemo / reachedOutreach) * 100 : 0;
  const convDemoToClosed = reachedDemo > 0 ? (reachedClosed / reachedDemo) * 100 : 0;
  const overallConversion = reachedInquiry > 0 ? (reachedClosed / reachedInquiry) * 100 : 0;

  // Breakdown by classification tag
  const highIntentLeads = queue.filter((l) => getLeadTag(l) === 'High Intent');
  const informationalLeads = queue.filter((l) => getLeadTag(l) === 'Informational');

  const highIntentOutreachPlus = highIntentLeads.filter(
    (l) => getLeadStage(l) === 'Outreach Sent' || getLeadStage(l) === 'Demo Scheduled' || getLeadStage(l) === 'Closed'
  ).length;
  const highIntentDemo = highIntentLeads.filter((l) => getLeadStage(l) === 'Demo Scheduled' || getLeadStage(l) === 'Closed').length;
  const highIntentClosed = highIntentLeads.filter((l) => getLeadStage(l) === 'Closed').length;
  const highIntentConv = highIntentLeads.length > 0 ? (highIntentClosed / highIntentLeads.length) * 100 : 0;

  const infoOutreachPlus = informationalLeads.filter(
    (l) => getLeadStage(l) === 'Outreach Sent' || getLeadStage(l) === 'Demo Scheduled' || getLeadStage(l) === 'Closed'
  ).length;
  const infoDemo = informationalLeads.filter((l) => getLeadStage(l) === 'Demo Scheduled' || getLeadStage(l) === 'Closed').length;
  const infoClosed = informationalLeads.filter((l) => getLeadStage(l) === 'Closed').length;
  const infoConv = informationalLeads.length > 0 ? (infoClosed / informationalLeads.length) * 100 : 0;

  // Distinct solutions for filter
  const distinctSolutions = useMemo(() => {
    const set = new Set<string>();
    queue.forEach((l) => {
      if (l.solutionOfInterest) set.add(l.solutionOfInterest);
    });
    return Array.from(set);
  }, [queue]);

  // Distinct agent sources for filter
  const distinctAgentSources = useMemo(() => {
    const set = new Set<string>();
    queue.forEach((l) => {
      const src = l.agentSource || (l as any).source || 'Nexus Assistant';
      if (src) set.add(src);
    });
    return Array.from(set);
  }, [queue]);

  // Leads filtered for the funnel calculations (ignores the stage selection filter itself)
  const funnelFilteredLeads = useMemo(() => {
    return queue.filter((lead) => {
      const tag = getLeadTag(lead);

      // Search term
      const matchesSearch =
        !searchTerm ||
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.solutionOfInterest.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.userMessage || '').toLowerCase().includes(searchTerm.toLowerCase());

      // Tag filter
      const matchesTag = tagFilter === 'all' || tag === tagFilter;

      // Solution filter
      const matchesSolution =
        solutionFilter === 'all' ||
        lead.solutionOfInterest.toLowerCase().includes(solutionFilter.toLowerCase());

      // Agent Source filter
      const matchesAgentSource =
        agentSourceFilter === 'all' ||
        (lead.agentSource || (lead as any).source || 'Nexus Assistant').toLowerCase() === agentSourceFilter.toLowerCase();

      return matchesSearch && matchesTag && matchesSolution && matchesAgentSource;
    });
  }, [queue, searchTerm, tagFilter, solutionFilter, agentSourceFilter]);

  // Funnel chart metrics based on funnelFilteredLeads
  const totalFunnelCount = funnelFilteredLeads.length;

  const stageNewCount = funnelFilteredLeads.length;
  const stageOutreachCount = funnelFilteredLeads.filter(
    (l) => getLeadStage(l) === 'Outreach Sent' || getLeadStage(l) === 'Demo Scheduled' || getLeadStage(l) === 'Closed'
  ).length;
  const stageDemoCount = funnelFilteredLeads.filter(
    (l) => getLeadStage(l) === 'Demo Scheduled' || getLeadStage(l) === 'Closed'
  ).length;
  const stageClosedCount = funnelFilteredLeads.filter(
    (l) => getLeadStage(l) === 'Closed'
  ).length;

  // Conversion rates (progressive: between consecutive stages)
  const rateNewToOutreach = stageNewCount > 0 ? (stageOutreachCount / stageNewCount) * 100 : 0;
  const rateOutreachToDemo = stageOutreachCount > 0 ? (stageDemoCount / stageOutreachCount) * 100 : 0;
  const rateDemoToClosed = stageDemoCount > 0 ? (stageClosedCount / stageDemoCount) * 100 : 0;

  // Conversion rates (from top of funnel)
  const rateOverallOutreach = stageNewCount > 0 ? (stageOutreachCount / stageNewCount) * 100 : 0;
  const rateOverallDemo = stageNewCount > 0 ? (stageDemoCount / stageNewCount) * 100 : 0;
  const rateOverallClosed = stageNewCount > 0 ? (stageClosedCount / stageNewCount) * 100 : 0;

  const funnelData = [
    { value: stageNewCount, name: 'New Inquiry', fill: '#06b6d4', rate: 100, prevRate: 100 },
    { value: stageOutreachCount, name: 'Outreach Sent', fill: '#6366f1', rate: rateOverallOutreach, prevRate: rateNewToOutreach },
    { value: stageDemoCount, name: 'Demo Scheduled', fill: '#10b981', rate: rateOverallDemo, prevRate: rateOutreachToDemo },
    { value: stageClosedCount, name: 'Closed', fill: '#f59e0b', rate: rateOverallClosed, prevRate: rateDemoToClosed },
  ];

  const handleFunnelClick = (data: any) => {
    if (!data || !data.name) return;
    const clickedStage = data.name;
    setSelectedFunnelStage((prev) => (prev === clickedStage ? 'all' : clickedStage));
  };

  const handleDemoteStage = async (lead: OutreachLead) => {
    const current = getLeadStage(lead);
    if (current === 'Closed') {
      await updateLeadStage(lead.id, 'Demo Scheduled');
      showToast(`Moved ${lead.name} back to 'Demo Scheduled' stage.`);
    } else if (current === 'Demo Scheduled') {
      await updateLeadStage(lead.id, 'Outreach Sent');
      showToast(`Moved ${lead.name} back to 'Outreach Sent' stage.`);
    } else if (current === 'Outreach Sent') {
      await updateLeadStage(lead.id, 'New Inquiry', { status: 'Pending Review' });
      showToast(`Moved ${lead.name} back to 'New Inquiry' stage.`);
    }
  };

  const handleCloseLead = async (lead: OutreachLead) => {
    await updateLeadStage(lead.id, 'Closed');
    showToast(`🎉 Congratulations! ${lead.name} successfully closed and marked won.`);
  };

  const handleConfirmDemoSchedule = async () => {
    if (!demoModalLead) return;
    await updateLeadStage(demoModalLead.id, 'Demo Scheduled', {
      demoScheduledAt: demoDate,
      demoMeetingType,
      demoNotes: `Host: ${demoHost} | Notes: ${demoNotes}`,
    });
    showToast(`🎯 Demo successfully booked for ${demoModalLead.name} on ${new Date(demoDate).toLocaleString()}!`);
    setDemoModalLead(null);
  };

  const handleOpenDispatchModal = (lead: OutreachLead) => {
    setDispatchModalLead(lead);
    setDispatchSubject(lead.suggestedSubject || `Re: 9xen Enterprise Solution Trial for ${lead.company || lead.name}`);
    setDispatchBody(
      lead.suggestedDraftResponse ||
        `Dear ${lead.name},\n\nThank you for reaching out to 9xen regarding ${lead.solutionOfInterest}.\n\nOur solutions engineering team is prepared to set up an institutional sandbox.\n\nBest regards,\n9xen Enterprise Team`
    );
  };

  const [syncingWebhookLeadId, setSyncingWebhookLeadId] = useState<string | null>(null);

  const handleSyncLeadToWebhooks = async (lead: OutreachLead) => {
    setSyncingWebhookLeadId(lead.id);
    try {
      const token = localStorage.getItem('9xen_admin_token');
      const res = await fetch('/api/admin/webhooks/manual-dispatch', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`🎯 Lead "${lead.name}" pushed to ${data.dispatchedCount} active webhook(s)!`);
      } else {
        showToast(data.error || 'No active webhooks configured to receive lead.');
      }
    } catch (err: any) {
      showToast(`Webhook dispatch error: ${err.message}`);
    } finally {
      setSyncingWebhookLeadId(null);
    }
  };

  const handleConfirmDispatchOutreach = async () => {
    if (!dispatchModalLead) return;
    setIsDispatching(true);
    await approveAndSendOutreach(dispatchModalLead.id, dispatchSubject, dispatchBody);
    setIsDispatching(false);
    showToast(`🚀 Outreach email dispatched to ${dispatchModalLead.email}! Stage advanced to 'Outreach Sent'.`);
    setDispatchModalLead(null);
  };

  const handleSingleClassify = async (lead: OutreachLead) => {
    setClassifyingLeadId(lead.id);
    showToast(`⚡ Running Gemini Classification on ${lead.name}...`);
    const success = await classifySingleLead(lead);
    setClassifyingLeadId(null);
    if (success) {
      showToast(`✨ Re-classified ${lead.name} successfully!`);
    } else {
      showToast(`Failed to classify ${lead.name}.`);
    }
  };

  const handleRunBatchClassification = async () => {
    setIsBatchClassifying(true);
    showToast('⚡ Running Gemini Automated Lead Classification Engine across pipeline...');
    const success = await batchClassifyLeads();
    setIsBatchClassifying(false);
    if (success) {
      showToast('✨ Gemini Classification Engine categorized all leads!');
    } else {
      showToast('Batch classification failed.');
    }
  };

  const handleCreateSimulatedLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadEmail) return;

    const newLead: OutreachLead = {
      id: `lead-sim-${Date.now()}`,
      name: newLeadName,
      email: newLeadEmail,
      company: newLeadCompany || 'Autonomous Trading LLC',
      solutionOfInterest: newLeadSolution,
      intentScore: newLeadTag === 'High Intent' ? 'Critical' : 'Medium',
      classificationTag: newLeadTag,
      confidenceScore: newLeadTag === 'High Intent' ? 95 : 82,
      buyingSignals:
        newLeadTag === 'High Intent'
          ? ['Institutional Budget Identified', 'Direct MT5 / FIX 4.4 Bridge Requirement', 'Urgent Q3 Implementation']
          : ['General Platform Overview', 'Educational Whitepaper Query'],
      classificationReason:
        newLeadTag === 'High Intent'
          ? 'Enterprise inquiry with clear AUM deployment timeline.'
          : 'Informational research inquiry.',
      suggestedAction:
        newLeadTag === 'High Intent' ? 'Host Live Demo Walkthrough' : 'Send Technical Whitepaper Documentation',
      intentReason: `Inquiry regarding ${newLeadSolution}`,
      aumOrBudget: newLeadBudget,
      userMessage: newLeadMessage || `Inquiry for ${newLeadSolution}`,
      suggestedSubject: `Re: 9xen ${newLeadSolution} Evaluation`,
      suggestedDraftResponse: `Dear ${newLeadName},\n\nThank you for reaching out regarding 9xen ${newLeadSolution}.\n\nWe would be glad to schedule an architecture demonstration for ${newLeadCompany || 'your team'}.\n\nBest regards,\n9xen Enterprise Solutions`,
      status: newLeadInitialStage === 'New Inquiry' ? 'Pending Review' : 'Approved & Sent',
      stage: newLeadInitialStage,
      demoScheduledAt:
        newLeadInitialStage === 'Demo Scheduled' ? new Date(Date.now() + 86400000 * 3).toISOString() : undefined,
      demoMeetingType: 'Live FIX Protocol & MT5 Bridge Walkthrough',
      submittedAt: new Date().toISOString(),
    };

    await saveOutreachLead(newLead);
    showToast(`✨ Added new lead "${newLeadName}" to ${newLeadInitialStage} pipeline!`);
    setShowAddLeadModal(false);
    // Reset
    setNewLeadName('');
    setNewLeadEmail('');
    setNewLeadCompany('');
    setNewLeadMessage('');
  };

  // Render individual lead card
  const renderLeadCard = (lead: OutreachLead) => {
    const stage = getLeadStage(lead);
    const tag = getLeadTag(lead);

    return (
      <div
        key={lead.id}
        className={`p-4 rounded-2xl border transition-all space-y-3 bg-slate-950 ${
          tag === 'High Intent'
            ? 'border-amber-500/30 hover:border-amber-500/50 shadow-sm shadow-amber-950/20'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        {/* Top Row: Tag & Intent Score */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {tag === 'High Intent' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Flame className="w-3 h-3" /> High Intent
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                <BookOpen className="w-3 h-3" /> Informational
              </span>
            )}

            {lead.confidenceScore && (
              <span className="text-[10px] font-mono text-slate-400">
                {lead.confidenceScore}% AI score
              </span>
            )}
          </div>

          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
              lead.intentScore === 'Critical'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : lead.intentScore === 'High'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {lead.intentScore} Intent
          </span>
          {(lead.agentSource === 'Nexus Assistant' || (lead as any).inquiryType === 'sales_chat') && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
              <Bot className="w-3 h-3" /> Chat
            </span>
          )}
        </div>

        {/* Lead Profile */}
        <div>
          <div className="font-bold text-white text-sm">{lead.name}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
            <span className="text-cyan-400 truncate">{lead.email}</span>
            {lead.company && (
              <>
                <span>•</span>
                <span className="text-slate-300 font-semibold truncate">{lead.company}</span>
              </>
            )}
          </div>
        </div>

        {/* Solution & Budget */}
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1.5 text-xs">
          <div className="font-medium text-slate-200 text-[11px] flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="truncate">{lead.solutionOfInterest}</span>
          </div>
          {lead.aumOrBudget && (
            <div className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
              <DollarSign className="w-3 h-3 shrink-0" />
              <span>{lead.aumOrBudget}</span>
            </div>
          )}
        </div>

        {/* Buying Signals pills */}
        {lead.buyingSignals && lead.buyingSignals.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {lead.buyingSignals.slice(0, 2).map((signal, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono truncate max-w-[200px]"
                title={signal}
              >
                ✓ {signal}
              </span>
            ))}
          </div>
        )}

        {/* Inquiry text snippet */}
        {lead.userMessage && (
          <p className="text-[11px] text-slate-400 line-clamp-2 italic bg-slate-900/40 p-2 rounded-lg border border-slate-800/60">
            "{lead.userMessage}"
          </p>
        )}

        {/* Stage-Specific Info */}
        {stage === 'Demo Scheduled' && lead.demoScheduledAt && (
          <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Demo: {new Date(lead.demoScheduledAt).toLocaleString()}</span>
            </div>
            {lead.demoMeetingType && (
              <div className="text-[10px] text-slate-300 font-mono">
                Topic: {lead.demoMeetingType}
              </div>
            )}
            {lead.demoNotes && (
              <div className="text-[10px] text-slate-400 italic">
                {lead.demoNotes}
              </div>
            )}
          </div>
        )}

        {stage === 'Outreach Sent' && lead.sentAt && (
          <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-violet-400" />
            <span>Outreach dispatched on {new Date(lead.sentAt).toLocaleDateString()}</span>
          </div>
        )}

        {/* Action Bar & Stage Transitions */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleSingleClassify(lead)}
              disabled={classifyingLeadId === lead.id}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer border border-slate-800/80"
              title="Re-run Gemini AI Classification"
            >
              <Sparkles className={`w-3.5 h-3.5 ${classifyingLeadId === lead.id ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={() => handleSyncLeadToWebhooks(lead)}
              disabled={syncingWebhookLeadId === lead.id}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer border border-slate-800/80"
              title="Push lead to connected Webhooks / CRM"
            >
              <Webhook className={`w-3.5 h-3.5 ${syncingWebhookLeadId === lead.id ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>

          {/* Stage Transition Control */}
          <div className="flex items-center gap-1.5">
            {stage === 'New Inquiry' && (
              <button
                onClick={() => handleOpenDispatchModal(lead)}
                className="px-2.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-sm"
              >
                <span>Dispatch Outreach</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}

            {stage === 'Outreach Sent' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDemoteStage(lead)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] cursor-pointer"
                  title="Move back to New Inquiry"
                >
                  ← Back
                </button>
                <button
                  onClick={() => {
                    setDemoModalLead(lead);
                    setDemoNotes(`Scheduled discovery session for ${lead.company || lead.name}`);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                >
                  <Calendar className="w-3 h-3" />
                  <span>Book Demo</span>
                </button>
              </div>
            )}

            {stage === 'Demo Scheduled' && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleDemoteStage(lead)}
                  className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-[10px] cursor-pointer transition-all border border-slate-800"
                  title="Revert to Outreach"
                >
                  ← Back
                </button>
                <button
                  onClick={() => handleCloseLead(lead)}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                >
                  <span>Close Won 🎉</span>
                </button>
              </div>
            )}

            {stage === 'Closed' && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleDemoteStage(lead)}
                  className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-[10px] cursor-pointer transition-all border border-slate-800"
                  title="Revert to Demo"
                >
                  ← Revert
                </button>
                <span className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold text-[10px] flex items-center gap-1">
                  🎉 Closed Won
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs shadow-2xl shadow-cyan-950/50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
          <span className="font-semibold">{notification}</span>
        </div>
      )}

      {/* Header & Quick Action Bar */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-cyan-400 border border-cyan-500/30">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Lead Conversion Funnel & Pipeline
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Live Conversion Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl">
              Track conversion velocity from <strong className="text-cyan-400">New Inquiry</strong> ➔{' '}
              <strong className="text-violet-400">Outreach Sent</strong> ➔{' '}
              <strong className="text-emerald-400">Demo Scheduled</strong>, segmented by Gemini AI
              lead classification tags (<span className="text-amber-400 font-semibold">High Intent</span> vs{' '}
              <span className="text-sky-400 font-semibold">Informational</span>).
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRunBatchClassification}
              disabled={isBatchClassifying}
              className="px-3.5 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-sm"
              title="Run Gemini 3.8 Flash Classification across all pipeline leads"
            >
              <Sparkles className={`w-3.5 h-3.5 text-violet-400 ${isBatchClassifying ? 'animate-spin' : ''}`} />
              <span>{isBatchClassifying ? 'Classifying with AI...' : 'Batch Classify with Gemini'}</span>
            </button>

            <button
              onClick={() => setShowAddLeadModal(true)}
              className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simulate / Add Lead</span>
            </button>
          </div>
        </div>

        {/* Global Pipeline KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Total Pipeline Leads</span>
              <Users className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{totalLeads}</div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <span className="text-amber-400 font-bold">{highIntentLeads.length} High Intent</span>
              <span>•</span>
              <span className="text-sky-400">{informationalLeads.length} Informational</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Overall Funnel Conversion</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {overallConversion.toFixed(1)}%
            </div>
            <div className="text-[11px] text-slate-500">
              {reachedDemo} of {reachedInquiry} total prospects reached Demo
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>High Intent Win Rate</span>
              <Flame className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {highIntentConv.toFixed(1)}%
            </div>
            <div className="text-[11px] text-slate-500">
              {highIntentDemo} booked of {highIntentLeads.length} high-intent
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Informational Win Rate</span>
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-sky-400 font-mono">
              {infoConv.toFixed(1)}%
            </div>
            <div className="text-[11px] text-slate-500">
              {infoDemo} booked of {informationalLeads.length} informational
            </div>
          </div>
        </div>
      </div>

      {/* RECHARTS INTERACTIVE FUNNEL VISUALIZATION */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Interactive Pipeline Conversion Funnel</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click on any funnel slice to isolate that stage. Filter by AI Source to see agent-specific performance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {selectedFunnelStage !== 'all' && (
              <button
                onClick={() => setSelectedFunnelStage('all')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:text-white text-[11px] text-slate-400 flex items-center gap-1.5 transition-all cursor-pointer font-mono"
              >
                <span>Clear Stage Filter: <strong>{selectedFunnelStage}</strong></span>
                <X className="w-3 h-3" />
              </button>
            )}

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px] font-mono">Agent Source:</span>
              <select
                value={agentSourceFilter}
                onChange={(e) => setAgentSourceFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-[11px] focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="all">All AI Agents ({queue.length})</option>
                {distinctAgentSources.map((src) => (
                  <option key={src} value={src}>
                    {src} ({queue.filter((l) => (l.agentSource || (l as any).source || 'Nexus Assistant') === src).length})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
          {/* Funnel chart column */}
          <div className="lg:col-span-3 h-72 w-full flex flex-col items-center justify-center relative bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
            {totalFunnelCount === 0 ? (
              <div className="text-slate-500 text-xs font-mono text-center">
                No active leads matching current filters.
              </div>
            ) : (
              <div className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <FunnelChart margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                    <RechartsTooltip content={<CustomFunnelTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                    <Funnel
                      dataKey="value"
                      data={funnelData}
                      isAnimationActive
                      onClick={handleFunnelClick}
                      className="cursor-pointer"
                    >
                      <LabelList
                        position="center"
                        fill="#fff"
                        stroke="none"
                        dataKey="name"
                        style={{ fontSize: '11px', fontWeight: 'bold', fontFamily: 'monospace' }}
                      />
                      {funnelData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.fill}
                          className="transition-all duration-300 hover:opacity-85"
                          style={{
                            filter: selectedFunnelStage === entry.name ? 'brightness(1.25) drop-shadow(0px 0px 8px rgba(6, 182, 212, 0.6))' : 'none',
                            opacity: selectedFunnelStage === 'all' || selectedFunnelStage === entry.name ? 1 : 0.4
                          }}
                        />
                      ))}
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Metric breakdown cards */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-1.5 border-b border-slate-800/80">
              <Zap className="w-4 h-4 text-cyan-400" />
              Funnel Conversion Rates
            </h4>

            <div className="space-y-2">
              {/* Stage 1 to 2 */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700/80 transition-all">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-200">New Inquiry ➔ Outreach</span>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {stageNewCount} leads ➔ {stageOutreachCount} sent
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-black text-xs text-cyan-400 font-mono">
                    {rateNewToOutreach.toFixed(1)}%
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">stage conversion</span>
                </div>
              </div>

              {/* Stage 2 to 3 */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700/80 transition-all">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-200">Outreach ➔ Demo</span>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {stageOutreachCount} leads ➔ {stageDemoCount} scheduled
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-black text-xs text-violet-400 font-mono">
                    {rateOutreachToDemo.toFixed(1)}%
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">stage conversion</span>
                </div>
              </div>

              {/* Stage 3 to 4 */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700/80 transition-all">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-200">Demo ➔ Closed Won</span>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {stageDemoCount} leads ➔ {stageClosedCount} closed
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-black text-xs text-emerald-400 font-mono">
                    {rateDemoToClosed.toFixed(1)}%
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">stage conversion</span>
                </div>
              </div>

              {/* Total Win Rate */}
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 flex items-center justify-between text-xs shadow-inner">
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Overall Funnel Conversion
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {stageNewCount} inquiries ➔ {stageClosedCount} closed won
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-black text-sm text-amber-400 font-mono">
                    {rateOverallClosed.toFixed(1)}%
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">overall efficiency</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COMPARATIVE CLASSIFICATION TAG PERFORMANCE MATRIX */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/50">
          {/* High Intent Tag Breakdown */}
          <div className="p-4 rounded-2xl bg-amber-950/15 border border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-300">High Intent Segment</h4>
                  <div className="text-[10px] text-slate-400">Institutional budgets & fund operators</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">
                {highIntentConv.toFixed(1)}% Conversion
              </span>
            </div>

            {/* Progress visualization */}
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden flex">
              <div
                className="bg-amber-400 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, highIntentConv))}%` }}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 text-[10px] font-mono text-slate-400">
              <div>
                <span className="block text-slate-500">Inquiry:</span>
                <span className="text-white font-bold">{highIntentLeads.length} leads</span>
              </div>
              <div>
                <span className="block text-slate-500">Outreach:</span>
                <span className="text-white font-bold">{highIntentOutreachPlus - highIntentDemo} sent</span>
              </div>
              <div>
                <span className="block text-slate-500">Demos:</span>
                <span className="text-emerald-400 font-bold">{highIntentDemo - highIntentClosed} booked</span>
              </div>
              <div>
                <span className="block text-slate-500">Closed:</span>
                <span className="text-amber-400 font-bold">{highIntentClosed} won</span>
              </div>
            </div>
          </div>

          {/* Informational Tag Breakdown */}
          <div className="p-4 rounded-2xl bg-sky-950/15 border border-sky-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-sky-300">Informational Segment</h4>
                  <div className="text-[10px] text-slate-400">Academic & general research queries</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-sky-400">
                {infoConv.toFixed(1)}% Conversion
              </span>
            </div>

            {/* Progress visualization */}
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden flex">
              <div
                className="bg-sky-400 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, infoConv))}%` }}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 text-[10px] font-mono text-slate-400">
              <div>
                <span className="block text-slate-500">Inquiry:</span>
                <span className="text-white font-bold">{informationalLeads.length} leads</span>
              </div>
              <div>
                <span className="block text-slate-500">Outreach:</span>
                <span className="text-white font-bold">{infoOutreachPlus - infoDemo} sent</span>
              </div>
              <div>
                <span className="block text-slate-500">Demos:</span>
                <span className="text-sky-400 font-bold">{infoDemo - infoClosed} booked</span>
              </div>
              <div>
                <span className="block text-slate-500">Closed:</span>
                <span className="text-cyan-400 font-bold">{infoClosed} won</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PIPELINE CONTROLS, SEARCH & FILTERS */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Classification Tag Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setTagFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                tagFilter === 'all'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Tags ({queue.length})
            </button>
            <button
              onClick={() => setTagFilter('High Intent')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                tagFilter === 'High Intent'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-amber-400 hover:bg-slate-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>High Intent ({highIntentLeads.length})</span>
            </button>
            <button
              onClick={() => setTagFilter('Informational')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                tagFilter === 'Informational'
                  ? 'bg-sky-400 text-slate-950 shadow-sm'
                  : 'text-sky-400 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Informational ({informationalLeads.length})</span>
            </button>
          </div>

          {/* Search and view mode switcher */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search leads, company, notes..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* View mode toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'kanban' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Secondary filters: Solutions */}
        {distinctSolutions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-500 text-[11px] font-mono">Solution:</span>
            <button
              onClick={() => setSolutionFilter('all')}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                solutionFilter === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
              }`}
            >
              All Solutions
            </button>
            {distinctSolutions.map((sol) => (
              <button
                key={sol}
                onClick={() => setSolutionFilter(sol)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer truncate max-w-xs ${
                  solutionFilter === sol
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
                }`}
              >
                {sol}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* PIPELINE STAGE COLUMNS / KANBAN VIEW */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* COLUMN 1: NEW INQUIRY */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-cyan-500/30 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider">
                  New Inquiry
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {filteredLeads.filter((l) => getLeadStage(l) === 'New Inquiry').length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {filteredLeads.filter((l) => getLeadStage(l) === 'New Inquiry').length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center text-slate-500 text-xs">
                  No inquiries in this stage.
                </div>
              ) : (
                filteredLeads
                  .filter((l) => getLeadStage(l) === 'New Inquiry')
                  .map((lead) => renderLeadCard(lead))
              )}
            </div>
          </div>

          {/* COLUMN 2: OUTREACH SENT */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-violet-500/30 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
                <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider">
                  Outreach Sent
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                {filteredLeads.filter((l) => getLeadStage(l) === 'Outreach Sent').length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {filteredLeads.filter((l) => getLeadStage(l) === 'Outreach Sent').length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center text-slate-500 text-xs">
                  No leads awaiting reply in this stage.
                </div>
              ) : (
                filteredLeads
                  .filter((l) => getLeadStage(l) === 'Outreach Sent')
                  .map((lead) => renderLeadCard(lead))
              )}
            </div>
          </div>

          {/* COLUMN 3: DEMO SCHEDULED */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider">
                  Demo Scheduled
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {filteredLeads.filter((l) => getLeadStage(l) === 'Demo Scheduled').length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {filteredLeads.filter((l) => getLeadStage(l) === 'Demo Scheduled').length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center text-slate-500 text-xs">
                  No booked demos yet. Move leads here when discovery Zoom or briefing is confirmed.
                </div>
              ) : (
                filteredLeads
                  .filter((l) => getLeadStage(l) === 'Demo Scheduled')
                  .map((lead) => renderLeadCard(lead))
              )}
            </div>
          </div>

          {/* COLUMN 4: CLOSED WON */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/30 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider">
                  Closed Won
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {filteredLeads.filter((l) => getLeadStage(l) === 'Closed').length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {filteredLeads.filter((l) => getLeadStage(l) === 'Closed').length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center text-slate-500 text-xs">
                  No closed won deals. Move leads here when contract is signed or demo converts successfully.
                </div>
              ) : (
                filteredLeads
                  .filter((l) => getLeadStage(l) === 'Closed')
                  .map((lead) => renderLeadCard(lead))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="pb-3 font-semibold">Lead & Company</th>
                  <th className="pb-3 font-semibold">Classification Tag</th>
                  <th className="pb-3 font-semibold">Solution & AUM</th>
                  <th className="pb-3 font-semibold">Stage</th>
                  <th className="pb-3 font-semibold">Timeline / Details</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLeads.map((lead) => {
                  const stage = getLeadStage(lead);
                  const tag = getLeadTag(lead);
                  return (
                    <tr key={lead.id} className="hover:bg-slate-950/60 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="font-bold text-white text-sm">{lead.name}</div>
                        <div className="text-slate-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                          <span>{lead.email}</span>
                          {lead.company && (
                            <>
                              <span>•</span>
                              <span className="text-slate-300 font-semibold">{lead.company}</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-3 pr-4">
                        {tag === 'High Intent' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Flame className="w-3 h-3" /> High Intent ({lead.confidenceScore || 95}%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            <BookOpen className="w-3 h-3" /> Informational
                          </span>
                        )}
                      </td>

                      <td className="py-3 pr-4">
                        <div className="text-white font-medium">{lead.solutionOfInterest}</div>
                        {lead.aumOrBudget && (
                          <div className="text-[11px] font-mono text-cyan-400">{lead.aumOrBudget}</div>
                        )}
                      </td>

                      <td className="py-3 pr-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider ${
                            stage === 'New Inquiry'
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                              : stage === 'Outreach Sent'
                              ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                              : stage === 'Demo Scheduled'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {stage}
                        </span>
                      </td>

                      <td className="py-3 pr-4 text-[11px] text-slate-400">
                        {stage === 'Closed' ? (
                          <div className="text-amber-400 font-mono font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                            Closed Won 🎉
                          </div>
                        ) : stage === 'Demo Scheduled' && lead.demoScheduledAt ? (
                          <div className="text-emerald-400 font-mono font-semibold flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(lead.demoScheduledAt).toLocaleString()}
                          </div>
                        ) : stage === 'Outreach Sent' && lead.sentAt ? (
                          <div className="text-slate-400 font-mono">
                            Sent: {new Date(lead.sentAt).toLocaleDateString()}
                          </div>
                        ) : (
                          <div className="text-slate-500 font-mono">
                            Received: {new Date(lead.submittedAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSyncLeadToWebhooks(lead)}
                            disabled={syncingWebhookLeadId === lead.id}
                            title="Push lead to configured Webhooks / CRM"
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer border border-slate-700"
                          >
                            <Webhook className={`w-3.5 h-3.5 ${syncingWebhookLeadId === lead.id ? 'animate-spin text-cyan-400' : ''}`} />
                          </button>
                          {stage === 'New Inquiry' && (
                            <button
                              onClick={() => handleOpenDispatchModal(lead)}
                              className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] cursor-pointer"
                            >
                              Dispatch Outreach
                            </button>
                          )}
                          {stage === 'Outreach Sent' && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleDemoteStage(lead)}
                                className="px-1.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer font-bold"
                              >
                                ← Back
                              </button>
                              <button
                                onClick={() => {
                                  setDemoModalLead(lead);
                                  setDemoNotes(`Discovery session with ${lead.name}`);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] cursor-pointer"
                              >
                                Book Demo
                              </button>
                            </div>
                          )}
                          {stage === 'Demo Scheduled' && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleDemoteStage(lead)}
                                className="px-1.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer font-bold"
                              >
                                ← Back
                              </button>
                              <button
                                onClick={() => handleCloseLead(lead)}
                                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] cursor-pointer"
                              >
                                Close Won 🎉
                              </button>
                            </div>
                          )}
                          {stage === 'Closed' && (
                            <button
                              onClick={() => handleDemoteStage(lead)}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer font-bold"
                            >
                              Revert Stage
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE DEMO */}
      {demoModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Calendar className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Schedule Platform Demo</h3>
              </div>
              <button
                onClick={() => setDemoModalLead(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lead Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="font-bold text-white">{demoModalLead.name}</div>
              <div className="text-slate-400 font-mono text-[11px]">
                {demoModalLead.email} • {demoModalLead.company || 'Enterprise Prospect'}
              </div>
              <div className="text-cyan-400 text-[11px] pt-1">
                Solution: {demoModalLead.solutionOfInterest}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Demo Date & Time (UTC/Local)</label>
                <input
                  type="datetime-local"
                  value={demoDate}
                  onChange={(e) => setDemoDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Demo Focus / Meeting Type</label>
                <select
                  value={demoMeetingType}
                  onChange={(e) => setDemoMeetingType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
                >
                  <option value="Live FIX Protocol 4.4 & MT5 Bridge Walkthrough">
                    Live FIX Protocol 4.4 & MT5 Bridge Walkthrough
                  </option>
                  <option value="Enterprise AI Fine-Tuning & Sovereign VPC Architecture">
                    Enterprise AI Fine-Tuning & Sovereign VPC Architecture
                  </option>
                  <option value="Autonomous Agent VPC Orchestration & Tool Sandbox">
                    Autonomous Agent VPC Orchestration & Tool Sandbox
                  </option>
                  <option value="RegTech & AI Gateway Security Compliance Review">
                    RegTech & AI Gateway Security Compliance Review
                  </option>
                  <option value="Custom Quant Trading Bot Strategy Sandbox Briefing">
                    Custom Quant Trading Bot Strategy Sandbox Briefing
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Lead Architect / Host</label>
                <input
                  type="text"
                  value={demoHost}
                  onChange={(e) => setDemoHost(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Internal Meeting Notes</label>
                <textarea
                  rows={2}
                  value={demoNotes}
                  onChange={(e) => setDemoNotes(e.target.value)}
                  placeholder="e.g. Prepared 12-broker MT5 demo latency endpoints"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDemoModalLead(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDemoSchedule}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer shadow-md shadow-emerald-500/20"
              >
                Confirm & Advance to 'Demo Scheduled'
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DISPATCH OUTREACH */}
      {dispatchModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Send className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Dispatch Personalized Outreach</h3>
              </div>
              <button
                onClick={() => setDispatchModalLead(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{dispatchModalLead.name}</span>
                <span className="text-cyan-400 font-mono">{dispatchModalLead.email}</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Solution: <strong className="text-slate-200">{dispatchModalLead.solutionOfInterest}</strong>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Subject</label>
                <input
                  type="text"
                  value={dispatchSubject}
                  onChange={(e) => setDispatchSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Email Response Body</label>
                <textarea
                  rows={8}
                  value={dispatchBody}
                  onChange={(e) => setDispatchBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={syncingWebhookLeadId === dispatchModalLead.id}
                onClick={() => handleSyncLeadToWebhooks(dispatchModalLead)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold cursor-pointer border border-cyan-500/30 flex items-center gap-1.5 transition-all"
                title="Forward lead JSON to all active webhooks (Salesforce, HubSpot, Slack, Discord)"
              >
                <Webhook className={`w-3.5 h-3.5 ${syncingWebhookLeadId === dispatchModalLead.id ? 'animate-spin' : ''}`} />
                <span>{syncingWebhookLeadId === dispatchModalLead.id ? 'Pushing...' : 'Push to Webhooks / CRM'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDispatchModalLead(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDispatching}
                  onClick={handleConfirmDispatchOutreach}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold cursor-pointer shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isDispatching ? 'Dispatching...' : 'Send & Advance Stage'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SIMULATE / ADD LEAD */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Plus className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Simulate Pipeline Lead</h3>
              </div>
              <button
                onClick={() => setShowAddLeadModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSimulatedLead} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Prospect Name *</label>
                  <input
                    type="text"
                    required
                    value={newLeadName}
                    onChange={(e) => setNewLeadName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Corporate Email *</label>
                  <input
                    type="email"
                    required
                    value={newLeadEmail}
                    onChange={(e) => setNewLeadEmail(e.target.value)}
                    placeholder="s.jenkins@apexquant.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Company Name</label>
                  <input
                    type="text"
                    value={newLeadCompany}
                    onChange={(e) => setNewLeadCompany(e.target.value)}
                    placeholder="Apex Quant Capital"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">AUM / Budget</label>
                  <input
                    type="text"
                    value={newLeadBudget}
                    onChange={(e) => setNewLeadBudget(e.target.value)}
                    placeholder="$25M+ Fund AUM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Solution of Interest</label>
                <select
                  value={newLeadSolution}
                  onChange={(e) => setNewLeadSolution(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Quant Trading Bot (AlphaBot Pro for Forex/Crypto/Prop Funds)">
                    Quant Trading Bot (AlphaBot Pro)
                  </option>
                  <option value="AI Data Training for Big Companies">AI Data Training for Big Companies</option>
                  <option value="9xen Nexus Autonomous Agent Framework">9xen Nexus Autonomous Agent Framework</option>
                  <option value="RegTech & AI Security Compliance Gateway">RegTech & AI Security Compliance Gateway</option>
                  <option value="General Platform Information & Documentation">General Platform Documentation</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Classification Tag</label>
                  <select
                    value={newLeadTag}
                    onChange={(e) => setNewLeadTag(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="High Intent">🔥 High Intent</option>
                    <option value="Informational">📘 Informational</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Initial Pipeline Stage</label>
                  <select
                    value={newLeadInitialStage}
                    onChange={(e) => setNewLeadInitialStage(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="New Inquiry">Stage 1: New Inquiry</option>
                    <option value="Outreach Sent">Stage 2: Outreach Sent</option>
                    <option value="Demo Scheduled">Stage 3: Demo Scheduled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Inquiry Message</label>
                <textarea
                  rows={3}
                  value={newLeadMessage}
                  onChange={(e) => setNewLeadMessage(e.target.value)}
                  placeholder="Looking for sub-1.8ms FIX protocol execution with MT5 integration."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  Insert Lead into Funnel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
