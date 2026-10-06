export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  createdAt?: number;
  isStreaming?: boolean;
  suggestedFollowUps?: string[];
  toolCard?: {
    type: 'lead_form' | 'meeting_scheduler' | 'roi_calculator' | 'proposal_builder' | 'comparison_matrix' | 'knowledge_navigator';
    data?: any;
  };
  attachments?: Array<{
    url: string;
    name: string;
    size?: number;
    mimeType?: string;
  }>;
  citations?: Array<{
    title: string;
    url: string;
    snippet?: string;
  }>;
  feedback?: 'positive' | 'negative' | null;
  editedAt?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
  model?: string;
  persona?: string;
  isPinned?: boolean;
  leadSynced?: boolean;
  crmSynced?: boolean;
}

export interface AssistantPersona {
  id: string;
  name: string;
  role: string;
  description: string;
  systemPrompt: string;
  icon: string;
}

export interface ChatbotConfig {
  botName: string;
  botTitle: string;
  greeting: string;
  enabled: boolean;
  autoOpenDelay: number;
}

export interface ChatbotWidgetSize {
  width: number;
  height: number;
}
