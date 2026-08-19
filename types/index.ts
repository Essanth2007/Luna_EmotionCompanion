// ─── User & Auth ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  moodStreak: number;
  wellnessScore: number;
  joinDate: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    language: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── Emotion ─────────────────────────────────────────────────────────────────

export type EmotionType = 'happy' | 'calm' | 'anxious' | 'sad' | 'angry' | 'excited' | 'neutral';

export interface Emotion {
  id: string;
  type: EmotionType;
  intensity: number;
  note?: string;
  createdAt: string;
}

export interface EmotionResult {
  primary: EmotionType;
  confidence: number;
  all: Array<{ emotion: string; score: number }>;
}

// ─── Voice Analysis ───────────────────────────────────────────────────────────

export interface VoiceAnalysis {
  id: string;
  emotions: EmotionResult;
  stress:     { level: number; severity: 'low' | 'moderate' | 'high' };
  anxiety:    { level: number; severity: 'low' | 'moderate' | 'high' };
  depression: { level: number; severity: 'low' | 'moderate' | 'high' };
  recommendations: string[];
  timestamp: string;
}

// ─── Video Analysis ───────────────────────────────────────────────────────────

export interface VideoAnalysis {
  id: string;
  emotions: EmotionResult & {
    timeline: Array<{ timestamp: number; emotion: string; confidence: number }>;
  };
  facialExpressions: Record<string, number>;
  recommendations: string[];
  timestamp: string;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  emotion?: string;
}

// ─── Journal ──────────────────────────────────────────────────────────────────

export interface JournalEntry {
  id: string;
  mood: string;
  moodIntensity: number;
  content: string;
  tags: string[];
  lunaReflection?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Report ───────────────────────────────────────────────────────────────────

export interface Report {
  wellnessScore: number;
  aiSummary: string;
  weekly: {
    moodTrend: Array<{ day: string; mood: number }>;
    emotionDistribution: Array<{ emotion: string; count: number; percentage: number }>;
  };
  monthly: {
    moodTrend: Array<{ week: string; mood: number }>;
    emotionDistribution: Array<{ emotion: string; count: number; percentage: number }>;
  };
  stressTrend:     Array<{ date: string; level: number }>;
  depressionTrend: Array<{ date: string; level: number }>;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: 'reminder' | 'analysis' | 'motivation' | 'journal' | 'call' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

// ─── Call ─────────────────────────────────────────────────────────────────────

export type CallType   = 'audio' | 'video';
export type CallStatus =
  | 'idle'
  | 'outgoing'
  | 'incoming'
  | 'connecting'
  | 'connected'
  | 'ended'
  | 'missed'
  | 'rejected'
  | 'error'
  | 'reconnecting';

export interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
}

export interface Call {
  callId:   string;
  callerId: string;
  receiverId: string;
  type: CallType;
  status: CallStatus;
  startedAt?: string;
  endedAt?:   string;
  duration?:  number; // seconds
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  iceCandidates?: RTCIceCandidateInit[];
}

export interface CallHistoryEntry {
  id: string;
  type: CallType;
  participant: CallParticipant;
  status: 'answered' | 'missed' | 'rejected';
  startedAt: string;
  duration?: number;
}
