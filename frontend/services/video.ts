// Frontend video service — wired to the Luna backend (/analysis/video).

import { api } from './api';

// Video Analysis Types
export interface VideoAnalysisResult {
  id: string;
  emotions: {
    primary: string;
    confidence: number;
    timeline: { timestamp: number; emotion: string; confidence: number }[];
  };
  facialExpressions: { [key: string]: number };
  recommendations: string[];
  timestamp: string;
}

export interface VideoRecordingData {
  videoFile: File;
  duration: number;
}

interface AnalysisResponse {
  id?: number;
  primary_emotion?: string;
  confidence?: number;
  emotion_distribution?: Record<string, number>;
  face_detected?: boolean | null;
}

function derive(result: AnalysisResponse): VideoAnalysisResult {
  const dist = result.emotion_distribution || {};
  const primary = result.primary_emotion || 'neutral';
  const confidence = result.confidence ?? 0;

  const facialExpressions: { [key: string]: number } = {};
  for (const [k, v] of Object.entries(dist)) facialExpressions[k] = Number(v.toFixed(2));

  const recommendations = buildRecommendations(primary, confidence, result.face_detected);

  return {
    id: String(result.id ?? Date.now()),
    emotions: {
      primary,
      confidence,
      timeline: [{ timestamp: 0, emotion: primary, confidence }],
    },
    facialExpressions,
    recommendations,
    timestamp: new Date().toISOString(),
  };
}

function buildRecommendations(
  primary: string,
  confidence: number,
  faceDetected?: boolean | null,
): string[] {
  const base = `Your facial expression reads as "${primary}" (${Math.round(confidence * 100)}% confidence).`;
  const map: Record<string, string[]> = {
    calm: ['Your expression is relaxed. A good moment to reflect or plan.'],
    happy: ['A genuine smile — wonderful. Capture what brought this on.'],
    sad: ['Your expression looks down. Be gentle with yourself today.'],
    angry: ['There is tension in your face. Try releasing your jaw and shoulders.'],
    anxious: ['Your face shows worry. A short breathing break can help.'],
    fearful: ['You look fearful. Ground yourself: feel your feet on the floor.'],
    neutral: ['A neutral expression. Notice what you are feeling underneath.'],
    surprised: ['A surprised expression — something caught your attention.'],
    disgusted: ['Aversion shows on your face. Step away from what is bothering you.'],
  };
  const faceNote = faceDetected === false
    ? ['No face was detected in the frame — try a clearer, well-lit photo.']
    : [];
  return [base, ...(map[primary] || map.neutral), ...faceNote];
}

// Video Service
export const videoService = {
  // Analyze Video (image/frame)
  analyzeVideo: async (data: VideoRecordingData) => {
    const form = new FormData();
    form.append('file', data.videoFile);
    const res = await api.post<AnalysisResponse>('/analysis/video', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { data: derive(res.data), error: null };
  },

  // Get Video Analysis History
  getHistory: async () => {
    const res = await api.get('/emotions', { params: { limit: 500 } });
    const history = (res.data || [])
      .filter((e: any) => e.note === 'video')
      .map((e: any) => ({
        id: String(e),
        emotions: {
          primary: e.emotion,
          confidence: e.intensity / 10,
          timeline: [],
        },
        facialExpressions: {},
        recommendations: [],
        timestamp: e.created_at,
      }));
    return { data: history, error: null };
  },

  // Delete Video Analysis
  deleteAnalysis: async (id: string) => {
    await api.delete(`/emotions/${id}`);
    return { data: null, error: null };
  },
};
