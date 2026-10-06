import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Bot,
  User,
  Copy,
  Check,
  Edit2,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Paperclip,
  Sparkles,
  FileText,
  Calendar,
  Calculator,
  Grid,
  Compass,
} from 'lucide-react';
import { ChatMessage } from './types';
import { chatStrings } from './strings';
import { ChatLeadForm } from './ChatLeadForm';
import { ChatMeetingScheduler } from './ChatMeetingScheduler';
import { ChatRoiCalculator } from './ChatRoiCalculator';
import { ChatProposalBuilder } from './ChatProposalBuilder';
import { ChatComparisonMatrix } from './ChatComparisonMatrix';
import { ChatKnowledgeNavigator } from './ChatKnowledgeNavigator';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  primaryColor?: string;
  onEditMessage?: (id: string, newText: string) => void;
  onRegenerateMessage?: (id: string) => void;
  onFeedback?: (id: string, feedback: 'positive' | 'negative') => void;
  onSelectFollowUp?: (prompt: string) => void;
  onSelectToolCard?: (type: string, data?: any) => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  primaryColor = '#06b6d4',
  onEditMessage,
  onRegenerateMessage,
  onFeedback,
  onSelectFollowUp,
  onSelectToolCard,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && onEditMessage) {
      onEditMessage(message.id, editText.trim());
      setIsEditing(false);
    }
  };

  const renderToolCard = () => {
    if (!message.toolCard) return null;

    const { type, data } = message.toolCard;

    if (onSelectToolCard) {
      // In full-page view, show a button to expand into side panel
      return (
        <div className="mt-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-[var(--chat-text)]">
              Interactive Tool: {type.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <button
            onClick={() => onSelectToolCard(type, data)}
            className="px-3 py-1 text-xs font-medium rounded-lg text-white bg-cyan-600 hover:bg-cyan-500 transition-colors"
          >
            Open in Workspace
          </button>
        </div>
      );
    }

    // Default inline rendering
    switch (type) {
      case 'lead_form':
        return <ChatLeadForm initialData={data} />;
      case 'meeting_scheduler':
        return <ChatMeetingScheduler initialData={data} />;
      case 'roi_calculator':
        return <ChatRoiCalculator initialData={data} />;
      case 'proposal_builder':
        return <ChatProposalBuilder initialData={data} />;
      case 'comparison_matrix':
        return <ChatComparisonMatrix initialData={data} />;
      case 'knowledge_navigator':
        return <ChatKnowledgeNavigator initialData={data} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`group flex flex-col ${
        isUser ? 'items-end' : 'items-start'
      } space-y-1 my-3 transition-opacity duration-200`}
    >
      <div className={`flex items-start space-x-2.5 max-w-[88%] sm:max-w-[82%] ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-sm ${
            isUser ? 'bg-slate-700' : ''
          }`}
          style={!isUser ? { background: primaryColor } : undefined}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        {/* Message Content Container */}
        <div className="flex flex-col space-y-1 min-w-0">
          <div
            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              isUser
                ? 'bg-cyan-600/20 text-[var(--chat-text)] border border-cyan-500/30 rounded-tr-none'
                : 'bg-[var(--chat-surface)] text-[var(--chat-text)] border border-[var(--chat-border)] rounded-tl-none shadow-sm'
            }`}
          >
            {/* User Edit Mode */}
            {isEditing ? (
              <div className="flex flex-col space-y-2 min-w-[240px]">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2 text-base sm:text-sm rounded-lg bg-[var(--chat-bg)] border border-[var(--chat-border)] text-[var(--chat-text)] focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  rows={3}
                />
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-2.5 py-1 text-xs rounded-lg text-[var(--chat-text-muted)] hover:bg-[var(--chat-surface-hover)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-2.5 py-1 text-xs rounded-lg text-white bg-cyan-600 hover:bg-cyan-500"
                  >
                    Save & Submit
                  </button>
                </div>
              </div>
            ) : (
              <div className="markdown-body prose prose-sm dark:prose-invert max-w-none break-words">
                <ReactMarkdown>{message.content}</ReactMarkdown>

                {message.isStreaming && (
                  <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse align-middle" />
                )}
              </div>
            )}

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-[var(--chat-border)] space-y-1.5">
                {message.attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2 text-xs text-[var(--chat-text-muted)] bg-[var(--chat-bg)] p-2 rounded-lg border border-[var(--chat-border)]"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
                    <span className="truncate max-w-[180px] font-medium">{file.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Inline Tool Cards */}
            {renderToolCard()}
          </div>

          {/* Citations / Sources */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-1.5 p-2 rounded-xl bg-slate-900/40 dark:bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="flex items-center space-x-1.5 font-medium text-cyan-400">
                <ExternalLink className="w-3 h-3" />
                <span>{chatStrings.actions.sourcesAndReferences}</span>
              </div>
              <div className="space-y-1">
                {message.citations.map((cite, idx) => (
                  <a
                    key={idx}
                    href={cite.url}
                    className="block p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors text-[11px]"
                  >
                    <div className="font-semibold text-slate-200">{cite.title}</div>
                    {cite.snippet && <div className="text-slate-400 text-[10px] truncate">{cite.snippet}</div>}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Message Action Toolbar & Timestamps */}
          <div className="flex items-center space-x-2 px-1 text-[11px] text-[var(--chat-text-muted)]">
            <span>{message.timestamp}</span>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
              <button
                onClick={handleCopy}
                aria-label={chatStrings.actions.copyText}
                title={chatStrings.actions.copyText}
                className="p-1 rounded hover:bg-[var(--chat-surface-hover)] text-[var(--chat-text-muted)] hover:text-[var(--chat-text)]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>

              {isUser && onEditMessage && (
                <button
                  onClick={() => setIsEditing(true)}
                  aria-label={chatStrings.actions.editMessage}
                  title={chatStrings.actions.editMessage}
                  className="p-1 rounded hover:bg-[var(--chat-surface-hover)] text-[var(--chat-text-muted)] hover:text-[var(--chat-text)]"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}

              {!isUser && onRegenerateMessage && (
                <button
                  onClick={() => onRegenerateMessage(message.id)}
                  aria-label={chatStrings.actions.regenerate}
                  title={chatStrings.actions.regenerate}
                  className="p-1 rounded hover:bg-[var(--chat-surface-hover)] text-[var(--chat-text-muted)] hover:text-[var(--chat-text)]"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              )}

              {!isUser && onFeedback && (
                <>
                  <button
                    onClick={() => onFeedback(message.id, 'positive')}
                    aria-label={chatStrings.actions.helpful}
                    title={chatStrings.actions.helpful}
                    className={`p-1 rounded hover:bg-[var(--chat-surface-hover)] ${
                      message.feedback === 'positive' ? 'text-emerald-400' : 'text-[var(--chat-text-muted)]'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onFeedback(message.id, 'negative')}
                    aria-label={chatStrings.actions.unhelpful}
                    title={chatStrings.actions.unhelpful}
                    className={`p-1 rounded hover:bg-[var(--chat-surface-hover)] ${
                      message.feedback === 'negative' ? 'text-rose-400' : 'text-[var(--chat-text-muted)]'
                    }`}
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Follow-up Chips */}
      {message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && onSelectFollowUp && (
        <div className="flex flex-wrap gap-1.5 pt-2 pl-9 max-w-[90%]">
          {message.suggestedFollowUps.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => onSelectFollowUp(chip)}
              className="px-2.5 py-1 text-xs font-medium rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 transition-all text-left truncate max-w-[280px]"
            >
              ⚡ {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
