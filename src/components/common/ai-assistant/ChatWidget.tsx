import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, X } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useCms } from '../../../context/CmsContext';
import { useChatSessions } from './hooks/useChatSessions';
import { useChatStream } from './hooks/useChatStream';
import { chatStrings } from './strings';
import { ChatHeader } from './ChatHeader';
import { ChatMessageList } from './ChatMessageList';
import { ChatComposer } from './ChatComposer';
import { ChatSessionSidebar } from './ChatSessionSidebar';
import { ChatExportMenu } from './ChatExportMenu';
import { ChatSettingsPanel } from './ChatSettingsPanel';
import { ChatShortcutsModal } from './ChatShortcutsModal';

interface ChatWidgetProps {
  initialOpen?: boolean;
  botName?: string;
  botTitle?: string;
  greeting?: string;
  onSelectToolCard?: (type: string, data?: any) => void;
  isFullPage?: boolean;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  initialOpen = false,
  botName,
  botTitle,
  greeting,
  onSelectToolCard,
  isFullPage = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { cmsData } = useCms();

  const primaryColor =
    cmsData.settings?.systemConfig?.primaryColor || '#06b6d4';

  const [isOpen, setIsOpen] = useState(initialOpen || isFullPage);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Saved widget dimensions for desktop resizable mode
  const [widgetSize, setWidgetSize] = useState<{ width: number; height: number }>(() => {
    try {
      const saved = localStorage.getItem('9xen_chat_widget_size');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { width: 480, height: 680 };
  });

  const {
    sessions,
    setSessions,
    activeSessionId,
    setActiveSessionId,
    activeSession,
    searchQuery,
    setSearchQuery,
    filteredSessions,
    createNewSession,
    deleteSession,
    togglePinSession,
    clearAllSessions,
  } = useChatSessions(greeting);

  const {
    isTyping,
    handleSendMessage,
    stopGenerating,
    editUserMessage,
    regenerateAssistantMessage,
    handleMessageFeedback,
  } = useChatStream({
    activeSessionId,
    sessions,
    setSessions,
  });

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        createNewSession();
      } else if (e.key === 'Escape') {
        if (showExportModal) setShowExportModal(false);
        else if (showSettingsModal) setShowSettingsModal(false);
        else if (showShortcutsModal) setShowShortcutsModal(false);
        else if (showSidebar) setShowSidebar(false);
        else if (isOpen && !isFullPage) setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createNewSession, isOpen, isFullPage, showExportModal, showSettingsModal, showShortcutsModal, showSidebar]);

  if (isFullPage) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-[var(--chat-bg)] text-[var(--chat-text)] shadow-xl border-t border-[var(--chat-border)]">
        {/* Left Rail Session Sidebar */}
        <div className="hidden md:block h-full border-r border-[var(--chat-border)]">
          <ChatSessionSidebar
            sessions={filteredSessions}
            activeSessionId={activeSessionId}
            onSelectSession={setActiveSessionId}
            onNewSession={() => createNewSession()}
            onDeleteSession={deleteSession}
            onTogglePinSession={togglePinSession}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onClearAllSessions={clearAllSessions}
            onOpenShortcutsModal={() => setShowShortcutsModal(true)}
            onCloseSidebar={() => setShowSidebar(false)}
            primaryColor={primaryColor}
          />
        </div>

        {/* Center Conversation Area */}
        <div className="flex-1 flex flex-col h-full min-w-0 bg-[var(--chat-bg)]">
          <ChatHeader
            botName={botName}
            botTitle={botTitle}
            primaryColor={primaryColor}
            theme={theme}
            onToggleTheme={toggleTheme}
            showSidebar={showSidebar}
            onToggleSidebar={() => setShowSidebar((prev) => !prev)}
            onOpenExport={() => setShowExportModal(true)}
            onOpenSettings={() => setShowSettingsModal(true)}
            onOpenShortcuts={() => setShowShortcutsModal(true)}
            isFullScreen={true}
            onToggleFullScreen={() => {}}
            onClose={() => {}}
            isFullPage={true}
          />

          <ChatMessageList
            messages={activeSession?.messages || []}
            isTyping={isTyping}
            primaryColor={primaryColor}
            leadSynced={activeSession?.leadSynced || activeSession?.crmSynced}
            onEditMessage={editUserMessage}
            onRegenerateMessage={regenerateAssistantMessage}
            onFeedback={handleMessageFeedback}
            onSelectFollowUp={(prompt) => handleSendMessage(prompt)}
            onSelectToolCard={onSelectToolCard}
          />

          <ChatComposer
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
            onStopGenerating={stopGenerating}
            primaryColor={primaryColor}
          />
        </div>

        {/* Modals */}
        {activeSession && (
          <>
            <ChatExportMenu
              session={activeSession}
              isOpen={showExportModal}
              onClose={() => setShowExportModal(false)}
            />
            <ChatSettingsPanel
              isOpen={showSettingsModal}
              onClose={() => setShowSettingsModal(false)}
              currentModel={activeSession.model}
              currentPersona={activeSession.persona}
              onSaveSettings={(model, persona) => {
                setSessions((prev) =>
                  prev.map((s) => (s.id === activeSessionId ? { ...s, model, persona } : s))
                );
              }}
              primaryColor={primaryColor}
            />
          </>
        )}
        <ChatShortcutsModal
          isOpen={showShortcutsModal}
          onClose={() => setShowShortcutsModal(false)}
        />
      </div>
    );
  }

  return (
    <>
      {/* Floating Trigger Button with safe area padding */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label={chatStrings.header.botNameDefault}
          title={chatStrings.header.botNameDefault}
          className="fixed z-40 flex items-center space-x-2.5 px-4 py-3 rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/25 focus-visible:ring-2 focus-visible:ring-cyan-500"
          style={{
            bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
            right: 'calc(1.5rem + env(safe-area-inset-right, 0px))',
            background: `linear-gradient(135deg, ${primaryColor}, #3b82f6)`,
            boxShadow: `0 10px 30px ${primaryColor}60`,
          }}
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <span className="text-xs font-semibold tracking-wide hidden sm:inline">
            {botName || 'AI Advisor'}
          </span>
        </button>
      )}

      {/* Floating Widget Modal / Responsive Window */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col bg-[var(--chat-bg)] text-[var(--chat-text)] shadow-2xl transition-all duration-300 overflow-hidden ${
            isFullScreen
              ? 'inset-0 w-full h-full rounded-none'
              : 'inset-x-2 bottom-2 top-10 h-[calc(100dvh-3rem)] sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[680px] sm:w-[480px] rounded-2xl border border-[var(--chat-border)]'
          }`}
          style={{
            paddingTop: isFullScreen ? 'env(safe-area-inset-top, 0px)' : undefined,
            paddingBottom: isFullScreen ? 'env(safe-area-inset-bottom, 0px)' : undefined,
          }}
        >
          <div className="relative flex flex-1 h-full overflow-hidden">
            {/* Session Sidebar Drawer */}
            {showSidebar && (
              <div className="absolute inset-y-0 left-0 z-20 w-full sm:w-72 shadow-2xl">
                <ChatSessionSidebar
                  sessions={filteredSessions}
                  activeSessionId={activeSessionId}
                  onSelectSession={(id) => {
                    setActiveSessionId(id);
                    setShowSidebar(false);
                  }}
                  onNewSession={() => {
                    createNewSession();
                    setShowSidebar(false);
                  }}
                  onDeleteSession={deleteSession}
                  onTogglePinSession={togglePinSession}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onClearAllSessions={clearAllSessions}
                  onOpenShortcutsModal={() => setShowShortcutsModal(true)}
                  onCloseSidebar={() => setShowSidebar(false)}
                  primaryColor={primaryColor}
                />
              </div>
            )}

            {/* Main Conversation Container */}
            <div className="flex-1 flex flex-col h-full min-w-0 bg-[var(--chat-bg)]">
              <ChatHeader
                botName={botName}
                botTitle={botTitle}
                primaryColor={primaryColor}
                theme={theme}
                onToggleTheme={toggleTheme}
                showSidebar={showSidebar}
                onToggleSidebar={() => setShowSidebar((prev) => !prev)}
                onOpenExport={() => setShowExportModal(true)}
                onOpenSettings={() => setShowSettingsModal(true)}
                onOpenShortcuts={() => setShowShortcutsModal(true)}
                isFullScreen={isFullScreen}
                onToggleFullScreen={() => setIsFullScreen((prev) => !prev)}
                onClose={() => setIsOpen(false)}
              />

              <ChatMessageList
                messages={activeSession?.messages || []}
                isTyping={isTyping}
                primaryColor={primaryColor}
                leadSynced={activeSession?.leadSynced || activeSession?.crmSynced}
                onEditMessage={editUserMessage}
                onRegenerateMessage={regenerateAssistantMessage}
                onFeedback={handleMessageFeedback}
                onSelectFollowUp={(prompt) => handleSendMessage(prompt)}
                onSelectToolCard={onSelectToolCard}
              />

              <ChatComposer
                onSendMessage={handleSendMessage}
                isTyping={isTyping}
                onStopGenerating={stopGenerating}
                primaryColor={primaryColor}
              />
            </div>
          </div>

          {/* Modals */}
          {activeSession && (
            <>
              <ChatExportMenu
                session={activeSession}
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
              />
              <ChatSettingsPanel
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                currentModel={activeSession.model}
                currentPersona={activeSession.persona}
                onSaveSettings={(model, persona) => {
                  setSessions((prev) =>
                    prev.map((s) => (s.id === activeSessionId ? { ...s, model, persona } : s))
                  );
                }}
                primaryColor={primaryColor}
              />
            </>
          )}
          <ChatShortcutsModal
            isOpen={showShortcutsModal}
            onClose={() => setShowShortcutsModal(false)}
          />
        </div>
      )}
    </>
  );
};
