import React from 'react';
import { Keyboard, X } from 'lucide-react';
import { chatStrings } from './strings';

interface ChatShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatShortcutsModal: React.FC<ChatShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Cmd / Ctrl + K', label: chatStrings.shortcuts.toggleWidget },
    { key: 'Cmd / Ctrl + N', label: chatStrings.shortcuts.newChat },
    { key: 'Esc', label: chatStrings.shortcuts.closeWidget },
    { key: 'Enter', label: 'Send Message' },
    { key: 'Shift + Enter', label: 'New Line in Message' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm rounded-2xl bg-[var(--chat-surface)] border border-[var(--chat-border)] p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--chat-border)]">
          <div className="flex items-center space-x-2">
            <Keyboard className="w-4 h-4 text-cyan-500" />
            <h3 className="text-sm font-semibold text-[var(--chat-text)]">
              {chatStrings.shortcuts.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--chat-text-muted)] hover:text-[var(--chat-text)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--chat-bg)] border border-[var(--chat-border)] text-xs"
            >
              <span className="text-[var(--chat-text-muted)]">{sc.label}</span>
              <kbd className="px-2 py-0.5 rounded-lg bg-[var(--chat-surface-hover)] border border-[var(--chat-border)] text-[var(--chat-text)] font-mono text-[11px] font-semibold">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
