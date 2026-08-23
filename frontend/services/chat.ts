// Frontend chat service — wired to the Luna backend (conversations + AI replies).

import { api } from './api';

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  emotion?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageData {
  message: string;
  sessionId?: string;
}

export interface SuggestedPrompt {
  id: string;
  text: string;
  category: string;
}

const CONV_KEY = 'luna_conversation_id';

function getConvId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CONV_KEY);
}
function setConvId(id: string) {
  if (typeof window !== 'undefined') localStorage.setItem(CONV_KEY, id);
}

interface BackendMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}
interface BackendConversation {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  messages?: BackendMessage[];
}

function toMessage(m: BackendMessage): ChatMessage {
  return {
    id: String(m.id),
    role: m.role,
    content: m.content,
    timestamp: m.created_at,
  };
}

async function ensureConversation(): Promise<string> {
  const existing = getConvId();
  if (existing) return existing;
  const res = await api.post<BackendConversation>('/conversations', {
    title: 'Luna chat',
  });
  setConvId(String(res.data.id));
  return String(res.data.id);
}

export const chatService = {
  // Send Message — creates/uses a conversation and returns the AI reply.
  sendMessage: async (data: SendMessageData) => {
    try {
      const convId = await ensureConversation();
      const res = await api.post<{
        conversation_id: number;
        user_message: BackendMessage;
        assistant_message: BackendMessage;
      }>(`/conversations/${convId}/messages`, { content: data.message });
      return { data: toMessage(res.data.assistant_message), error: null };
    } catch (err) {
      const message =
        (err as any)?.response?.data?.detail || (err as any)?.message || 'Message failed';
      return { data: null, error: message };
    }
  },

  // Get Chat Sessions
  getSessions: async () => {
    const res = await api.get<BackendConversation[]>('/conversations');
    const data = res.data.map((c) => ({
      id: String(c.id),
      title: c.title,
      messages: [],
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));
    return { data, error: null };
  },

  // Get Chat Session by ID
  getSession: async (sessionId: string) => {
    const res = await api.get<BackendConversation>(`/conversations/${sessionId}`);
    return {
      data: {
        id: String(res.data.id),
        title: res.data.title,
        messages: (res.data.messages || []).map(toMessage),
        createdAt: res.data.created_at,
        updatedAt: res.data.updated_at,
      },
      error: null,
    };
  },

  // Delete Chat Session
  deleteSession: async (sessionId: string) => {
    await api.delete(`/conversations/${sessionId}`);
    if (getConvId() === sessionId) {
      if (typeof window !== 'undefined') localStorage.removeItem(CONV_KEY);
    }
    return { data: null, error: null };
  },

  // Get Suggested Prompts (static — backend has no endpoint for this yet)
  getSuggestedPrompts: async () => {
    return {
      data: [
        { id: '1', text: 'How are you feeling today?', category: 'check-in' },
        { id: '2', text: 'What made you smile today?', category: 'positive' },
        { id: '3', text: 'What\'s been on your mind lately?', category: 'reflection' },
        { id: '4', text: 'I\'m feeling anxious', category: 'emotion' },
        { id: '5', text: 'I need someone to talk to', category: 'support' },
        { id: '6', text: 'Help me relax', category: 'wellness' },
      ] as SuggestedPrompt[],
      error: null,
    };
  },

  // Create New Session
  createSession: async (title?: string) => {
    const res = await api.post<BackendConversation>('/conversations', {
      title: title || 'New conversation',
    });
    setConvId(String(res.data.id));
    return {
      data: {
        id: String(res.data.id),
        title: res.data.title,
        messages: [],
        createdAt: res.data.created_at,
        updatedAt: res.data.updated_at,
      },
      error: null,
    };
  },
};
