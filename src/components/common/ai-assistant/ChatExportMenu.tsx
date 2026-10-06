import React from 'react';
import { Download, FileText, Code, FileCode, Printer, X } from 'lucide-react';
import { ChatSession } from './types';
import { chatStrings } from './strings';

interface ChatExportMenuProps {
  session: ChatSession;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatExportMenu: React.FC<ChatExportMenuProps> = ({ session, isOpen, onClose }) => {
  if (!isOpen) return null;

  const exportAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(session, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `9xen-chat-${session.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onClose();
  };

  const exportAsTxt = () => {
    const textContent = session.messages
      .map((m) => `[${m.timestamp}] ${m.role.toUpperCase()}:\n${m.content}\n`)
      .join('\n----------------------------------------\n\n');
    const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(textContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `9xen-chat-${session.id}.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onClose();
  };

  const exportAsMd = () => {
    const mdContent = `# ${session.title}\n*Exported from 9xen AI Advisor on ${new Date().toLocaleDateString()}*\n\n` +
      session.messages
        .map((m) => `### ${m.role === 'user' ? 'User' : '9xen AI Advisor'} (${m.timestamp})\n${m.content}\n`)
        .join('\n---\n\n');
    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(mdContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `9xen-chat-${session.id}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onClose();
  };

  const printPdf = () => {
    window.print();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm rounded-2xl bg-[var(--chat-surface)] border border-[var(--chat-border)] p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--chat-border)]">
          <div className="flex items-center space-x-2">
            <Download className="w-4 h-4 text-cyan-500" />
            <h3 className="text-sm font-semibold text-[var(--chat-text)]">
              {chatStrings.header.exportChat}
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
          <button
            onClick={exportAsJson}
            className="w-full flex items-center space-x-3 p-3 rounded-xl bg-[var(--chat-bg)] hover:bg-[var(--chat-surface-hover)] border border-[var(--chat-border)] text-left text-xs text-[var(--chat-text)] transition-colors"
          >
            <Code className="w-4 h-4 text-cyan-400" />
            <span>{chatStrings.export.exportJson}</span>
          </button>

          <button
            onClick={exportAsTxt}
            className="w-full flex items-center space-x-3 p-3 rounded-xl bg-[var(--chat-bg)] hover:bg-[var(--chat-surface-hover)] border border-[var(--chat-border)] text-left text-xs text-[var(--chat-text)] transition-colors"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>{chatStrings.export.exportTxt}</span>
          </button>

          <button
            onClick={exportAsMd}
            className="w-full flex items-center space-x-3 p-3 rounded-xl bg-[var(--chat-bg)] hover:bg-[var(--chat-surface-hover)] border border-[var(--chat-border)] text-left text-xs text-[var(--chat-text)] transition-colors"
          >
            <FileCode className="w-4 h-4 text-amber-400" />
            <span>{chatStrings.export.exportMd}</span>
          </button>

          <button
            onClick={printPdf}
            className="w-full flex items-center space-x-3 p-3 rounded-xl bg-[var(--chat-bg)] hover:bg-[var(--chat-surface-hover)] border border-[var(--chat-border)] text-left text-xs text-[var(--chat-text)] transition-colors"
          >
            <Printer className="w-4 h-4 text-purple-400" />
            <span>{chatStrings.export.exportPdf}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
