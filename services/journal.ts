// Frontend service - backend integration will be handled by separate backend team

// Journal Types
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

export interface CreateJournalData {
  mood: string;
  moodIntensity: number;
  content: string;
  tags?: string[];
}

export interface UpdateJournalData {
  mood?: string;
  moodIntensity?: number;
  content?: string;
  tags?: string[];
}

// Journal Service
export const journalService = {
  // Create Journal Entry
  createEntry: async (data: CreateJournalData) => {
    // Placeholder - replace with actual API call
    // return await handleApiCall(
    //   api.post<ApiResponse<JournalEntry>>('/journal', data)
    // );
    
    console.log('Creating journal entry:', data);
    
    // Simulate Luna reflection generation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const reflections = [
      "Thank you for sharing your thoughts. It's important to acknowledge your feelings.",
      "Your journal entry shows great self-awareness. Keep reflecting on your emotions.",
      "I appreciate you taking the time to write this. Every entry helps in your journey.",
      "This is a thoughtful reflection. Your emotional intelligence is growing.",
    ];
    
    return {
      data: {
        id: Date.now().toString(),
        ...data,
        tags: data.tags || [],
        lunaReflection: reflections[Math.floor(Math.random() * reflections.length)],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      error: null,
    };
  },

  // Get Journal Entries
  getEntries: async (params?: { limit?: number; offset?: number; date?: string }) => {
    // Placeholder - replace with actual API call
    // return await handleApiCall(
    //   api.get<ApiResponse<JournalEntry[]>>('/journal', { params })
    // );
    
    console.log('Getting journal entries with params:', params);
    return {
      data: [
        {
          id: '1',
          mood: 'happy',
          moodIntensity: 4,
          content: 'Had a great day today. Feeling productive and grateful.',
          tags: ['gratitude', 'productivity'],
          lunaReflection: 'Thank you for sharing your positive experience!',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          mood: 'calm',
          moodIntensity: 3,
          content: 'Spent some time in meditation. Feeling centered.',
          tags: ['meditation', 'mindfulness'],
          lunaReflection: 'Meditation is a wonderful practice for mental wellness.',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      error: null,
    };
  },

  // Get Journal Entry by ID
  getEntry: async (id: string) => {
    // Placeholder - replace with actual API call
    // return await handleApiCall(
    //   api.get<ApiResponse<JournalEntry>>(`/journal/${id}`)
    // );
    
    console.log('Getting journal entry:', id);
    return {
      data: {
        id,
        mood: 'happy',
        moodIntensity: 4,
        content: 'Sample journal entry',
        tags: [],
        lunaReflection: 'Sample reflection',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      error: null,
    };
  },

  // Update Journal Entry
  updateEntry: async (id: string, data: UpdateJournalData) => {
    // Placeholder - replace with actual API call
    // return await handleApiCall(
    //   api.patch<ApiResponse<JournalEntry>>(`/journal/${id}`, data)
    // );
    
    console.log('Updating journal entry:', id, data);
    return {
      data: {
        id,
        mood: data.mood || 'happy',
        moodIntensity: data.moodIntensity || 3,
        content: data.content || '',
        tags: data.tags || [],
        lunaReflection: 'Updated reflection',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      error: null,
    };
  },

  // Delete Journal Entry
  deleteEntry: async (id: string) => {
    // Placeholder - replace with actual API call
    // return await handleApiCall(
    //   api.delete<ApiResponse<void>>(`/journal/${id}`)
    // );
    
    console.log('Deleting journal entry:', id);
    return { data: null, error: null };
  },

  // Get Journal Statistics
  getStats: async () => {
    // Placeholder - replace with actual API call
    // return await handleApiCall(
    //   api.get<ApiResponse<{ totalEntries: number; streak: number }>>('/journal/stats')
    // );
    
    console.log('Getting journal statistics');
    return {
      data: {
        totalEntries: 45,
        streak: 7,
      },
      error: null,
    };
  },
};
