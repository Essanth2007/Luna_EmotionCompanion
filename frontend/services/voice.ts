// Frontend voice service — wired to the Luna backend (/analysis/voice).

import { api } from './api';

// Voice Analysis Types
export interface VoiceAnalysisResult {
  id: string;
  emotions: {
    primary: string;
    confidence: number;
    all: { emotion: string; score: number }[];
  };
  stress: { level: number; severity: 'low' | 'moderate' | 'high' };
  anxiety: { level: number; severity: 'low' | 'moderate' | 'high' };
  depression: { level: number; severity: 'low' | 'moderate' | 'high' };
  recommendations: string[];
  timestamp: string;
}

export interface VoiceRecordingData {
  audioFile: File;
  duration: number;
}

interface AnalysisResponse {
  id?: number;
  primary_emotion?: string;
  confidence?: number;
  emotion_distribution?: Record<string, number>;
  face_detected?: boolean | null;
}

function severity(level: number): 'low' | 'moderate' | 'high' {
  if (level < 0.34) return 'low';
  if (level < 0.67) return 'moderate';
  return 'high';
}

function derive(result: AnalysisResponse): VoiceAnalysisResult {
  const dist = result.emotion_distribution || {};
  const all = Object.entries(dist).map(([emotion, score]) => ({ emotion, score }));
  const primary = result.primary_emotion || 'neutral';
  const confidence = result.confidence ?? 0;

  const anxious = dist['anxious'] || dist['fearful'] || 0;
  const angry = dist['angry'] || 0;
  const sad = dist['sad'] || 0;
  const calm = dist['calm'] || 0;
  const happy = dist['happy'] || 0;

  const stress = Math.min(1, anxious * 0.6 + angry * 0.4);
  const anxiety = Math.min(1, anxious);
  const depression = Math.min(1, sad * 0.7 + (1 - happy) * 0.3);

  const recommendations = buildRecommendations(primary, confidence);

  return {
    id: String(result.id ?? Date.now()),
    emotions: { primary, confidence, all },
    stress: { level: Number(stress.toFixed(2)), severity: severity(stress) },
    anxiety: { level: Number(anxiety.toFixed(2)), severity: severity(anxiety) },
    depression: { level: Number(depression.toFixed(2)), severity: severity(depression) },
    recommendations,
    timestamp: new Date().toISOString(),
  };
}

function buildRecommendations(primary: string, confidence: number): string[] {
  const base = `Your voice reads as primarily "${primary}" (${Math.round(confidence * 100)}% confidence).`;
  const map: Record<string, string[]> = {
    calm: ['Your tone suggests a calm, settled state — a great baseline to build on.'],
    happy: ['Your voice carries positive energy. Lean into what is going well today.'],
    sad: ['Your tone sounds low. Consider a gentle walk or reaching out to someone you trust.'],
    angry: ['There is tension in your voice. A few slow breaths may help settle it.'],
    anxious: ['Your speech has an anxious quality. Try a grounding exercise: name 5 things you can see.'],
    fearful: ['Your voice suggests fear. You are safe in this moment — try the 4-7-8 breathing technique.'],
    neutral: ['Your tone is neutral. Check in with yourself about what you need right now.'],
  };
  return [base, ...(map[primary] || map.neutral)];
}

// Voice Service
export const voiceService = {
  // Analyze Voice
  analyzeVoice: async (data: VoiceRecordingData) => {
    const form = new FormData();
    form.append('file', data.audioFile);
    const res = await api.post<AnalysisResponse>('/analysis/voice', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { data: derive(res.data), error: null };
  },

  // Get Voice Analysis History
  getHistory: async () => {
    const res = await api.get('/emotions', { params: { limit: 500 } });
    const history = (res.data || [])
      .filter((e: any) => e.note === 'voice')
      .map((e: any) => ({
        id: String(e.id),
        emotions: { primary: e.emotion, confidence: e.intensity / 10, all: [] },
        stress: { level: 0, severity: 'low' as const },
        anxiety: { level: 0, severity: 'low' as const },
        depression: { level: 0, severity: 'low' as const },
        recommendations: [],
        timestamp: e.created_at,
      }));
    return { data: history, error: null };
  },

  // Delete Voice Analysis
  deleteAnalysis: async (id: string) => {
    await api.delete(`/emotions/${id}`);
    return { data: null, error: null };
  },
};
