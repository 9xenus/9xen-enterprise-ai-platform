import React from 'react';
import {
  Plus,
  Search,
  Pin,
  Trash2,
  MessageSquare,
  X,
  Keyboard,
  ShieldCheck,
} from 'lucide-react';
import { ChatSession } from './types';
import { chatStrings } from './strings';

interface ChatSessionSidebarProps {
  sessions: ChatSession[];
  filteredSessions?: ChatSession[];
  activeSessionId: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectSession: (id: string) => void;
  onNewSession?: () => void;
  onNewChat?: () => void;
  onDeleteSession: (id: string) => void;
  onTogglePinSession?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onClearAllSessions?: () => void;
  onClearAll?: () => void;
  onCloseSidebar?: () => void;
  onOpenShortcutsModal?: () => void;
  onOpenShortcuts?: () => void;
  primaryColor?: string;
}

export const ChatSessionSidebar: React.FC<ChatSessionSidebarProps> = ({
  sessions,
  filteredSessions,
  activeSessionId,
  searchQuery,
  setSearchQuery,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onTogglePinSession,
  onClearAllSessions,
  onCloseSidebar,
  onOpenShortcutsModal,
  primaryColor = '#06b6d4',
}) => {
  const displayList = filteredSessions || sessions;
  const pinnedSessions = displayList.filter((s) => s.isPinned);
  const recentSessions = displayList.filter((s) => !s.isPinned);

  return (
    <div className="flex flex-col h-full bg-[var(--chat-surface)] border-r border-[var(--chat-border)] w-full sm:w-72 transition-colors select-none">
      {/* Sidebar Header */}
      <div className="p-3 border-b border-[var(--chat-border)] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-cyan-500" />
          <span className="text-xs font-semibold text-[var(--chat-text)] uppercase tracking-wider">
            {chatStrings.sessionSidebar.title}
          </span>
        </div>
        <button
          onClick={onCloseSidebar}
          aria-label="Close session list"
          className="p-1 rounded-lg text-[var(--chat-text-muted)] hover:text-[var(--chat-text)] hover:bg-[var(--chat-surface-hover)] min-w-[36px] min-h-[36px] flex items-center justify-center sm:hidden"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* New Consultation Button */}
      <div className="p-3">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-white font-medium text-xs shadow-md transition-all hover:opacity-95 focus-visible:ring-2 focus-visible:ring-cyan-500"
          style={{ background: primaryColor }}
        >
          <Plus className="w-4 h-4" />
          <span>{chatStrings.sessionSidebar.newChat}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--chat-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={chatStrings.sessionSidebar.searchPlaceholder}
            className="w-full pl-8 pr-3 py-1.5 text-base sm:text-xs rounded-xl bg-[var(--chat-bg)] border border-[var(--chat-border)] text-[var(--chat-text)] placeholder-[var(--chat-text-muted)] focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
        {pinnedSessions.length > 0 && (
          <div>
            <div className="px-2 py-1 text-[10px] font-semibold text-[var(--chat-text-muted)] uppercase tracking-wider flex items-center space-x-1">
              <Pin className="w-3 h-3 text-amber-400" />
              <span>{chatStrings.sessionSidebar.pinnedSection}</span>
            </div>
            <div className="space-y-1 mt-1">
              {pinnedSessions.map((s) => (
                <SessionItem
                  key={s.id}
                  session={s}
                  isActive={s.id === activeSessionId}
                  onSelect={() => onSelectSession(s.id)}
                  onDelete={() => onDeleteSession(s.id)}
                  onTogglePin={() => onTogglePinSession(s.id)}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          {pinnedSessions.length > 0 && (
            <div className="px-2 py-1 text-[10px] font-semibold text-[var(--chat-text-muted)] uppercase tracking-wider">
              {chatStrings.sessionSidebar.recentSection}
            </div>
          )}
          <div className="space-y-1 mt-1">
            {recentSessions.length > 0 ? (
              recentSessions.map((s) => (
                <SessionItem
                  key={s.id}
                  session={s}
                  isActive={s.id === activeSessionId}
                  onSelect={() => onSelectSession(s.id)}
                  onDelete={() => onDeleteSession(s.id)}
                  onTogglePin={() => onTogglePinSession(s.id)}
                />
              ))
            ) : (
              <div className="px-3 py-4 text-center text-xs text-[var(--chat-text-muted)]">
                {chatStrings.sessionSidebar.noSessionsFound}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-2 border-t border-[var(--chat-border)] flex items-center justify-between text-xs text-[var(--chat-text-muted)]">
        <button
          onClick={onOpenShortcutsModal}
          className="flex items-center space-x-1 px-2 py-1 rounded-lg hover:text-[var(--chat-text)] hover:bg-[var(--chat-surface-hover)] transition-colors min-h-[36px]"
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span className="text-[11px]">{chatStrings.sessionSidebar.keyboardShortcuts}</span>
        </button>

        <button
          onClick={onClearAllSessions}
          className="px-2 py-1 rounded-lg text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors min-h-[36px]"
        >
          <span className="text-[11px]">{chatStrings.sessionSidebar.clearAll}</span>
        </button>
      </div>
    </div>
  );
};

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

const SessionItem: React.FC<SessionItemProps> = ({
  session,
  isActive,
  onSelect,
  onDelete,
  onTogglePin,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
        isActive
          ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-medium border border-cyan-500/20'
          : 'text-[var(--chat-text)] hover:bg-[var(--chat-surface-hover)]'
      }`}
    >
      <div className="flex items-center space-x-2 min-w-0 pr-12">
        <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="truncate">{session.title}</span>
      </div>

      <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          aria-label={session.isPinned ? 'Unpin session' : 'Pin session'}
          className={`p-1 rounded hover:bg-[var(--chat-surface-hover)] ${
            session.isPinned ? 'text-amber-400' : 'text-[var(--chat-text-muted)]'
          }`}
        >
          <Pin className="w-3 h-3" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Delete session"
          className="p-1 rounded hover:bg-rose-500/20 text-[var(--chat-text-muted)] hover:text-rose-400"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
