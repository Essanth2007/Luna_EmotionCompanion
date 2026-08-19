// Frontend service - backend integration will be handled by separate backend team

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

// Chat Service
export const chatService = {
  // Send Message
  sendMessage: async (data: SendMessageData) => {
    // Placeholder - replace with actual API call
    // return await handleApiCall(
    //   api.post<ApiResponse<ChatMessage>>('/chat/message', data)
    // );
    
    console.log('Sending message:', data);
    
    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const responses = [
      "I understand how you're feeling. Let's explore this together.",
      "That's a valid emotion. Would you like to talk more about it?",
      "I'm here for you. What's on your mind today?",
      "It takes courage to share your feelings. Thank you for trusting me.",
      "Let's work through this step by step. You're not alone.",
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      data: {
        id: Date.now().toString(),
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date().toISOString(),
        emotion: 'empathetic',
      },
      error: null,
    };
  },

  // Get Chat Sessions
  getSessions: async () => {
    // Placeholder - replace with actual API call
    // return await handleApiCall(
    //   api.get<ApiResponse<ChatSession[]>>('/chat/sessions')
    // );
    
    console.log('Getting chat sessions');
    return {
      data: [
        {
          id: '1',
          title: 'Morning check-in',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Anxiety discussion',
          messages: [],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      error: null,
    };
  },

  // Get Chat Session by ID
  getSession: async (sessionId: string) => {
    // Placeholder - replace with actual API call
    // return await handleApiCall(
    //   api.get<ApiResponse<ChatSession>>(`/chat/sessions/${sessionId}`)
    // );
    
    console.log('Getting chat session:', sessionId);
    return {
      data: {
        id: sessionId,
        title: 'Chat session',
        messages: [
          {
            id: '1',
            role: 'user',
            content: 'Hello Luna',
            timestamp: new Date().toISOString(),
          },
          {
            id: '2',
            role: 'assistant',
            content: 'Hello! How are you feeling today?',
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      error: null,
    };
  },

  // Delete Chat Session
  deleteSession: async (sessionId: string) => {
    // Placeholder - replace with actual API call
    // return await handleApiCall(
    //   api.delete<ApiResponse<void>>(`/chat/sessions/${sessionId}`)
    // );
    
    console.log('Deleting chat session:', sessionId);
    return { data: null, error: null };
  },

  // Get Suggested Prompts
  getSuggestedPrompts: async () => {
    // Placeholder - replace with actual API call
    // return await handleApiCall(
    //   api.get<ApiResponse<SuggestedPrompt[]>>('/chat/prompts')
    // );
    
    console.log('Getting suggested prompts');
    return {
      data: [
        { id: '1', text: 'How are you feeling today?', category: 'check-in' },
        { id: '2', text: 'What made you smile today?', category: 'positive' },
        { id: '3', text: 'What\'s been on your mind lately?', category: 'reflection' },
        { id: '4', text: 'I\'m feeling anxious', category: 'emotion' },
        { id: '5', text: 'I need someone to talk to', category: 'support' },
        { id: '6', text: 'Help me relax', category: 'wellness' },
      ],
      error: null,
    };
  },

  // Create New Session
  createSession: async (title?: string) => {
    // Placeholder - replace with actual API call
    // return await handleApiCall(
    //   api.post<ApiResponse<ChatSession>>('/chat/sessions', { title })
    // );
    
    console.log('Creating new chat session');
    return {
      data: {
        id: Date.now().toString(),
        title: title || 'New conversation',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      error: null,
    };
  },
};
