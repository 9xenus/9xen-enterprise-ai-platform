import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Mic, MicOff, Paperclip, Loader2, X } from 'lucide-react';
import { chatStrings } from './strings';
import { useVoiceInput } from './hooks/useVoiceInput';

interface ChatComposerProps {
  onSendMessage: (text: string, attachments?: Array<{ url: string; name: string; size?: number; mimeType?: string }>) => void;
  isTyping: boolean;
  onStopGenerating: () => void;
  primaryColor?: string;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSendMessage,
  isTyping,
  onStopGenerating,
  primaryColor = '#06b6d4',
}) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Array<{ url: string; name: string; size?: number; mimeType?: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isListening, toggleVoiceInput, hasVoiceSupport } = useVoiceInput((transcript) => {
    setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
  });

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [inputText]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && attachments.length === 0) return;

    onSendMessage(inputText, attachments.length > 0 ? attachments : undefined);
    setInputText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload/public', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAttachments((prev) => [
          ...prev,
          {
            url: data.url || URL.createObjectURL(file),
            name: file.name,
            size: file.size,
            mimeType: file.type,
          },
        ]);
      } else {
        // Fallback preview URL
        setAttachments((prev) => [
          ...prev,
          {
            url: URL.createObjectURL(file),
            name: file.name,
            size: file.size,
            mimeType: file.type,
          },
        ]);
      }
    } catch (err) {
      console.warn('File upload notice, using local file preview:', err);
      setAttachments((prev) => [
        ...prev,
        {
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          mimeType: file.type,
        },
      ]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-3 border-t border-[var(--chat-border)] bg-[var(--chat-surface)] transition-colors">
      {/* Pending Attachments */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[var(--chat-bg)] border border-[var(--chat-border)] text-xs text-[var(--chat-text)]"
            >
              <Paperclip className="w-3 h-3 text-cyan-500" />
              <span className="truncate max-w-[140px] font-medium">{file.name}</span>
              <button
                type="button"
                onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                className="p-0.5 rounded hover:bg-red-500/20 text-red-400"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative flex items-end space-x-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />

        {/* File Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || isTyping}
          aria-label={chatStrings.composer.attachFile}
          title={chatStrings.composer.attachFile}
          className="p-2.5 rounded-xl text-[var(--chat-text-muted)] hover:text-[var(--chat-text)] hover:bg-[var(--chat-surface-hover)] transition-all min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin text-cyan-500" /> : <Paperclip className="w-5 h-5" />}
        </button>

        {/* Text Area Input with text-base on mobile to prevent iOS Safari auto-zoom */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? chatStrings.composer.stopVoice : chatStrings.composer.placeholder}
            rows={1}
            className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl bg-[var(--chat-bg)] border border-[var(--chat-border)] text-[var(--chat-text)] placeholder-[var(--chat-text-muted)] focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none max-h-[120px] transition-all"
          />
        </div>

        {/* Voice Input Button */}
        {hasVoiceSupport && (
          <button
            type="button"
            onClick={toggleVoiceInput}
            aria-label={isListening ? chatStrings.composer.stopVoice : chatStrings.composer.startVoice}
            title={isListening ? chatStrings.composer.stopVoice : chatStrings.composer.startVoice}
            className={`p-2.5 rounded-xl transition-all min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0 focus-visible:ring-2 focus-visible:ring-cyan-500 ${
              isListening
                ? 'bg-rose-500/20 text-rose-500 animate-pulse border border-rose-500/30'
                : 'text-[var(--chat-text-muted)] hover:text-[var(--chat-text)] hover:bg-[var(--chat-surface-hover)]'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        )}

        {/* Send or Stop Button */}
        {isTyping ? (
          <button
            type="button"
            onClick={onStopGenerating}
            aria-label={chatStrings.composer.stopGenerating}
            title={chatStrings.composer.stopGenerating}
            className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 border border-rose-500/30 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0 focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!inputText.trim() && attachments.length === 0}
            aria-label={chatStrings.composer.send}
            title={chatStrings.composer.send}
            className="p-2.5 rounded-xl text-white transition-all min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed shadow-md focus-visible:ring-2 focus-visible:ring-cyan-500"
            style={{ background: primaryColor }}
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </form>
    </div>
  );
};
