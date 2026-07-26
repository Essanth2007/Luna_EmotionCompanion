export const userData = {
  name: 'Alex Morgan',
  email: 'alex.morgan@email.com',
  currentMood: 'Calm',
  moodEmoji: '😌',
  motivationalQuote:
    'Every small step toward self-awareness is a victory worth celebrating.',
};

export const moodSummary = {
  currentMood: 'Calm',
  emotionPercentage: 72,
  confidenceScore: 89,
  status: 'Stable',
};

export const mentalHealthScore = {
  score: 78,
  riskLevel: 'Low',
  maxScore: 100,
};

export const voiceAnalysis = {
  emotion: 'Relaxed',
  stress: 'Low',
  confidence: 91,
};

export const videoAnalysis = {
  detectedEmotion: 'Content',
  confidence: 87,
  stressLevel: 'Minimal',
};

export const chatPreview = {
  lastMessage:
    "I noticed you've been feeling calmer lately. Would you like to explore what's been helping?",
  lunaTyping: true,
  timestamp: 'Just now',
};

export const weeklyMoodData = [
  { day: 'Mon', mood: 62, score: 62 },
  { day: 'Tue', mood: 71, score: 71 },
  { day: 'Wed', mood: 58, score: 58 },
  { day: 'Thu', mood: 74, score: 74 },
  { day: 'Fri', mood: 82, score: 82 },
  { day: 'Sat', mood: 88, score: 88 },
  { day: 'Sun', mood: 76, score: 76 },
];

export const emotionHistory = [
  {
    id: 1,
    date: 'Jul 26, 2026',
    emotion: 'Calm',
    score: 89,
    status: 'Stable',
  },
  {
    id: 2,
    date: 'Jul 25, 2026',
    emotion: 'Happy',
    score: 92,
    status: 'Positive',
  },
  {
    id: 3,
    date: 'Jul 24, 2026',
    emotion: 'Anxious',
    score: 64,
    status: 'Moderate',
  },
  {
    id: 4,
    date: 'Jul 23, 2026',
    emotion: 'Calm',
    score: 78,
    status: 'Stable',
  },
  {
    id: 5,
    date: 'Jul 22, 2026',
    emotion: 'Sad',
    score: 55,
    status: 'Needs Care',
  },
];

export type StatusType = 'Stable' | 'Positive' | 'Moderate' | 'Needs Care';

export const statusStyles: Record<
  StatusType,
  { badge: string; dot: string }
> = {
  Stable: {
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
    dot: 'bg-blue-400',
  },
  Positive: {
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    dot: 'bg-emerald-400',
  },
  Moderate: {
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    dot: 'bg-amber-400',
  },
  'Needs Care': {
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
    dot: 'bg-rose-400',
  },
};
