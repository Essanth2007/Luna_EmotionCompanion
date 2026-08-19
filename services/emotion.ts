// Frontend service - backend integration will be handled by separate backend team

// Emotion Types
export interface Emotion {
  id: string;
  type: 'happy' | 'calm' | 'anxious' | 'sad' | 'angry' | 'excited';
  intensity: number;
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
  emotionDistribution: {
    [key: string]: number;
  };
}

export interface WeeklyMoodData {
  day: string;
  mood: number;
}

// Emotion Service
export const emotionService = {
  // Log Emotion
  logEmotion: async (data: LogEmotionData) => {
    // Placeholder - replace with actual API call
    // return await handleApiCall(
    //   api.post<ApiResponse<Emotion>>('/emotions', data)
    // );
    
    console.log('Logging emotion:', data);
    return {
      data: {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString(),
      },
      error: null,
    };
  },

  // Get Emotions
  getEmotions: async (params?: { limit?: number; offset?: number }) => {
    // Placeholder - replace with actual API call
    // return await handleApiCall(
    //   api.get<ApiResponse<Emotion[]>>('/emotions', { params })
    // );
    
    console.log('Getting emotions with params:', params);
    return {
      data: [],
      error: null,
    };
  },

  // Get Emotion Statistics
  getStats: async () => {
    // Placeholder - replace with actual API call
    // return await handleApiCall(
    //   api.get<ApiResponse<EmotionStats>>('/emotions/stats')
    // );
    
    console.log('Getting emotion statistics');
    return {
      data: {
        totalCheckIns: 142,
        currentStreak: 7,
        averageMood: 4.2,
        weeklyGoal: 7,
        weeklyProgress: 5,
        emotionDistribution: {
          happy: 35,
          calm: 25,
          anxious: 20,
          sad: 20,
        },
      },
      error: null,
    };
  },

  // Get Weekly Mood Trend
  getWeeklyMood: async () => {
    // Placeholder - replace with actual API call
    // return await handleApiCall(
    //   api.get<ApiResponse<WeeklyMoodData[]>>('/emotions/weekly-mood')
    // );
    
    console.log('Getting weekly mood trend');
    return {
      data: [
        { day: 'Mon', mood: 3.5 },
        { day: 'Tue', mood: 4.0 },
        { day: 'Wed', mood: 3.8 },
        { day: 'Thu', mood: 4.2 },
        { day: 'Fri', mood: 4.5 },
        { day: 'Sat', mood: 4.3 },
        { day: 'Sun', mood: 4.1 },
      ],
      error: null,
    };
  },

  // Delete Emotion
  deleteEmotion: async (id: string) => {
    // Placeholder - replace with actual API call
    // return await handleApiCall(
    //   api.delete<ApiResponse<void>>(`/emotions/${id}`)
    // );
    
    console.log('Deleting emotion:', id);
    return { data: null, error: null };
  },

  // Update Emotion
  updateEmotion: async (id: string, data: Partial<LogEmotionData>) => {
    // Placeholder - replace with actual API call
    // return await handleApiCall(
    //   api.patch<ApiResponse<Emotion>>(`/emotions/${id}`, data)
    // );
    
    console.log('Updating emotion:', id, data);
    return {
      data: {
        id,
        type: data.type || 'happy',
        intensity: data.intensity || 5,
        note: data.note,
        createdAt: new Date().toISOString(),
      },
      error: null,
    };
  },
};
