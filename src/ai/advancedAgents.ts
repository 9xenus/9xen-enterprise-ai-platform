export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  capabilities: string[];
  model: string;
  temperature: number;
  enabled: boolean;
  tools: string[];
}

export const autonomousAgents: AgentConfig[] = [
  {
    id: 'sales-assistant-pro',
    name: 'Autonomous Sales Assistant',
    role: 'sales',
    systemPrompt: `You are an autonomous AI sales representative for 9xen Enterprise AI Platform.
Your goal is to qualify leads, understand pain points, recommend solutions, handle objections,
schedule demos, and guide prospects through the sales funnel autonomously.
Be consultative, value-focused, and compliant. Always collect lead information and track intent.`,
    capabilities: ['lead-qualification', 'product-recommendation', 'objection-handling', 'demo-scheduling', 'crm-updates'],
    model: 'gemini-2.5-pro',
    temperature: 0.3,
    enabled: true,
    tools: ['crm', 'calendar', 'email', 'analytics'],
  },
  {
    id: 'technical-support-agent',
    name: 'Technical Support Agent',
    role: 'support',
    systemPrompt: `You are an autonomous technical support agent for 9xen platform.
Diagnose issues, provide step-by-step solutions, troubleshoot APIs, integrations, deployments.
Escalate complex issues when needed. Maintain knowledge of docs and common issues.
Provide clear, actionable answers.`,
    capabilities: ['troubleshooting', 'documentation', 'api-support', 'debugging', 'escalation'],
    model: 'gemini-2.5-pro',
    temperature: 0.2,
    enabled: true,
    tools: ['knowledge-base', 'logs', 'tickets'],
  },
  {
    id: 'billing-support-agent',
    name: 'Billing Support Agent',
    role: 'billing',
    systemPrompt: `You are an autonomous billing and accounts support agent.
Handle invoices, payments, subscriptions, refunds, upgrades/downgrades, billing disputes.
Access billing data securely. Be accurate about pricing, taxes, payment methods.
Follow compliance and never expose sensitive payment details.`,
    capabilities: ['invoices', 'payments', 'subscriptions', 'refunds', 'pricing'],
    model: 'gemini-2.5-flash',
    temperature: 0.1,
    enabled: true,
    tools: ['billing', 'stripe', 'crm'],
  },
  {
    id: 'chatbot-orchestrator',
    name: 'Omnichannel Chatbot Orchestrator',
    role: 'orchestrator',
    systemPrompt: `You orchestrate conversations between specialized agents. Route queries to the right specialist
(sales, technical, billing) based on intent. Maintain conversation context, handoff smoothly,
and ensure consistent customer experience across all channels.`,
    capabilities: ['intent-classification', 'routing', 'context-management', 'handoff'],
    model: 'gemini-2.5-flash',
    temperature: 0.25,
    enabled: true,
    tools: ['routing', 'memory'],
  },
];

export const getAgentByRole = (role: string): AgentConfig | undefined => {
  return autonomousAgents.find(a => a.role === role || a.id.includes(role));
};
