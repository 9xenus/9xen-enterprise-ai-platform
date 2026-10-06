import { db } from '../lib/db';
import { autonomousAgents, getAgentByRole } from '../ai/advancedAgents';
import { GoogleGenAI } from '@google/genai';
import { knowledgeBase } from './knowledgeBase';

export class AutonomousChatbot {
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
  }

  async classifyIntent(message: string): Promise<{ role: string; confidence: number }> {
    const lower = message.toLowerCase();
    if (lower.includes('bill') || lower.includes('invoice') || lower.includes('payment') || lower.includes('subscription') || lower.includes('refund')) {
      return { role: 'billing', confidence: 0.9 };
    }
    if (lower.includes('bug') || lower.includes('error') || lower.includes('api') || lower.includes('deploy') || lower.includes('support') || lower.includes('tech')) {
      return { role: 'support', confidence: 0.9 };
    }
    if (lower.includes('buy') || lower.includes('price') || lower.includes('demo') || lower.includes('trial') || lower.includes('sales') || lower.includes('lead')) {
      return { role: 'sales', confidence: 0.9 };
    }
    return { role: 'orchestrator', confidence: 0.5 };
  }

  async handleMessage(sessionId: string, message: string, userContext: any = {}): Promise<string> {
    if (!this.ai) {
      const intent = await this.classifyIntent(message);
      const agent = getAgentByRole(intent.role) || autonomousAgents[0];
      return `[${agent.name}] I'm running in demo mode. Your message was classified as ${intent.role} intent. Connect GEMINI_API_KEY for full autonomous responses.`;
    }

    const intent = await this.classifyIntent(message);
    let agent = getAgentByRole(intent.role) || autonomousAgents[3];
    if (intent.role === 'orchestrator') {
      agent = autonomousAgents[3];
    }

    try {
      const history = await db.getChatSessions();
      const session = (history || []).find((s: any) => s.sessionId === sessionId) || { messages: [], userEmail: userContext.email };

      const kbContext = knowledgeBase.buildContext(message);
      const enhancedPrompt = kbContext ? agent.systemPrompt + '\n\n' + kbContext : agent.systemPrompt;
      const messages = [
        { role: 'system' as const, content: enhancedPrompt },
        ...(session.messages || []).slice(-10).map((m: any) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: message },
      ];

      const resp = await this.ai.models.generateContent({
        model: agent.model,
        contents: messages.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
        config: { temperature: agent.temperature },
      });

      const response = resp.text || 'I need more context to assist you.';

      const updated = [
        ...(session.messages || []),
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: response, timestamp: new Date().toISOString() },
      ];

      await db.saveChatSession({
        id: session.id || `chat-${sessionId}`,
        sessionId,
        userEmail: session.userEmail || userContext.email,
        userName: userContext.name,
        messages: updated,
        status: 'active',
        context: { ...userContext, routedTo: agent.role },
      });

      return response;
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  }
}

export const autonomousChatbot = new AutonomousChatbot();
