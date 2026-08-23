// Frontend emotion service — wired to the Luna backend.

import { api } from './api';

// Emotion Types
export interface Emotion {
  id: string;
  type: 'happy' | 'calm' | 'anxious' | 'sad' | 'angry' | 'excited' | 'neutral';
  intensity: number; // 1-10
  note?: string;
  createdAt: string;
}

export interface LogEmotionData {
  type: Emotion['type'];
  intensity: number;
  note?: string;
}

export interface EmotionStats {
  totalCheckIns: number;
  currentStreak: number;
  averageMood: number;
  weeklyGoal: number;
  weeklyProgress: number;
  emotionDistribution: { [key: string]: number };
}

export interface WeeklyMoodData {
  day: string;
  mood: number;
}

interface BackendEmotion {
  id: number;
  user_id: number;
  emotion: string;
  intensity: number;
  note: string | null;
  created_at: string;
}

function toFrontend(e: BackendEmotion): Emotion {
  return {
    id: String(e.id),
    type: e.emotion as Emotion['type'],
    intensity: e.intensity,
    note: e.note ?? undefined,
    createdAt: e.created_at,
  };
}

// Emotion Service
export const emotionService = {
  // Log Emotion
  logEmotion: async (data: LogEmotionData) => {
    const res = await api.post<BackendEmotion>('/emotions', {
      emotion: data.type,
      intensity: data.intensity,
      note: data.note,
    });
    return { data: toFrontend(res.data), error: null };
  },

  // Get Emotions
  getEmotions: async (params?: { limit?: number; offset?: number }) => {
    const res = await api.get<BackendEmotion[]>('/emotions', { params });
    return { data: res.data.map(toFrontend), error: null };
  },

  // Get Emotion Statistics (derived client-side from stored emotions)
  getStats: async () => {
    const res = await api.get<BackendEmotion[]>('/emotions', {
      params: { limit: 500 },
    });
    const emotions = res.data.map(toFrontend);
    const distribution: { [key: string]: number } = {};
    let sum = 0;
    for (const e of emotions) {
      distribution[e.type] = (distribution[e.type] || 0) + 1;
      sum += e.intensity;
    }
    const streak = computeStreak(emotions);
    return {
      data: {
        totalCheckIns: emotions.length,
        currentStreak: streak,
        averageMood: emotions.length ? Number((sum / emotions.length).toFixed(1)) : 0,
        weeklyGoal: 7,
        weeklyProgress: Math.min(streak, 7),
        emotionDistribution: distribution,
      },
      error: null,
    };
  },

  // Get Weekly Mood Trend (derived client-side)
  getWeeklyMood: async () => {
    const res = await api.get<BackendEmotion[]>('/emotions', {
      params: { limit: 500 },
    });
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const byDay: number[][] = days.map(() => []);
    for (const e of res.data) {
      const d = new Date(e.created_at).getDay();
      byDay[d].push(e.intensity);
    }
    const weekly = days.map((day, i) => ({
      day,
      mood: byDay[i].length
        ? Number((byDay[i].reduce((a, b) => a + b, 0) / byDay[i].length).toFixed(1))
        : 0,
    }));
    return { data: weekly, error: null };
  },

  // Delete Emotion
  deleteEmotion: async (id: string) => {
    await api.delete(`/emotions/${id}`);
    return { data: null, error: null };
  },
};

function computeStreak(emotions: Emotion[]): number {
  if (!emotions.length) return 0;
  const days = new Set(
    emotions.map((e) => new Date(e.createdAt).toISOString().slice(0, 10)),
  );
  let streak = 0;
  const d = new Date();
  for (;;) {
    const key = d.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak += 1;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}
