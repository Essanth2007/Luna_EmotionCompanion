import type { Notification } from '@/types';

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'reminder',
    title: 'Daily Mood Check-in',
    message: "Don't forget to log your mood for today!",
    time: '2 hours ago',
    read: false,
    actionUrl: '/dashboard',
  },
  {
    id: '2',
    type: 'analysis',
    title: 'Voice Analysis Complete',
    message: 'Your voice analysis from earlier is ready to view.',
    time: '5 hours ago',
    read: false,
    actionUrl: '/dashboard/voice',
  },
  {
    id: '3',
    type: 'motivation',
    title: 'Daily Motivation',
    message: 'Remember: Every small step counts towards your wellness journey.',
    time: '1 day ago',
    read: true,
  },
  {
    id: '4',
    type: 'journal',
    title: 'Journal Reminder',
    message: "It's been 3 days since your last journal entry.",
    time: '2 days ago',
    read: true,
    actionUrl: '/dashboard/journal',
  },
  {
    id: '5',
    type: 'analysis',
    title: 'Weekly Report Ready',
    message: 'Your weekly wellness report is now available.',
    time: '3 days ago',
    read: true,
    actionUrl: '/dashboard/reports',
  },
];

export const notificationService = {
  getAll: async (): Promise<{ data: Notification[]; error: string | null }> => {
    await new Promise((r) => setTimeout(r, 200));
    return { data: [...mockNotifications], error: null };
  },

  markRead: async (id: string): Promise<{ data: null; error: string | null }> => {
    const n = mockNotifications.find((x) => x.id === id);
    if (n) n.read = true;
    return { data: null, error: null };
  },

  markAllRead: async (): Promise<{ data: null; error: string | null }> => {
    mockNotifications.forEach((n) => (n.read = true));
    return { data: null, error: null };
  },

  delete: async (id: string): Promise<{ data: null; error: string | null }> => {
    const idx = mockNotifications.findIndex((x) => x.id === id);
    if (idx !== -1) mockNotifications.splice(idx, 1);
    return { data: null, error: null };
  },

  getUnreadCount: async (): Promise<number> => {
    return mockNotifications.filter((n) => !n.read).length;
  },
};
