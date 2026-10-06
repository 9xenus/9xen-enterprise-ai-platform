import React, { useState, useEffect } from 'react';
import { useCms } from '../../context/CmsContext';
import { OutreachTemplate, OutreachLead } from '../../types/cms';
import { MailProviderConfig, defaultMailConfig } from '../../types/mail';
import {
  FileCode,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Check,
  Zap,
  Info,
  Building2,
  Tag,
  Copy,
  Play,
  Bot,
  Layers,
  HelpCircle,
  Save,
  X,
  Mail,
  Send,
  Server,
  Key,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Globe,
  Sliders,
  SendHorizontal,
  RefreshCw,
  Clock
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

export const TemplateManager: React.FC = () => {
  const { cmsData, saveOutreachTemplate, deleteOutreachTemplate, saveOutreachLead } = useCms();
  const templates = cmsData.outreachTemplates || [];
  const leadsQueue = cmsData.outreachQueue || [];

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [editingTemplate, setEditingTemplate] = useState<OutreachTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'High Intent' | 'Informational' | 'General Enterprise' | 'Custom'>('High Intent');
  const [formKeywords, setFormKeywords] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formInstructions, setFormInstructions] = useState('');
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Test Workbench State
  const [testTemplateId, setTestTemplateId] = useState<string>(templates[0]?.id || '');
  const [testLeadName, setTestLeadName] = useState('Alexandra Vance');
  const [testCompany, setTestCompany] = useState('Vance Capital Hedge Fund');
  const [testSolution, setTestSolution] = useState('AlphaBot Pro (Quant Trading Engine)');
  const [testUserMessage, setTestUserMessage] = useState('We manage $15M AUM across Forex & Crypto pairs. Need sub-1.8ms FIX 4.4 protocol access and prop firm challenge daily loss limits.');
  const [testResult, setTestResult] = useState<{ subject: string; body: string; templateUsed?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Mail Provider Integration State
  const [isMailConfigOpen, setIsMailConfigOpen] = useState(false);
  const [mailConfig, setMailConfig] = useState<MailProviderConfig>(
    cmsData.settings?.mailProviderConfig || defaultMailConfig
  );
  const [isSavingMailConfig, setIsSavingMailConfig] = useState(false);
  const [isTestingMail, setIsTestingMail] = useState(false);
  const [mailTestResult, setMailTestResult] = useState<{ success: boolean; messageId?: string; provider?: string; details?: string; error?: string } | null>(null);

  // One-Click Dispatch State
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [dispatchLeadId, setDispatchLeadId] = useState<string>('custom');
  const [dispatchRecipientEmail, setDispatchRecipientEmail] = useState('a.vance@vancecapital.com');
  const [dispatchRecipientName, setDispatchRecipientName] = useState('Alexandra Vance');
  const [dispatchSubject, setDispatchSubject] = useState('');
  const [dispatchBody, setDispatchBody] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccessReceipt, setDispatchSuccessReceipt] = useState<{
    message: string;
    messageId: string;
    provider: string;
    details: string;
  } | null>(null);

  // Fetch Mail Provider Configuration on Mount
  useEffect(() => {
    const fetchMailConfig = async () => {
      try {
        const res = await fetch('/api/admin/mail-config');
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            setMailConfig(data.config);
          }
        }
      } catch (err) {
        console.warn('Could not fetch mail config:', err);
      }
    };
    fetchMailConfig();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4500);
  };

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormName('');
    setFormCategory('High Intent');
    setFormKeywords('quant, bot, trading, forex, fix, mt5');
    setFormSubject('Re: 9xen {{solution}} — Custom Institutional Briefing for {{company}}');
    setFormBody(`Dear {{leadName}},\n\nThank you for contacting 9xen Autonomous Intelligence regarding {{solution}}.\n\nWe have reviewed {{company}}'s requirements and prepared a tailored technical demonstration.\n\nBest regards,\n\n9xen Enterprise Team`);
    setFormInstructions('Focus on technical benchmarks, low latency protocol access, and propose a discovery zoom call.');
    setFormIsDefault(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (template: OutreachTemplate) => {
    setEditingTemplate(template);
    setFormName(template.name);
    setFormCategory(template.category);
    setFormKeywords((template.targetSolutionKeywords || []).join(', '));
    setFormSubject(template.subjectTemplate);
    setFormBody(template.bodyTemplate);
    setFormInstructions(template.systemPromptInstructions);
    setFormIsDefault(!!template.isDefault);
    setIsModalOpen(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formSubject || !formBody) return;

    setIsSaving(true);
    const keywordsArray = formKeywords
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const payload: Partial<OutreachTemplate> = {
      name: formName,
      category: formCategory,
      targetSolutionKeywords: keywordsArray,
      subjectTemplate: formSubject,
      bodyTemplate: formBody,
      systemPromptInstructions: formInstructions,
      isDefault: formIsDefault,
    };

    const success = await saveOutreachTemplate(payload, editingTemplate?.id);
    setIsSaving(false);

    if (success) {
      showToast(`✨ Template "${formName}" saved successfully!`);
      setIsModalOpen(false);
    } else {
      showToast('❌ Failed to save template.');
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDelete = async (id: string, name: string) => {
    setTemplateToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;
    const { id, name } = templateToDelete;
    const success = await deleteOutreachTemplate(id);
    if (success) {
      showToast(`🗑️ Template "${name}" removed.`);
    }
    setTemplateToDelete(null);
  };

  const handleTestGeneration = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/outreach/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: testLeadName,
          email: 'test@client.com',
          company: testCompany,
          solutionOfInterest: testSolution,
          userMessage: testUserMessage,
          templateId: testTemplateId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.subject && data.body) {
        setTestResult({
          subject: data.subject,
          body: data.body,
          templateUsed: data.templateUsed,
        });
        showToast('⚡ Test response draft generated with Gemini!');
      } else {
        showToast('❌ Test generation failed.');
      }
    } catch {
      showToast('❌ Network error testing template.');
    } finally {
      setIsTesting(false);
    }
  };

  const getAdminAuthToken = () => {
    return localStorage.getItem('9xen_admin_token') || sessionStorage.getItem('9xen_admin_token') || 'demo_admin_jwt_token_2026';
  };

  const handleSaveMailConfig = async () => {
    setIsSavingMailConfig(true);
    try {
      const token = getAdminAuthToken();
      const res = await fetch('/api/admin/mail-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(mailConfig),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`📧 Mail provider integration settings saved! Active: ${mailConfig.activeProvider.toUpperCase()}`);
        setIsMailConfigOpen(false);
      } else {
        showToast('❌ Failed to save mail provider settings.');
      }
    } catch {
      showToast('❌ Network error saving mail provider config.');
    } finally {
      setIsSavingMailConfig(false);
    }
  };

  const handleTestMailConnection = async () => {
    setIsTestingMail(true);
    setMailTestResult(null);
    try {
      const token = getAdminAuthToken();
      const res = await fetch('/api/admin/mail-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(mailConfig),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMailTestResult({
          success: true,
          messageId: data.messageId,
          provider: data.provider,
          details: data.details,
        });
        showToast(`✅ Mail provider test connection verified! (${data.provider})`);
      } else {
        setMailTestResult({
          success: false,
          error: data.error || 'Connection failed',
        });
        showToast(`❌ Mail provider verification error.`);
      }
    } catch (err: any) {
      setMailTestResult({
        success: false,
        error: err.message || 'Network error during mail test',
      });
      showToast('❌ Network error testing mail connection.');
    } finally {
      setIsTestingMail(false);
    }
  };

  // Open One-Click Dispatch Modal
  const handleOpenDispatchModal = (subject: string, body: string) => {
    setDispatchSubject(subject);
    setDispatchBody(body);
    setDispatchSuccessReceipt(null);

    // Preselect lead if matching name or first available
    if (leadsQueue.length > 0) {
      const pendingLead = leadsQueue.find((l) => l.status === 'Pending Review') || leadsQueue[0];
      setDispatchLeadId(pendingLead.id);
      setDispatchRecipientEmail(pendingLead.email);
      setDispatchRecipientName(pendingLead.name);
    } else {
      setDispatchLeadId('custom');
      setDispatchRecipientEmail('a.vance@vancecapital.com');
      setDispatchRecipientName('Alexandra Vance');
    }

    setIsDispatchOpen(true);
  };

  const handleLeadSelectChange = (id: string) => {
    setDispatchLeadId(id);
    if (id === 'custom') {
      setDispatchRecipientEmail('prospect@enterprise.com');
      setDispatchRecipientName('Enterprise Prospect');
    } else {
      const matched = leadsQueue.find((l) => l.id === id);
      if (matched) {
        setDispatchRecipientEmail(matched.email);
        setDispatchRecipientName(matched.name);
        if (matched.suggestedSubject) setDispatchSubject(matched.suggestedSubject);
        if (matched.suggestedDraftResponse) setDispatchBody(matched.suggestedDraftResponse);
      }
    }
  };

  const handleExecuteOneClickDispatch = async () => {
    if (!dispatchRecipientEmail || !dispatchSubject || !dispatchBody) return;

    setIsDispatching(true);
    setDispatchSuccessReceipt(null);

    try {
      const token = getAdminAuthToken();
      const res = await fetch('/api/outreach/dispatch-mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          leadId: dispatchLeadId !== 'custom' ? dispatchLeadId : undefined,
          recipientEmail: dispatchRecipientEmail,
          recipientName: dispatchRecipientName,
          subject: dispatchSubject,
          body: dispatchBody,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDispatchSuccessReceipt({
          message: data.message,
          messageId: data.dispatchResult?.messageId || `msg-${Date.now()}`,
          provider: data.dispatchResult?.provider || mailConfig.activeProvider,
          details: data.dispatchResult?.details || 'Packet sent securely to prospect',
        });
        showToast(`🚀 Outreach response dispatched directly to ${dispatchRecipientEmail}!`);

        // If a lead was updated, save state
        if (dispatchLeadId !== 'custom') {
          saveOutreachLead(
            {
              status: 'Approved & Sent',
              suggestedSubject: dispatchSubject,
              suggestedDraftResponse: dispatchBody,
              sentAt: new Date().toISOString(),
            },
            dispatchLeadId
          );
        }
      } else {
        showToast(`❌ Dispatch failed: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      showToast(`❌ Dispatch error: ${err.message || 'Network failure'}`);
    } finally {
      setIsDispatching(false);
    }
  };

  const insertVariable = (variable: string, field: 'subject' | 'body') => {
    if (field === 'subject') {
      setFormSubject((prev) => prev + ` ${variable}`);
    } else {
      setFormBody((prev) => prev + ` ${variable}`);
    }
  };

  const filteredTemplates = templates.filter((t) => {
    if (activeCategory === 'all') return true;
    return t.category.toLowerCase().replace(/\s+/g, '_') === activeCategory;
  });

  return (
    <div className="space-y-8">
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Template"
        message={`Are you sure you want to delete template "${templateToDelete?.name}"?`}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-cyan-500/40 flex items-center space-x-3 text-sm animate-in fade-in slide-in-from-bottom-4">
          <Bot className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700/60 shadow-xl text-white">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30 text-cyan-400">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Gemini Outreach Response Template Manager
              <span className="text-xs bg-cyan-500/20 text-cyan-300 font-semibold px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                Dynamic Prompts & Mail Provider
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Define, customize, and test system instructions, subject line formulas, and email body structures. Connect SMTP / APIs (SendGrid, Resend, SES) to dispatch responses with one click.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsMailConfigOpen(true)}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold text-xs shadow-md transition-all hover:scale-102"
          >
            <Mail className="w-4 h-4 text-cyan-400" />
            <span>Mail Provider Integration</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full uppercase font-mono border border-cyan-500/30">
              {mailConfig.activeProvider}
            </span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Template</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'all', label: 'All Templates', count: templates.length },
          { id: 'high_intent', label: '⚡ High Intent', count: templates.filter((t) => t.category === 'High Intent').length },
          { id: 'informational', label: 'ℹ️ Informational', count: templates.filter((t) => t.category === 'Informational').length },
          { id: 'general_enterprise', label: '🏢 General Enterprise', count: templates.filter((t) => t.category === 'General Enterprise').length },
          { id: 'custom', label: '⚙️ Custom', count: templates.filter((t) => t.category === 'Custom').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCategory === tab.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Templates List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTemplates.map((template) => {
          const isHighIntent = template.category === 'High Intent';

          return (
            <div
              key={template.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-white">{template.name}</h3>
                      {template.isDefault && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-500/30">
                          DEFAULT
                        </span>
                      )}
                    </div>

                    <span
                      className={`inline-block mt-2 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isHighIntent
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : template.category === 'Informational'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      }`}
                    >
                      {template.category}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(template)}
                      className="p-2 text-slate-400 hover:text-cyan-400 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700 transition-all"
                      title="Edit Template"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(template.id, template.name)}
                      className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700 transition-all"
                      title="Delete Template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Target Keywords */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3 h-3 text-cyan-400" /> Target Solution Keywords:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(template.targetSolutionKeywords || []).map((kw, i) => (
                      <span
                        key={i}
                        className="text-xs bg-slate-950 text-cyan-300 px-2 py-0.5 rounded-md border border-slate-800 font-mono"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* System Prompt Instructions */}
                <div className="space-y-1.5 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" /> Gemini System Prompt Instruction:
                  </span>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "{template.systemPromptInstructions}"
                  </p>
                </div>

                {/* Subject Preview */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Subject Formula:</span>
                  <div className="text-xs font-semibold text-slate-200 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono">
                    {template.subjectTemplate}
                  </div>
                </div>

                {/* Body Preview */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Body Reference Draft:</span>
                  <pre className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 font-sans whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                    {template.bodyTemplate}
                  </pre>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                <span>Updated: {new Date(template.updatedAt).toLocaleDateString()}</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setTestTemplateId(template.id);
                      showToast(`Selected "${template.name}" in Test Workbench below.`);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" /> Test in Gemini Workbench
                  </button>

                  <button
                    onClick={() => handleOpenDispatchModal(template.subjectTemplate, template.bodyTemplate)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30"
                  >
                    <SendHorizontal className="w-3 h-3" /> One-Click Send
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Gemini Test Workbench */}
      <div className="bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/30">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Interactive Gemini Template Generation & One-Click Mail Workbench</h3>
            <p className="text-xs text-slate-400">
              Select any template and run a live test generation using Gemini 3.6 Flash. Immediately dispatch generated drafts to prospects via active Mail Provider.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Active Template to Test:</label>
            <select
              value={testTemplateId}
              onChange={(e) => setTestTemplateId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500 font-medium"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.category}] {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Test Prospect Lead Name:</label>
            <input
              type="text"
              value={testLeadName}
              onChange={(e) => setTestLeadName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Test Company / Fund:</label>
            <input
              type="text"
              value={testCompany}
              onChange={(e) => setTestCompany(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Test Solution Requested:</label>
            <input
              type="text"
              value={testSolution}
              onChange={(e) => setTestSolution(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1 block">Test Inquiry Message Context:</label>
          <textarea
            rows={2}
            value={testUserMessage}
            onChange={(e) => setTestUserMessage(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs p-3 rounded-xl focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            onClick={handleTestGeneration}
            disabled={isTesting}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Generating with Gemini...' : 'Run Test Generation'}</span>
          </button>

          {testResult && (
            <button
              onClick={() => handleOpenDispatchModal(testResult.subject, testResult.body)}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
            >
              <SendHorizontal className="w-4 h-4" />
              <span>Send Draft Direct to Prospect ({mailConfig.activeProvider.toUpperCase()})</span>
            </button>
          )}
        </div>

        {/* Test Result Display */}
        {testResult && (
          <div className="bg-slate-950 border border-cyan-500/40 rounded-xl p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" /> Generated Email Draft (Template: {testResult.templateUsed})
              </span>
              <button
                onClick={() => handleOpenDispatchModal(testResult.subject, testResult.body)}
                className="text-emerald-400 hover:text-emerald-300 text-xs font-bold flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" /> Direct One-Click Dispatch
              </button>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-semibold block">Generated Subject:</span>
              <div className="text-xs font-bold text-white font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800 mt-1">
                {testResult.subject}
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-semibold block">Generated Email Body:</span>
              <pre className="text-xs text-slate-200 bg-slate-900 p-3 rounded-lg border border-slate-800 font-sans whitespace-pre-wrap leading-relaxed mt-1">
                {testResult.body}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Edit / Create Template Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <FileCode className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  {editingTemplate ? 'Edit Response Template' : 'Create Response Template'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-semibold mb-1 block">Template Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Quant Hedge Fund High-Intent Template"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold mb-1 block">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
                  >
                    <option value="High Intent">⚡ High Intent</option>
                    <option value="Informational">ℹ️ Informational</option>
                    <option value="General Enterprise">🏢 General Enterprise</option>
                    <option value="Custom">⚙️ Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold mb-1 block">
                  Target Solution Keywords (comma-separated):
                </label>
                <input
                  type="text"
                  placeholder="e.g. quant, bot, trading, forex, fix, mt5, aum"
                  value={formKeywords}
                  onChange={(e) => setFormKeywords(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold mb-1 block">
                  Gemini System Prompt Instructions:
                </label>
                <textarea
                  rows={2}
                  placeholder="Specific tone and technical rules for Gemini (e.g. Emphasize sub-1.8ms latency, MT5 bridge, and invite to Zoom call)."
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs p-3 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Variable Helper */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[11px] text-slate-400 font-semibold block">
                  Supported Variable Tags (Click to insert):
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => insertVariable('{{leadName}}', 'body')}
                    className="text-xs bg-slate-900 hover:bg-slate-800 text-cyan-300 px-2.5 py-1 rounded-lg border border-slate-700 font-mono"
                  >
                    + {"{{leadName}}"}
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariable('{{company}}', 'body')}
                    className="text-xs bg-slate-900 hover:bg-slate-800 text-cyan-300 px-2.5 py-1 rounded-lg border border-slate-700 font-mono"
                  >
                    + {"{{company}}"}
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariable('{{solution}}', 'body')}
                    className="text-xs bg-slate-900 hover:bg-slate-800 text-cyan-300 px-2.5 py-1 rounded-lg border border-slate-700 font-mono"
                  >
                    + {"{{solution}}"}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold mb-1 block">Subject Line Formula *</label>
                <input
                  type="text"
                  required
                  placeholder="Re: 9xen {{solution}} — Institutional Trial for {{company}}"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold mb-1 block">Body Template Reference Draft *</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Dear {{leadName}}, ..."
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs p-3 rounded-xl focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefaultCheck"
                  checked={formIsDefault}
                  onChange={(e) => setFormIsDefault(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="isDefaultCheck" className="text-xs text-slate-300 font-medium">
                  Set as Default Template for {formCategory} category
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Template'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mail Provider Configuration Modal */}
      {isMailConfigOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/30">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Mail Provider Integration (SMTP / API)</h3>
                  <p className="text-xs text-slate-400">
                    Configure your production mail gateway (SMTP, SendGrid, Resend, AWS SES, Postmark) to enable one-click outreach dispatching directly to prospects.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMailConfigOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Provider Tabs */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-2 block">
                  Select Active Mail Provider:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { id: 'smtp', label: 'SMTP Server', icon: Server, desc: 'Generic SMTP / Postfix / cPanel' },
                    { id: 'sendgrid', label: 'SendGrid API', icon: Zap, desc: 'SendGrid v3 Web API' },
                    { id: 'resend', label: 'Resend API', icon: Mail, desc: 'Resend API v1' },
                    { id: 'postmark', label: 'Postmark API', icon: Globe, desc: 'Postmark Transactional' },
                    { id: 'aws_ses', label: 'AWS SES', icon: Key, desc: 'Amazon Simple Email' },
                    { id: 'simulated', label: 'Sandbox Mode', icon: Sliders, desc: 'Mock Delivery Verification' },
                  ].map((p) => {
                    const IconComp = p.icon;
                    const isActive = mailConfig.activeProvider === p.id;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setMailConfig({ ...mailConfig, activeProvider: p.id as any })}
                        className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                          isActive
                            ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-md'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <IconComp className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                          <span className="text-xs font-bold">{p.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 block">{p.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sender Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="text-xs text-slate-300 font-semibold mb-1 block">Sender Display Name</label>
                  <input
                    type="text"
                    value={mailConfig.senderName}
                    onChange={(e) => setMailConfig({ ...mailConfig, senderName: e.target.value })}
                    placeholder="e.g. 9xen Enterprise Solutions"
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold mb-1 block">Sender Email Address</label>
                  <input
                    type="email"
                    value={mailConfig.senderEmail}
                    onChange={(e) => setMailConfig({ ...mailConfig, senderEmail: e.target.value })}
                    placeholder="outreach@9xen.ai"
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* SMTP Settings */}
              {mailConfig.activeProvider === 'smtp' && (
                <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-cyan-500/30">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Server className="w-4 h-4" /> SMTP Server Connection Parameters
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="text-[11px] text-slate-300 font-medium mb-1 block">SMTP Host / Server *</label>
                      <input
                        type="text"
                        value={mailConfig.smtp.host}
                        onChange={(e) =>
                          setMailConfig({
                            ...mailConfig,
                            smtp: { ...mailConfig.smtp, host: e.target.value },
                          })
                        }
                        placeholder="smtp.gmail.com or mail.yourdomain.com"
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-300 font-medium mb-1 block">Port *</label>
                      <input
                        type="number"
                        value={mailConfig.smtp.port}
                        onChange={(e) =>
                          setMailConfig({
                            ...mailConfig,
                            smtp: { ...mailConfig.smtp, port: Number(e.target.value) },
                          })
                        }
                        placeholder="587"
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-300 font-medium mb-1 block">SMTP Username / Email *</label>
                      <input
                        type="text"
                        value={mailConfig.smtp.user}
                        onChange={(e) =>
                          setMailConfig({
                            ...mailConfig,
                            smtp: { ...mailConfig.smtp, user: e.target.value },
                          })
                        }
                        placeholder="user@domain.com"
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-300 font-medium mb-1 block">SMTP Password / App Secret *</label>
                      <input
                        type="password"
                        value={mailConfig.smtp.pass}
                        onChange={(e) =>
                          setMailConfig({
                            ...mailConfig,
                            smtp: { ...mailConfig.smtp, pass: e.target.value },
                          })
                        }
                        placeholder="••••••••••••••••"
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="checkbox"
                      id="smtpSecureCheck"
                      checked={mailConfig.smtp.secure}
                      onChange={(e) =>
                        setMailConfig({
                          ...mailConfig,
                          smtp: { ...mailConfig.smtp, secure: e.target.checked },
                        })
                      }
                      className="rounded border-slate-800 bg-slate-900 text-cyan-500"
                    />
                    <label htmlFor="smtpSecureCheck" className="text-xs text-slate-300">
                      Use SSL/TLS (Port 465) instead of STARTTLS (Port 587)
                    </label>
                  </div>
                </div>
              )}

              {/* SendGrid Settings */}
              {mailConfig.activeProvider === 'sendgrid' && (
                <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-cyan-500/30">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> SendGrid Web API v3 Configuration
                  </span>
                  <div>
                    <label className="text-[11px] text-slate-300 font-medium mb-1 block">SendGrid API Key *</label>
                    <input
                      type="password"
                      value={mailConfig.sendgrid.apiKey}
                      onChange={(e) =>
                        setMailConfig({
                          ...mailConfig,
                          sendgrid: { apiKey: e.target.value },
                        })
                      }
                      placeholder="SG.xxxxxxxxxxxxxxxx"
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Resend Settings */}
              {mailConfig.activeProvider === 'resend' && (
                <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-cyan-500/30">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Mail className="w-4 h-4" /> Resend API v1 Configuration
                  </span>
                  <div>
                    <label className="text-[11px] text-slate-300 font-medium mb-1 block">Resend API Key *</label>
                    <input
                      type="password"
                      value={mailConfig.resend.apiKey}
                      onChange={(e) =>
                        setMailConfig({
                          ...mailConfig,
                          resend: { apiKey: e.target.value },
                        })
                      }
                      placeholder="re_xxxxxxxxxxxxxxxx"
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Postmark Settings */}
              {mailConfig.activeProvider === 'postmark' && (
                <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-cyan-500/30">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Globe className="w-4 h-4" /> Postmark Server Token Configuration
                  </span>
                  <div>
                    <label className="text-[11px] text-slate-300 font-medium mb-1 block">Postmark Server Token *</label>
                    <input
                      type="password"
                      value={mailConfig.postmark.serverToken}
                      onChange={(e) =>
                        setMailConfig({
                          ...mailConfig,
                          postmark: { serverToken: e.target.value },
                        })
                      }
                      placeholder="xxxx-xxxx-xxxx-xxxx"
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* AWS SES Settings */}
              {mailConfig.activeProvider === 'aws_ses' && (
                <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-cyan-500/30">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Key className="w-4 h-4" /> Amazon SES Credentials
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-300 font-medium mb-1 block">AWS Region</label>
                      <input
                        type="text"
                        value={mailConfig.awsSes.region}
                        onChange={(e) =>
                          setMailConfig({
                            ...mailConfig,
                            awsSes: { ...mailConfig.awsSes, region: e.target.value },
                          })
                        }
                        placeholder="us-east-1"
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-300 font-medium mb-1 block">AWS Access Key ID</label>
                      <input
                        type="text"
                        value={mailConfig.awsSes.accessKeyId}
                        onChange={(e) =>
                          setMailConfig({
                            ...mailConfig,
                            awsSes: { ...mailConfig.awsSes, accessKeyId: e.target.value },
                          })
                        }
                        placeholder="AKIAXXXXXXXXXXXXXXXX"
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-300 font-medium mb-1 block">Secret Access Key</label>
                      <input
                        type="password"
                        value={mailConfig.awsSes.secretAccessKey}
                        onChange={(e) =>
                          setMailConfig({
                            ...mailConfig,
                            awsSes: { ...mailConfig.awsSes, secretAccessKey: e.target.value },
                          })
                        }
                        placeholder="••••••••••••••••"
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Test Recipient Email */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Diagnostic Test Recipient Email:
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={mailConfig.testRecipientEmail || ''}
                    onChange={(e) => setMailConfig({ ...mailConfig, testRecipientEmail: e.target.value })}
                    placeholder="mustafaattamim@gmail.com"
                    className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={handleTestMailConnection}
                    disabled={isTestingMail}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-xl border border-cyan-500/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingMail ? 'animate-spin' : ''}`} />
                    <span>{isTestingMail ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>
              </div>

              {/* Connection Test Output */}
              {mailTestResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-1 animate-in fade-in ${
                    mailTestResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 font-bold">
                    {mailTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>
                      {mailTestResult.success
                        ? `Connection Verified: ${mailTestResult.provider}`
                        : `Mail Provider Error: ${mailTestResult.error}`}
                    </span>
                  </div>
                  {mailTestResult.details && (
                    <p className="text-[11px] opacity-90 font-mono mt-1">{mailTestResult.details}</p>
                  )}
                  {mailTestResult.messageId && (
                    <p className="text-[10px] text-slate-400 font-mono">
                      Message ID: {mailTestResult.messageId}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsMailConfigOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMailConfig}
                disabled={isSavingMailConfig}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingMailConfig ? 'Saving Config...' : 'Save Mail Settings'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* One-Click Direct Dispatch Modal */}
      {isDispatchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    One-Click Outreach Email Dispatcher
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                      Via {mailConfig.activeProvider.toUpperCase()}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Send this response draft directly to a prospect via your active mail provider. Automatically marks the lead as Approved & Sent.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDispatchOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Select Target Prospect Lead */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Select Target Prospect Lead:
                </label>
                <select
                  value={dispatchLeadId}
                  onChange={(e) => handleLeadSelectChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500 font-medium"
                >
                  <option value="custom">✏️ Custom Recipient Entry</option>
                  {leadsQueue.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      [{lead.status}] {lead.name} — {lead.company || lead.email} ({lead.solutionOfInterest})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Prospect Name:</label>
                  <input
                    type="text"
                    value={dispatchRecipientName}
                    onChange={(e) => setDispatchRecipientName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Prospect Email Address *</label>
                  <input
                    type="email"
                    required
                    value={dispatchRecipientEmail}
                    onChange={(e) => setDispatchRecipientEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Email Subject Line *</label>
                <input
                  type="text"
                  required
                  value={dispatchSubject}
                  onChange={(e) => setDispatchSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Email Body Draft *</label>
                <textarea
                  rows={7}
                  required
                  value={dispatchBody}
                  onChange={(e) => setDispatchBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs p-3 rounded-xl focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
                />
              </div>

              {/* Delivery Receipt Result */}
              {dispatchSuccessReceipt && (
                <div className="bg-emerald-500/10 border border-emerald-500/40 p-4 rounded-xl text-emerald-300 space-y-2 animate-in fade-in">
                  <div className="flex items-center space-x-2 font-bold text-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>{dispatchSuccessReceipt.message}</span>
                  </div>
                  <div className="text-[11px] space-y-0.5 text-slate-300 font-mono bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                    <p>Provider: {dispatchSuccessReceipt.provider}</p>
                    <p>Message ID: {dispatchSuccessReceipt.messageId}</p>
                    <p>Details: {dispatchSuccessReceipt.details}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsDispatchOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleExecuteOneClickDispatch}
                disabled={isDispatching}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                <SendHorizontal className={`w-4 h-4 ${isDispatching ? 'animate-spin' : ''}`} />
                <span>{isDispatching ? 'Sending via Gateway...' : `Send Email via ${mailConfig.activeProvider.toUpperCase()}`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
