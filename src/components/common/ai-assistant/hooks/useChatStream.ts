import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChatMessage, ChatSession } from '../types';
import { generateUniqueId } from './useChatSessions';

interface UseChatStreamOptions {
  activeSessionId: string;
  sessions: ChatSession[];
  setSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
}

export function useChatStream({
  activeSessionId,
  sessions,
  setSessions,
}: UseChatStreamOptions) {
  const [isTyping, setIsTyping] = useState(false);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
  }, []);

  const stopGenerating = useCallback(() => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    setIsTyping(false);

    // Mark current streaming message as finished
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        return {
          ...s,
          messages: s.messages.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)),
        };
      })
    );
  }, [activeSessionId, setSessions]);

  const handleSendMessage = useCallback(
    async (textToSend: string, attachments?: Array<{ url: string; name: string; size?: number; mimeType?: string }>) => {
      const text = textToSend.trim();
      if ((!text && (!attachments || attachments.length === 0)) || isTyping) return;

      const userMsg: ChatMessage = {
        id: generateUniqueId('msg-user'),
        role: 'user',
        content: text || (attachments ? `Attached file: ${attachments[0].name}` : ''),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: Date.now(),
        attachments: attachments && attachments.length > 0 ? attachments : undefined,
      };

      const targetSessionId = activeSessionId;

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== targetSessionId) return s;
          const nextMsgs = [...s.messages, userMsg];
          return {
            ...s,
            updatedAt: Date.now(),
            messages: nextMsgs,
          };
        })
      );

      setIsTyping(true);

      const activeSess = sessions.find((s) => s.id === targetSessionId);
      const currentMsgs = activeSess ? [...activeSess.messages, userMsg] : [userMsg];

      try {
        const history = currentMsgs
          .filter((m) => m.id !== 'welcome' && !m.id.startsWith('welcome-'))
          .map((m) => ({
            role: m.role,
            content: m.content,
          }));

        const responseId = generateUniqueId('msg-ai');

        // Create the streaming placeholder message up front.
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== targetSessionId) return s;
            return {
              ...s,
              updatedAt: Date.now(),
              messages: [
                ...s.messages,
                {
                  id: responseId,
                  role: 'assistant',
                  content: '',
                  isStreaming: true,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  createdAt: Date.now(),
                },
              ],
            };
          })
        );

        // Use the SSE streaming endpoint powered by the LangGraph deep agent.
        const res = await fetch('/api/assistant/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text || 'Analyzed uploaded document spec.',
            history,
            model: activeSess?.model || '9xen-omni-2.5',
          }),
        });

        if (!res.ok || !res.body) {
          throw new Error('Failed to fetch reply');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';
        let followUps: string[] = [];
        let citations: Array<{ title: string; url: string; snippet?: string }> = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (let li = 0; li < lines.length; li++) {
            const line = lines[li];
            if (!line.startsWith('event:')) continue;
            const event = line.slice(6).trim();
            const dataLine = lines[li + 1] || '';
            if (!dataLine.startsWith('data:')) continue;
            const data = JSON.parse(dataLine.slice(5));

            if (event === 'chunk') {
              fullContent = data.content;
              setSessions((prev) =>
                prev.map((s) => {
                  if (s.id !== targetSessionId) return s;
                  return {
                    ...s,
                    updatedAt: Date.now(),
                    messages: s.messages.map((m) =>
                      m.id === responseId ? { ...m, content: fullContent } : m
                    ),
                  };
                })
              );
            } else if (event === 'done') {
              fullContent = data.reply || fullContent;
              followUps = data.followUps || [];
              citations = data.citations || [];
            } else if (event === 'error') {
              throw new Error(data.error || 'Agent error');
            }
          }
        }

        // Finalize the message.
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== targetSessionId) return s;
            return {
              ...s,
              updatedAt: Date.now(),
              messages: s.messages.map((m) =>
                m.id === responseId
                  ? { ...m, content: fullContent, isStreaming: false, suggestedFollowUps: followUps, citations }
                  : m
              ),
            };
          })
        );
        setIsTyping(false);
      } catch (err) {
        console.error(err);
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        const errorMsg: ChatMessage = {
          id: generateUniqueId('msg-err'),
          role: 'assistant',
          content:
            'Our enterprise intelligence cluster is currently handling high volume. Please transmit your requirement via the Contact page or email us directly at contact@9xen.com.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: Date.now(),
        };
        setSessions((prev) =>
          prev.map((s) => (s.id === targetSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s))
        );
        setIsTyping(false);
      }
    },
    [activeSessionId, isTyping, sessions, setSessions]
  );

  const editUserMessage = useCallback(
    async (messageId: string, newText: string) => {
      const activeSess = sessions.find((s) => s.id === activeSessionId);
      if (!activeSess) return;

      const msgIndex = activeSess.messages.findIndex((m) => m.id === messageId);
      if (msgIndex === -1) return;

      // Truncate messages after edited message
      const truncatedMessages = activeSess.messages.slice(0, msgIndex);
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? { ...s, messages: truncatedMessages } : s))
      );

      // Re-send edited message
      await handleSendMessage(newText);
    },
    [activeSessionId, handleSendMessage, sessions, setSessions]
  );

  const regenerateAssistantMessage = useCallback(
    async (assistantMsgId: string) => {
      const activeSess = sessions.find((s) => s.id === activeSessionId);
      if (!activeSess) return;

      const msgIndex = activeSess.messages.findIndex((m) => m.id === assistantMsgId);
      if (msgIndex === -1) return;

      // Find preceding user message
      const precedingUserMsg = activeSess.messages.slice(0, msgIndex).reverse().find((m) => m.role === 'user');
      if (!precedingUserMsg) return;

      // Truncate from the user message
      const userIndex = activeSess.messages.findIndex((m) => m.id === precedingUserMsg.id);
      const truncatedMessages = activeSess.messages.slice(0, userIndex);

      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? { ...s, messages: truncatedMessages } : s))
      );

      await handleSendMessage(precedingUserMsg.content, precedingUserMsg.attachments);
    },
    [activeSessionId, handleSendMessage, sessions, setSessions]
  );

  const handleMessageFeedback = useCallback(
    async (messageId: string, feedback: 'positive' | 'negative') => {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSessionId) return s;
          return {
            ...s,
            messages: s.messages.map((m) => (m.id === messageId ? { ...m, feedback } : m)),
          };
        })
      );

      try {
        await fetch('/api/admin/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'chat_message_feedback',
            messageId,
            feedback,
            sessionId: activeSessionId,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.warn('Telemetry feedback log failed:', err);
      }
    },
    [activeSessionId, setSessions]
  );

  return {
    isTyping,
    handleSendMessage,
    stopGenerating,
    editUserMessage,
    regenerateAssistantMessage,
    handleMessageFeedback,
  };
}
