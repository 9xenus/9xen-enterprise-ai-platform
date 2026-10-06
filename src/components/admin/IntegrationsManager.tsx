import React, { useState, useEffect } from 'react';
import { useCms } from '../../context/CmsContext';
import { WebhookConfig } from '../../types/cms';
import { MailProviderConfig, defaultMailConfig } from '../../types/mail';
import {
  Plug,
  Webhook,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Play,
  Code,
  ShieldCheck,
  Trash2,
  Edit3,
  Sliders,
  Mail,
  Plus,
  Search,
  Zap,
  Globe,
  Server,
  Lock,
  MessageSquare,
  Activity,
  Layers,
  ChevronRight,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';

interface Props {
  onSelectTab?: (tab: string) => void;
}

interface WebhookTestResult {
  success: boolean;
  statusCode: number;
  statusText: string;
  latencyMs: number;
  responseSnippet: string;
  url: string;
  type: string;
  error?: string;
}

interface WebhookLogItem {
  id: string;
  action: string;
  target: string;
  targetId: string;
  performedBy: string;
  timestamp: string;
}

const PRESET_INTEGRATIONS = [
  {
    type: 'hubspot',
    name: 'HubSpot CRM',
    category: 'CRM & Marketing',
    description: 'Push high-intent qualified enterprise leads directly into HubSpot Contacts and Deals pipeline.',
    defaultUrl: 'https://api.hubapi.com/crm/v3/objects/contacts',
    docUrl: 'https://developers.hubspot.com/docs/api/crm/contacts',
    recommendedAuth: 'Bearer Private App Access Token',
    badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  },
  {
    type: 'salesforce',
    name: 'Salesforce Sales Cloud',
    category: 'Enterprise CRM',
    description: 'Stream enterprise leads and buying signals to Salesforce Lead & Opportunity objects.',
    defaultUrl: 'https://yourinstance.salesforce.com/services/apexrest/leads',
    docUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/',
    recommendedAuth: 'OAuth 2.0 / Bearer Token',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  {
    type: 'slack',
    name: 'Slack Alerts Channel',
    category: 'Team Messaging',
    description: 'Post immediate real-time Slack channel notifications whenever an enterprise lead scores High Intent (>90%).',
    defaultUrl: 'https://hooks.slack.com/services/T000/B000/XXXX',
    docUrl: 'https://api.slack.com/messaging/webhooks',
    recommendedAuth: 'Incoming Webhook URL (No Token Needed)',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  {
    type: 'discord',
    name: 'Discord Ops Channel',
    category: 'Team Messaging',
    description: 'Dispatch instant embed alerts to Discord executive channels for quant bot trials & institutional inquiries.',
    defaultUrl: 'https://discord.com/api/webhooks/12345/XXXX',
    docUrl: 'https://discord.com/developers/docs/resources/webhook',
    recommendedAuth: 'Discord Webhook URL',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  },
  {
    type: 'zoho',
    name: 'Zoho CRM',
    category: 'CRM',
    description: 'Automate lead ingestion and trigger custom workflows inside Zoho CRM module.',
    defaultUrl: 'https://www.zohoapis.com/crm/v2/Leads',
    docUrl: 'https://www.zoho.com/crm/developer/docs/api/v2/',
    recommendedAuth: 'Zoho OAuth Bearer Token',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  },
  {
    type: 'zapier',
    name: 'Zapier Automation',
    category: 'Workflow Automation',
    description: 'Connect 9xen lead qualification events to 6,000+ business applications via Catch Hook.',
    defaultUrl: 'https://hooks.zapier.com/hooks/catch/123456/abcdef/',
    docUrl: 'https://zapier.com/help/create/code-webhooks',
    recommendedAuth: 'Secret Header / Webhook URL',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  {
    type: 'make',
    name: 'Make (Integromat)',
    category: 'Workflow Automation',
    description: 'Trigger complex multi-branch enterprise automation scenarios in Make when high-intent leads arrive.',
    defaultUrl: 'https://hook.eu1.make.com/xxxxxxxxxxxxxxxx',
    docUrl: 'https://www.make.com/en/help/tools/webhooks',
    recommendedAuth: 'Make Custom Webhook URL',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  },
  {
    type: 'custom',
    name: 'Custom Enterprise REST API',
    category: 'Internal Gateway',
    description: 'Deliver HMAC-signed JSON payloads to proprietary internal VPC endpoints, microservices, or Kafka bridges.',
    defaultUrl: 'https://api.yourcompany.com/v1/leads/ingest',
    docUrl: '#',
    recommendedAuth: 'X-9xen-Signature / Bearer Token',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  },
];

export const IntegrationsManager: React.FC<Props> = () => {
  const { cmsData, updateCmsData, saveCmsData } = useCms();

  // Active view tab
  const [activeTab, setActiveTab] = useState<'endpoints' | 'presets' | 'mail' | 'schema' | 'logs'>('endpoints');

  // Webhook State
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Form State for Webhook Modal
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formType, setFormType] = useState<WebhookConfig['type']>('custom');
  const [formDescription, setFormDescription] = useState('');
  const [formSecretToken, setFormSecretToken] = useState('');
  const [formCustomHeaders, setFormCustomHeaders] = useState('');

  // Live Test Dispatch State
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<WebhookTestResult | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Delivery Logs
  const [logs, setLogs] = useState<WebhookLogItem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Mail Provider Integration State
  const [mailConfig, setMailConfig] = useState<MailProviderConfig>(
    cmsData.settings?.mailProviderConfig || defaultMailConfig
  );
  const [isSavingMail, setIsSavingMail] = useState(false);
  const [isTestingMail, setIsTestingMail] = useState(false);
  const [mailTestResult, setMailTestResult] = useState<{
    success: boolean;
    messageId?: string;
    provider?: string;
    details?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    fetchWebhooks();
    fetchLogs();
    fetchMailConfig();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const getAdminAuthToken = () => {
    return localStorage.getItem('9xen_admin_token') || sessionStorage.getItem('9xen_admin_token') || 'demo_admin_jwt_token_2026';
  };

  const fetchWebhooks = async () => {
    setIsLoading(true);
    try {
      const token = getAdminAuthToken();
      const res = await fetch('/api/admin/webhooks', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setWebhooks(data);
      }
    } catch (err) {
      console.error('Failed to fetch webhooks', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const token = getAdminAuthToken();
      const res = await fetch('/api/admin/webhooks/logs', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch webhook logs', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const fetchMailConfig = async () => {
    try {
      const token = getAdminAuthToken();
      const res = await fetch('/api/admin/mail-config', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setMailConfig(data.config);
        }
      }
    } catch (err) {
      console.error('Failed to fetch mail config', err);
    }
  };

  // Open Create Webhook Modal
  const handleOpenCreate = (preset?: typeof PRESET_INTEGRATIONS[0]) => {
    setEditingWebhook(null);
    setFormName(preset ? `${preset.name} Webhook` : '');
    setFormUrl(preset ? preset.defaultUrl : '');
    setFormType((preset?.type as any) || 'custom');
    setFormDescription(preset ? preset.description : '');
    setFormIsActive(true);
    setFormSecretToken('');
    setFormCustomHeaders('');
    setTestResult(null);
    setIsModalOpen(true);
  };

  // Open Edit Webhook Modal
  const handleOpenEdit = (webhook: WebhookConfig) => {
    setEditingWebhook(webhook);
    setFormName(webhook.name);
    setFormUrl(webhook.url);
    setFormType(webhook.type);
    setFormDescription(webhook.description || '');
    setFormIsActive(webhook.isActive);
    setFormSecretToken(webhook.secretToken || '');
    setFormCustomHeaders(webhook.customHeaders || '');
    setTestResult(null);
    setIsModalOpen(true);
  };

  // Save Webhook
  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = getAdminAuthToken();
      const res = await fetch('/api/admin/webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          id: editingWebhook?.id,
          name: formName,
          url: formUrl,
          isActive: formIsActive,
          type: formType,
          description: formDescription,
          secretToken: formSecretToken,
          customHeaders: formCustomHeaders,
        }),
      });

      if (res.ok) {
        showToast(`Webhook "${formName}" successfully saved!`);
        setIsModalOpen(false);
        await fetchWebhooks();
        await fetchLogs();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(`Failed: ${errData.error || 'Server error'}`);
      }
    } catch (err: any) {
      showToast(`Error: ${err.message || 'Could not save webhook'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Webhook
  const handleDeleteWebhook = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete webhook integration "${name}"?`)) {
      try {
        const token = getAdminAuthToken();
        const res = await fetch(`/api/admin/webhooks/${id}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          showToast(`Deleted webhook "${name}".`);
          fetchWebhooks();
          fetchLogs();
        }
      } catch (err) {
        showToast('Failed to delete webhook.');
      }
    }
  };

  // Toggle Active State
  const handleToggleActive = async (webhook: WebhookConfig) => {
    try {
      const token = getAdminAuthToken();
      const res = await fetch('/api/admin/webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...webhook,
          isActive: !webhook.isActive,
        }),
      });
      if (res.ok) {
        showToast(`Webhook ${!webhook.isActive ? 'activated' : 'paused'}.`);
        fetchWebhooks();
      }
    } catch (err) {
      showToast('Error updating webhook status.');
    }
  };

  // Send Test Ping
  const handleTestPing = async (webhookOrUrl: { id?: string; url?: string; type?: string; secretToken?: string; customHeaders?: string }) => {
    setIsSendingTest(true);
    setTestResult(null);
    if (webhookOrUrl.id) {
      setTestingWebhookId(webhookOrUrl.id);
    }
    setIsTestModalOpen(true);

    try {
      const token = getAdminAuthToken();
      const res = await fetch('/api/admin/webhooks/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          id: webhookOrUrl.id,
          url: webhookOrUrl.url,
          type: webhookOrUrl.type || 'custom',
          secretToken: webhookOrUrl.secretToken,
          customHeaders: webhookOrUrl.customHeaders,
        }),
      });

      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        showToast(`Test ping successful: HTTP ${data.statusCode} (${data.latencyMs}ms)`);
      } else {
        showToast(`Test ping failed: HTTP ${data.statusCode} ${data.statusText || ''}`);
      }
      fetchWebhooks();
      fetchLogs();
    } catch (err: any) {
      setTestResult({
        success: false,
        statusCode: 0,
        statusText: 'Network Error',
        latencyMs: 0,
        responseSnippet: err.message || 'Failed connecting to server',
        url: webhookOrUrl.url || '',
        type: webhookOrUrl.type || 'custom',
        error: err.message,
      });
      showToast('Network error during test ping.');
    } finally {
      setIsSendingTest(false);
    }
  };

  // Save Mail Configuration
  const handleSaveMailConfig = async () => {
    setIsSavingMail(true);
    try {
      const token = getAdminAuthToken();
      const res = await fetch('/api/admin/mail-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ config: mailConfig }),
      });
      if (res.ok) {
        showToast(`Mail settings saved! Active Provider: ${mailConfig.activeProvider.toUpperCase()}`);
        updateCmsData({
          settings: {
            ...cmsData.settings,
            mailProviderConfig: mailConfig,
          },
        });
      } else {
        showToast('Failed to save mail configuration.');
      }
    } catch (err) {
      showToast('Error saving mail settings.');
    } finally {
      setIsSavingMail(false);
    }
  };

  // Test Mail Connection
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
        body: JSON.stringify({
          provider: mailConfig.activeProvider,
          config: mailConfig,
          testRecipient: 'admin@9xen.com',
        }),
      });
      const data = await res.json();
      setMailTestResult(data);
      if (data.success) {
        showToast(`Test email packet sent via ${mailConfig.activeProvider.toUpperCase()}!`);
      } else {
        showToast(`Test failed: ${data.error || 'Check credentials'}`);
      }
    } catch (err: any) {
      setMailTestResult({
        success: false,
        error: err.message || 'Connection timeout or network failure',
      });
      showToast('Mail test error.');
    } finally {
      setIsTestingMail(false);
    }
  };

  // Filtered webhooks
  const filteredWebhooks = webhooks.filter((wh) => {
    const matchesSearch =
      wh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wh.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wh.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || wh.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const activeWebhooksCount = webhooks.filter((w) => w.isActive).length;

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-5 py-3.5 rounded-2xl border border-cyan-500/40 shadow-2xl flex items-center gap-3 text-xs backdrop-blur-md animate-in fade-in slide-in-from-bottom-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold">{notification}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400">
                <Plug className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
                  <span>Enterprise Integrations & Webhooks Hub</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    Live Dispatch Engine
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Orchestrate outbound webhook dispatches to CRM systems, team channels (Slack/Discord), and transactional email providers.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                fetchWebhooks();
                fetchLogs();
                showToast('Telemetry refreshed.');
              }}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700/60 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => handleOpenCreate()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Webhook Endpoint</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
              <Webhook className="w-3.5 h-3.5 text-cyan-400" />
              <span>Total Endpoints</span>
            </div>
            <div className="text-xl font-black text-white font-mono mt-1">{webhooks.length}</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Active Dispatchers</span>
            </div>
            <div className="text-xl font-black text-emerald-400 font-mono mt-1">{activeWebhooksCount}</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>Active Mail Provider</span>
            </div>
            <div className="text-xl font-black text-blue-400 font-mono uppercase mt-1">
              {mailConfig.activeProvider}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>HMAC Security</span>
            </div>
            <div className="text-xl font-black text-purple-300 font-mono mt-1">SHA-256</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'endpoints', label: 'Webhook Endpoints', icon: Webhook, count: webhooks.length },
          { id: 'presets', label: '1-Click Presets & CRM Connectors', icon: Layers, count: PRESET_INTEGRATIONS.length },
          { id: 'mail', label: 'Mail Provider Integration', icon: Mail, tag: mailConfig.activeProvider.toUpperCase() },
          { id: 'schema', label: 'Payload Schema & Verification', icon: Code },
          { id: 'logs', label: 'Delivery Audit Logs', icon: Clock, count: logs.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                  {tab.count}
                </span>
              )}
              {tab.tag && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {tab.tag}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: WEBHOOK ENDPOINTS */}
      {activeTab === 'endpoints' && (
        <div className="space-y-4">
          {/* Filter and Search controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search webhooks by name, URL, provider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {['all', 'hubspot', 'salesforce', 'slack', 'discord', 'zoho', 'zapier', 'make', 'custom'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono uppercase transition-all cursor-pointer shrink-0 ${
                    filterType === t
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white bg-slate-950/60'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Webhooks Grid */}
          {filteredWebhooks.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
                <Webhook className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-white font-bold text-sm">No Webhook Endpoints Found</h3>
                <p className="text-xs text-slate-400">
                  {searchTerm || filterType !== 'all'
                    ? 'No webhooks match your search criteria. Try clearing your filters.'
                    : 'Configure outbound webhooks to automatically stream High-Intent leads into your CRM or team channels.'}
                </p>
              </div>
              <button
                onClick={() => handleOpenCreate()}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs inline-flex items-center gap-2 hover:bg-cyan-400 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Webhook</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredWebhooks.map((wh) => (
                <div
                  key={wh.id}
                  className={`p-5 rounded-2xl border transition-all space-y-4 ${
                    wh.isActive
                      ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-950/60 border-slate-800/50 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm">{wh.name}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                          {wh.type}
                        </span>
                        {wh.secretToken && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Auth
                          </span>
                        )}
                      </div>
                      {wh.description && (
                        <p className="text-xs text-slate-400 line-clamp-1">{wh.description}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleTestPing(wh)}
                        disabled={isSendingTest && testingWebhookId === wh.id}
                        title="Dispatch live test ping"
                        className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Test Ping</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(wh)}
                        title="Edit webhook configuration"
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteWebhook(wh.id, wh.name)}
                        title="Delete webhook"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* URL Display */}
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-xs font-mono text-slate-300 truncate select-all">{wh.url}</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(wh.url);
                        showToast('URL copied to clipboard');
                      }}
                      className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                      title="Copy URL"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Telemetry Status Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(wh)}
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                          wh.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {wh.isActive ? '● ACTIVE' : '○ PAUSED'}
                      </button>

                      {wh.lastStatusCode !== undefined && (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            wh.lastStatusCode >= 200 && wh.lastStatusCode < 300
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          HTTP {wh.lastStatusCode}
                        </span>
                      )}

                      {wh.lastLatencyMs !== undefined && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {wh.lastLatencyMs}ms
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono">
                      {wh.lastTestedAt
                        ? `Tested ${new Date(wh.lastTestedAt).toLocaleDateString()} ${new Date(wh.lastTestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : 'Never tested'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: 1-CLICK INTEGRATION PRESETS */}
      {activeTab === 'presets' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex items-start gap-3 text-xs">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-white">Pre-Configured Enterprise Connectors</div>
              <div className="text-slate-300">
                Click any connector below to instantiate an integration template with pre-configured headers, target schemas, and verification guides.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRESET_INTEGRATIONS.map((preset) => (
              <div
                key={preset.type}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-cyan-500/40 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-sm">{preset.name}</h3>
                      <span className="text-[10px] font-mono text-slate-400">{preset.category}</span>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${preset.badgeColor}`}>
                      {preset.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{preset.description}</p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-800/80">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>Recommended Auth:</span>
                    <span className="text-slate-200">{preset.recommendedAuth}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenCreate(preset)}
                      className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Configure Connector</span>
                    </button>
                    {preset.docUrl !== '#' && (
                      <a
                        href={preset.docUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition-all"
                        title="Open Official Documentation"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MAIL PROVIDER INTEGRATION */}
      {activeTab === 'mail' && (
        <div className="space-y-5 bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-cyan-400" />
                <span>Mail Provider Integration (SMTP / Transactional API)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure delivery credentials used by Gemini outreach dispatchers, contact submissions, and lead follow-up flows.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTestMailConnection}
                disabled={isTestingMail}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Play className={`w-3.5 h-3.5 ${isTestingMail ? 'animate-spin' : ''}`} />
                <span>{isTestingMail ? 'Testing...' : 'Send Live Test Email'}</span>
              </button>

              <button
                onClick={handleSaveMailConfig}
                disabled={isSavingMail}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isSavingMail ? 'Saving...' : 'Save Mail Settings'}</span>
              </button>
            </div>
          </div>

          {/* Test Feedback banner */}
          {mailTestResult && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                mailTestResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {mailTestResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-bold">
                  {mailTestResult.success
                    ? 'Mail Provider Connection Successful!'
                    : 'Mail Provider Test Failed'}
                </div>
                <div className="text-[11px] font-mono opacity-90">
                  {mailTestResult.details || mailTestResult.error || (mailTestResult.messageId ? `Message ID: ${mailTestResult.messageId}` : '')}
                </div>
              </div>
            </div>
          )}

          {/* Active Provider Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Select Active Outbound Provider</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { id: 'smtp', label: 'Standard SMTP', desc: 'SendGrid / Mailgun / Postfix' },
                { id: 'sendgrid', label: 'SendGrid API', desc: 'Direct REST v3 API' },
                { id: 'resend', label: 'Resend API', desc: 'Modern Developer Mail' },
                { id: 'ses', label: 'AWS SES', desc: 'Amazon Simple Email' },
                { id: 'postmark', label: 'Postmark API', desc: 'High Deliverability' },
              ].map((p) => {
                const isSelected = mailConfig.activeProvider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setMailConfig({ ...mailConfig, activeProvider: p.id as any })}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs">{p.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">{p.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sender Identity (Global) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Default Sender Email</label>
              <input
                type="email"
                value={mailConfig.senderEmail || ''}
                onChange={(e) => setMailConfig({ ...mailConfig, senderEmail: e.target.value })}
                placeholder="sales@9xen.com"
                className="w-full bg-slate-900 border border-slate-800 text-white text-xs p-2.5 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Default Sender Name</label>
              <input
                type="text"
                value={mailConfig.senderName || ''}
                onChange={(e) => setMailConfig({ ...mailConfig, senderName: e.target.value })}
                placeholder="9xen Institutional Sales"
                className="w-full bg-slate-900 border border-slate-800 text-white text-xs p-2.5 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Test Recipient Email</label>
              <input
                type="email"
                value={mailConfig.testRecipientEmail || ''}
                onChange={(e) => setMailConfig({ ...mailConfig, testRecipientEmail: e.target.value })}
                placeholder="admin@9xen.com"
                className="w-full bg-slate-900 border border-slate-800 text-white text-xs p-2.5 rounded-xl font-mono"
              />
            </div>
          </div>

          {/* Provider Specific Configuration Forms */}
          {mailConfig.activeProvider === 'smtp' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={mailConfig.smtp?.host || ''}
                  onChange={(e) =>
                    setMailConfig({
                      ...mailConfig,
                      smtp: { ...mailConfig.smtp!, host: e.target.value },
                    })
                  }
                  placeholder="smtp.sendgrid.net"
                  className="w-full bg-slate-900 border border-slate-800 text-white text-xs p-2.5 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">SMTP Port</label>
                <input
                  type="number"
                  value={mailConfig.smtp?.port || 587}
                  onChange={(e) =>
                    setMailConfig({
                      ...mailConfig,
                      smtp: { ...mailConfig.smtp!, port: parseInt(e.target.value) || 587 },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 text-white text-xs p-2.5 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Username / API Key</label>
                <input
                  type="text"
                  value={mailConfig.smtp?.user || ''}
                  onChange={(e) =>
                    setMailConfig({
                      ...mailConfig,
                      smtp: { ...mailConfig.smtp!, user: e.target.value },
                    })
                  }
                  placeholder="apikey or username"
                  className="w-full bg-slate-900 border border-slate-800 text-white text-xs p-2.5 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Password / Secret</label>
                <input
                  type="password"
                  value={mailConfig.smtp?.pass || ''}
                  onChange={(e) =>
                    setMailConfig({
                      ...mailConfig,
                      smtp: { ...mailConfig.smtp!, pass: e.target.value },
                    })
                  }
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-800 text-white text-xs p-2.5 rounded-xl"
                />
              </div>
            </div>
          )}

          {mailConfig.activeProvider === 'sendgrid' && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">SendGrid API Key (SG.xxxx)</label>
                <input
                  type="password"
                  value={mailConfig.sendgrid?.apiKey || ''}
                  onChange={(e) =>
                    setMailConfig({
                      ...mailConfig,
                      sendgrid: { ...mailConfig.sendgrid!, apiKey: e.target.value },
                    })
                  }
                  placeholder="SG.xxxxxxxxxxxxxxxx"
                  className="w-full bg-slate-900 border border-slate-800 text-white text-xs p-2.5 rounded-xl font-mono"
                />
              </div>
            </div>
          )}

          {mailConfig.activeProvider === 'resend' && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Resend API Key (re_xxxx)</label>
                <input
                  type="password"
                  value={mailConfig.resend?.apiKey || ''}
                  onChange={(e) =>
                    setMailConfig({
                      ...mailConfig,
                      resend: { ...mailConfig.resend!, apiKey: e.target.value },
                    })
                  }
                  placeholder="re_xxxxxxxxxxxxxxxx"
                  className="w-full bg-slate-900 border border-slate-800 text-white text-xs p-2.5 rounded-xl font-mono"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PAYLOAD SCHEMA & VERIFICATION */}
      {activeTab === 'schema' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">Normalized Outbound Event Payload</h3>
                <p className="text-xs text-slate-400">
                  Exact JSON structure pushed to webhooks when High-Intent leads qualify or when test pings fire.
                </p>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify({
                    event: "lead.qualified",
                    timestamp: "2026-09-08T12:00:00.000Z",
                    source: "9xen Enterprise AI Platform",
                    lead: {
                      id: "lead-001",
                      name: "Alexandra Vance",
                      email: "a.vance@vancecapital.com",
                      company: "Vance Capital Hedge Fund",
                      solution_of_interest: "AlphaBot Pro (Quant Trading Engine)",
                      intent_score: 94,
                      classification_tag: "High Intent",
                      confidence_score: 96,
                      buying_signals: ["Managing $15M AUM", "Requires sub-1.8ms FIX 4.4 protocol"],
                      suggested_action: "Schedule Executive Demo & provision MT5 demo bridge",
                      sentiment: "Urgent / High Value",
                      aum_or_budget: "$15,000,000 AUM",
                      user_message: "We manage $15M AUM across Forex & Crypto pairs."
                    }
                  }, null, 2));
                  setCopiedPayload(true);
                  setTimeout(() => setCopiedPayload(false), 2000);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
              >
                {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPayload ? 'Copied' : 'Copy Schema'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
{`{
  "event": "lead.qualified",
  "timestamp": "2026-09-08T12:00:00.000Z",
  "crm_provider": "hubspot | salesforce | custom",
  "lead": {
    "id": "lead-001",
    "name": "Alexandra Vance",
    "email": "a.vance@vancecapital.com",
    "company": "Vance Capital Hedge Fund",
    "solution_of_interest": "AlphaBot Pro (Quant Trading Engine)",
    "intent_score": 94,
    "classification_tag": "High Intent",
    "confidence_score": 96,
    "buying_signals": [
      "Managing $15M AUM",
      "Requires sub-1.8ms FIX 4.4 protocol"
    ],
    "suggested_action": "Schedule Executive Demo & provision MT5 demo bridge",
    "sentiment": "Urgent / High Value",
    "aum_or_budget": "$15,000,000 AUM",
    "user_message": "We manage $15M AUM across Forex & Crypto pairs. Need sub-1.8ms FIX protocol access.",
    "submitted_at": "2026-09-08T11:45:00.000Z"
  }
}`}
            </pre>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-purple-400" />
              <span>HTTP Headers & Cryptographic Verification</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every outbound webhook request includes security headers to prevent forgery and enable zero-trust validation on your recipient server:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="text-[11px] font-mono text-purple-400 font-bold">X-9xen-Signature</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  SHA-256 HMAC digest generated from the lead identifier or configured Secret Token.
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="text-[11px] font-mono text-purple-400 font-bold">Authorization: Bearer &lt;Token&gt;</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Forwarded when a Secret Token is configured for the endpoint.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DELIVERY AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Webhook Delivery Audit Trail</h3>
              <p className="text-xs text-slate-400">Chronological history of webhook test pings and lead dispatches recorded in DuckDB.</p>
            </div>
            <button
              onClick={fetchLogs}
              disabled={isLoadingLogs}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
              <span>Refresh Logs</span>
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
              No webhook dispatch activity logged yet. Fire a test ping or qualify a high-intent lead to see live entries.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60 font-mono text-[11px]">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Target Endpoint</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {logs.map((log) => {
                    const isSuccess = log.action.includes('success');
                    return (
                      <tr key={log.id} className="hover:bg-slate-800/30">
                        <td className="p-3 text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isSuccess
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 text-cyan-300">{log.targetId}</td>
                        <td className="p-3 text-slate-300 font-sans max-w-md truncate">
                          {log.performedBy}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT WEBHOOK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleSaveWebhook}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-xl space-y-4 shadow-2xl relative"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Webhook className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {editingWebhook ? 'Edit Webhook Integration' : 'Add New Webhook Integration'}
                  </h3>
                  <div className="text-[10px] text-slate-400">Configure outbound HTTP endpoint parameters</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Integration Name</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Production Salesforce Leads Hook"
                className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Provider Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="custom">Custom REST API</option>
                  <option value="hubspot">HubSpot CRM</option>
                  <option value="salesforce">Salesforce Sales Cloud</option>
                  <option value="slack">Slack Alerts Channel</option>
                  <option value="discord">Discord Ops Channel</option>
                  <option value="zoho">Zoho CRM</option>
                  <option value="zapier">Zapier Catch Hook</option>
                  <option value="make">Make (Integromat)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description / Notes (Optional)</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Routes Quant bot inquiries to trading desk"
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Target Webhook URL</label>
              <input
                type="url"
                required
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://api.yourcompany.com/v1/webhooks/leads"
                className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Authorization / Secret Token (Optional)
              </label>
              <input
                type="password"
                value={formSecretToken}
                onChange={(e) => setFormSecretToken(e.target.value)}
                placeholder="Sent as Authorization: Bearer <token> & X-Webhook-Secret"
                className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Custom Headers JSON (Optional)
              </label>
              <input
                type="text"
                value={formCustomHeaders}
                onChange={(e) => setFormCustomHeaders(e.target.value)}
                placeholder='{"X-Custom-Env": "production", "X-Team": "Institutional"}'
                className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="formIsActiveCheckbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="rounded border-slate-800 text-cyan-500 focus:ring-cyan-500"
              />
              <label htmlFor="formIsActiveCheckbox" className="text-xs text-slate-300 font-semibold cursor-pointer">
                Active (Trigger on qualified High-Intent leads)
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (!formUrl) {
                    showToast('Please enter a Webhook URL first.');
                    return;
                  }
                  handleTestPing({
                    url: formUrl,
                    type: formType,
                    secretToken: formSecretToken,
                    customHeaders: formCustomHeaders,
                  });
                }}
                disabled={!formUrl || isSendingTest}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Test Live Connection</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{editingWebhook ? 'Save Changes' : 'Create Webhook'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* LIVE TEST RESULT MODAL */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Webhook Live Test Console</h3>
                  <div className="text-[10px] text-slate-400">Verifying target endpoint latency and status response</div>
                </div>
              </div>

              <button
                onClick={() => setIsTestModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {isSendingTest ? (
              <div className="p-8 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                <div className="text-xs text-slate-300 font-semibold">Dispatching verification packet...</div>
                <div className="text-[11px] text-slate-500 font-mono">Measuring round-trip handshake latency</div>
              </div>
            ) : testResult ? (
              <div className="space-y-3">
                <div
                  className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                    testResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <div className="space-y-1 w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">
                        {testResult.success ? 'HTTP 200 OK — Webhook Verified' : 'Dispatch Failed / Unreachable'}
                      </span>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-slate-900/60 border border-current">
                        {testResult.latencyMs}ms
                      </span>
                    </div>
                    <div className="text-[11px] font-mono opacity-80 break-all">{testResult.url}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-slate-400">Server Response Snippet:</div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {testResult.responseSnippet || (testResult.success ? '{"status": "ok"}' : testResult.error)}
                  </pre>
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Console
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
