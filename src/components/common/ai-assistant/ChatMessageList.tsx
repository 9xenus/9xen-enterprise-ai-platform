import React, { useRef, useEffect } from 'react';
import { ChatMessage } from './types';
import { ChatMessageBubble } from './ChatMessageBubble';
import { Bot, ShieldCheck } from 'lucide-react';
import { chatStrings } from './strings';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  primaryColor?: string;
  leadSynced?: boolean;
  onEditMessage?: (id: string, newText: string) => void;
  onRegenerateMessage?: (id: string) => void;
  onFeedback?: (id: string, feedback: 'positive' | 'negative') => void;
  onSelectFollowUp?: (prompt: string) => void;
  onSelectToolCard?: (type: string, data?: any) => void;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isTyping,
  primaryColor = '#06b6d4',
  leadSynced = false,
  onEditMessage,
  onRegenerateMessage,
  onFeedback,
  onSelectFollowUp,
  onSelectToolCard,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div
      ref={containerRef}
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
      className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[var(--chat-bg)]"
    >
      {/* Lead Synced Escalation Banner */}
      {leadSynced && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2.5 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>{chatStrings.actions.humanHandoffNotice}</span>
        </div>
      )}

      {/* Render Messages */}
      {messages.map((msg) => (
        <ChatMessageBubble
          key={msg.id}
          message={msg}
          primaryColor={primaryColor}
          onEditMessage={onEditMessage}
          onRegenerateMessage={onRegenerateMessage}
          onFeedback={onFeedback}
          onSelectFollowUp={onSelectFollowUp}
          onSelectToolCard={onSelectToolCard}
        />
      ))}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex items-center space-x-2 my-2 pl-1">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-sm"
            style={{ background: primaryColor }}
          >
            <Bot className="w-4 h-4" />
          </div>
          <div className="px-3.5 py-2.5 rounded-2xl bg-[var(--chat-surface)] border border-[var(--chat-border)] flex items-center space-x-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.32s]" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.16s]" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
          </div>
        </div>
      )}
    </div>
  );
};
