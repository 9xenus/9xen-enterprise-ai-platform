import { useState, useEffect, useMemo, useCallback } from 'react';
import { ChatSession, ChatMessage } from '../types';
import { chatStrings } from '../strings';

const STORAGE_KEY_SESSIONS = '9xen_chat_sessions_v2';

export function generateUniqueId(prefix: string = 'id'): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function generateChatTitle(firstMessageText: string): string {
  if (!firstMessageText) return 'New Consultation';
  const text = firstMessageText.trim().replace(/^["']|["']$/g, '');
  const lower = text.toLowerCase();

  if (lower.includes('agentic') || lower.includes('nexus') || lower.includes('core')) {
    return 'Agentic Core Architecture';
  }
  if (lower.includes('reguletter') || lower.includes('compliance') || lower.includes('sec')) {
    return 'Reguletter Compliance Audit';
  }
  if (lower.includes('trading') || lower.includes('quant') || lower.includes('alphabot')) {
    return 'AlphaBot Quant Strategy';
  }
  if (lower.includes('real estate') || lower.includes('property')) {
    return 'Real Estate AI Integration';
  }
  if (lower.includes('synthia') || lower.includes('fine-tun') || lower.includes('dataset')) {
    return 'Synthia Fine-Tuning Suite';
  }
  if (lower.includes('price') || lower.includes('cost') || lower.includes('proposal')) {
    return 'Enterprise Pricing & Proposal';
  }

  const words = text.split(' ').slice(0, 5).join(' ');
  return words.length > 32 ? words.slice(0, 32) + '...' : words;
}

export function useChatSessions(greeting?: string) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // 2-Way Session Reconciliation Algorithm
  useEffect(() => {
    const reconcileSessions = async () => {
      let localSessions: ChatSession[] = [];
      let localActiveId: string | null = null;

      try {
        const localRaw = localStorage.getItem(STORAGE_KEY_SESSIONS);
        if (localRaw) {
          const parsed = JSON.parse(localRaw);
          localSessions = parsed.sessions || (Array.isArray(parsed) ? parsed : []);
          localActiveId = parsed.activeSessionId || null;
        }
      } catch (e) {
        console.warn('Failed to parse local chat sessions:', e);
      }

      let remoteSessions: ChatSession[] = [];
      try {
        const res = await fetch('/api/assistant/sessions');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            remoteSessions = data;
          }
        }
      } catch (e) {
        console.warn('Failed to fetch remote chat sessions from backend:', e);
      }

      const sessionMap = new Map<string, ChatSession>();

      for (const rSess of remoteSessions) {
        if (rSess && rSess.id) {
          sessionMap.set(rSess.id, rSess);
        }
      }

      const localOnlyToSync: ChatSession[] = [];
      for (const lSess of localSessions) {
        if (!lSess || !lSess.id) continue;
        const existingRemote = sessionMap.get(lSess.id);
        if (!existingRemote) {
          sessionMap.set(lSess.id, lSess);
          localOnlyToSync.push(lSess);
        } else {
          const remoteUpdated = existingRemote.updatedAt || 0;
          const localUpdated = lSess.updatedAt || 0;
          const remoteMsgs = existingRemote.messages?.length || 0;
          const localMsgs = lSess.messages?.length || 0;

          if (localUpdated > remoteUpdated || (localUpdated === remoteUpdated && localMsgs > remoteMsgs)) {
            sessionMap.set(lSess.id, lSess);
            localOnlyToSync.push(lSess);
          }
        }
      }

      let mergedList = Array.from(sessionMap.values());

      if (mergedList.length === 0) {
        const defaultMsg: ChatMessage = {
          id: 'welcome',
          role: 'assistant',
          content: greeting || chatStrings.welcomeFallback,
          timestamp: 'Online',
          suggestedFollowUps: chatStrings.defaultFollowUps,
        };
        const defaultSession: ChatSession = {
          id: 'session-default',
          title: 'New Consultation',
          messages: [defaultMsg],
          updatedAt: Date.now(),
          model: '9xen-omni-2.5',
          persona: 'standard',
          isPinned: false,
        };
        mergedList = [defaultSession];
      }

      mergedList.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      });

      setSessions(mergedList);

      const targetActiveId =
        localActiveId && mergedList.some((s) => s.id === localActiveId)
          ? localActiveId
          : mergedList[0].id;
      setActiveSessionId(targetActiveId);

      for (const sessToSync of localOnlyToSync) {
        try {
          await fetch('/api/assistant/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sessToSync),
          });
        } catch (syncErr) {
          console.warn('Failed sync of local session to backend:', syncErr);
        }
      }
    };

    reconcileSessions();
  }, [greeting]);

  // Save active sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      try {
        localStorage.setItem(
          STORAGE_KEY_SESSIONS,
          JSON.stringify({ sessions, activeSessionId })
        );
      } catch (e) {
        console.warn('Failed to save chat sessions to localStorage:', e);
      }
    }
  }, [sessions, activeSessionId]);

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || sessions[0];
  }, [sessions, activeSessionId]);

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const query = searchQuery.toLowerCase().trim();
    return sessions.filter((s) => {
      if (s.title.toLowerCase().includes(query)) return true;
      return s.messages.some((m) => m.content.toLowerCase().includes(query));
    });
  }, [sessions, searchQuery]);

  const createNewSession = useCallback(
    (model: string = '9xen-omni-2.5', persona: string = 'standard') => {
      const id = generateUniqueId('session');
      const newMsg: ChatMessage = {
        id: generateUniqueId('welcome'),
        role: 'assistant',
        content: greeting || chatStrings.welcomeFallback,
        timestamp: 'Just now',
        suggestedFollowUps: chatStrings.defaultFollowUps,
      };
      const newSession: ChatSession = {
        id,
        title: 'New Consultation',
        messages: [newMsg],
        updatedAt: Date.now(),
        model,
        persona,
        isPinned: false,
      };
      setSessions((prev) => {
        const next = [newSession, ...prev];
        return next.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return b.updatedAt - a.updatedAt;
        });
      });
      setActiveSessionId(id);
      return id;
    },
    [greeting]
  );

  const deleteSession = useCallback(
    async (id: string) => {
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== id);
        if (filtered.length === 0) {
          const fallbackMsg: ChatMessage = {
            id: 'welcome',
            role: 'assistant',
            content: greeting || chatStrings.welcomeFallback,
            timestamp: 'Online',
            suggestedFollowUps: chatStrings.defaultFollowUps,
          };
          const fallback: ChatSession = {
            id: 'session-default',
            title: 'New Consultation',
            messages: [fallbackMsg],
            updatedAt: Date.now(),
            model: '9xen-omni-2.5',
            persona: 'standard',
          };
          setActiveSessionId(fallback.id);
          return [fallback];
        } else {
          if (activeSessionId === id) {
            setActiveSessionId(filtered[0].id);
          }
          return filtered;
        }
      });

      try {
        await fetch(`/api/assistant/sessions/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Failed to delete session on backend:', err);
      }
    },
    [activeSessionId, greeting]
  );

  const togglePinSession = useCallback((id: string) => {
    setSessions((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s));
      return updated.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.updatedAt - a.updatedAt;
      });
    });
  }, []);

  const clearAllSessions = useCallback(async () => {
    const fallbackMsg: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: greeting || chatStrings.welcomeFallback,
      timestamp: 'Online',
      suggestedFollowUps: chatStrings.defaultFollowUps,
    };
    const fallbackSession: ChatSession = {
      id: 'session-default',
      title: 'New Consultation',
      messages: [fallbackMsg],
      updatedAt: Date.now(),
      model: '9xen-omni-2.5',
      persona: 'standard',
    };

    setSessions([fallbackSession]);
    setActiveSessionId(fallbackSession.id);
    localStorage.removeItem(STORAGE_KEY_SESSIONS);

    try {
      for (const s of sessions) {
        if (s.id !== 'session-default') {
          await fetch(`/api/assistant/sessions/${s.id}`, { method: 'DELETE' });
        }
      }
    } catch (e) {
      console.warn('Failed to clear sessions on server:', e);
    }
  }, [greeting, sessions]);

  return {
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
  };
}
