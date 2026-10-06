import React from 'react';
import {
  Bot,
  Sparkles,
  History,
  Download,
  Settings,
  Maximize2,
  Minimize2,
  X,
  Keyboard,
  Sun,
  Moon,
  ShieldCheck,
} from 'lucide-react';
import { chatStrings } from './strings';

interface ChatHeaderProps {
  botName?: string;
  botTitle?: string;
  primaryColor?: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  showSidebar: boolean;
  onToggleSidebar: () => void;
  onOpenExport: () => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  onClose: () => void;
  isFullPage?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  botName,
  botTitle,
  primaryColor = '#06b6d4',
  theme,
  onToggleTheme,
  showSidebar,
  onToggleSidebar,
  onOpenExport,
  onOpenSettings,
  onOpenShortcuts,
  isFullScreen,
  onToggleFullScreen,
  onClose,
  isFullPage = false,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--chat-border)] bg-[var(--chat-surface)] transition-colors select-none">
      <div className="flex items-center space-x-3 min-w-0">
        <div className="relative flex-shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, #3b82f6)`,
              boxShadow: `0 0 15px ${primaryColor}40`,
            }}
          >
            <Bot className="w-5 h-5" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[var(--chat-surface)] rounded-full animate-pulse" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-[var(--chat-text)] truncate">
              {botName || chatStrings.header.botNameDefault}
            </h3>
            <span
              className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
            >
              {chatStrings.header.versionBadge}
            </span>
          </div>
          <p className="text-xs text-[var(--chat-text-muted)] truncate flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500 flex-shrink-0" />
            <span>{botTitle || chatStrings.header.botTitleDefault}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-1.5">
        <button
          onClick={onToggleSidebar}
          aria-label={chatStrings.header.recentConversations}
          title={chatStrings.header.recentConversations}
          className={`p-2 rounded-xl text-[var(--chat-text-muted)] hover:text-[var(--chat-text)] hover:bg-[var(--chat-surface-hover)] transition-all min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-cyan-500 ${
            showSidebar ? 'bg-[var(--chat-surface-hover)] text-cyan-500' : ''
          }`}
        >
          <History className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenExport}
          aria-label={chatStrings.header.exportChat}
          title={chatStrings.header.exportChat}
          className="p-2 rounded-xl text-[var(--chat-text-muted)] hover:text-[var(--chat-text)] hover:bg-[var(--chat-surface-hover)] transition-all min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenShortcuts}
          aria-label={chatStrings.shortcuts.title}
          title={chatStrings.shortcuts.title}
          className="hidden sm:flex p-2 rounded-xl text-[var(--chat-text-muted)] hover:text-[var(--chat-text)] hover:bg-[var(--chat-surface-hover)] transition-all min-w-[40px] min-h-[40px] items-center justify-center focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          aria-label={chatStrings.header.systemSettings}
          title={chatStrings.header.systemSettings}
          className="p-2 rounded-xl text-[var(--chat-text-muted)] hover:text-[var(--chat-text)] hover:bg-[var(--chat-surface-hover)] transition-all min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="p-2 rounded-xl text-[var(--chat-text-muted)] hover:text-[var(--chat-text)] hover:bg-[var(--chat-surface-hover)] transition-all min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>

        {!isFullPage && (
          <>
            <button
              onClick={onToggleFullScreen}
              aria-label={isFullScreen ? chatStrings.header.exitFullScreen : chatStrings.header.fullScreen}
              title={isFullScreen ? chatStrings.header.exitFullScreen : chatStrings.header.fullScreen}
              className="p-2 rounded-xl text-[var(--chat-text-muted)] hover:text-[var(--chat-text)] hover:bg-[var(--chat-surface-hover)] transition-all min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              aria-label={chatStrings.header.closeWidget}
              title={chatStrings.header.closeWidget}
              className="p-2 rounded-xl text-[var(--chat-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
