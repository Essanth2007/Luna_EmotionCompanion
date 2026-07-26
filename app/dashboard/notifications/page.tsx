'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, Calendar, Mic, Video, BookOpen, Sparkles } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { GlassCard } from '@/components/common/GlassCard';
import { LunaAvatar } from '@/components/common/LunaAvatar';
import { Button } from '@/components/ui/button';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'reminder',
      title: 'Daily Mood Check-in',
      message: 'Don\'t forget to log your mood for today!',
      time: '2 hours ago',
      read: false,
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      id: '2',
      type: 'analysis',
      title: 'Voice Analysis Complete',
      message: 'Your voice analysis from yesterday is ready to view.',
      time: '5 hours ago',
      read: false,
      icon: <Mic className="w-5 h-5" />,
    },
    {
      id: '3',
      type: 'motivation',
      title: 'Daily Motivation',
      message: 'Remember: Every small step counts towards your wellness journey.',
      time: '1 day ago',
      read: true,
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      id: '4',
      type: 'journal',
      title: 'Journal Reminder',
      message: 'It\'s been 3 days since your last journal entry.',
      time: '2 days ago',
      read: true,
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      id: '5',
      type: 'analysis',
      title: 'Video Analysis Complete',
      message: 'Your video analysis results are now available.',
      time: '3 days ago',
      read: true,
      icon: <Video className="w-5 h-5" />,
    },
    {
      id: '6',
      type: 'reminder',
      title: 'Weekly Summary Ready',
      message: 'Your weekly wellness summary is ready to view.',
      time: '1 week ago',
      read: true,
      icon: <Calendar className="w-5 h-5" />,
    },
  ]);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                className="glass"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">No Notifications</h3>
              <p className="text-muted-foreground">
                You're all caught up! Check back later for updates.
              </p>
            </GlassCard>
          ) : (
            notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 glass rounded-lg transition-colors ${
                  !notification.read ? 'bg-primary/10 border-primary/30' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${
                    !notification.read ? 'bg-primary/20' : 'bg-white/10'
                  }`}>
                    {notification.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-semibold ${!notification.read ? 'text-white' : ''}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.time}
                        </p>
                      </div>
                      
                      <div className="flex gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => markAsRead(notification.id)}
                            className="text-primary hover:bg-primary/20"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Notification Settings */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daily Reminders</p>
                <p className="text-sm text-muted-foreground">
                  Get reminded to log your mood daily
                </p>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Analysis Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Notify when analysis is complete
                </p>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Journal Prompts</p>
                <p className="text-sm text-muted-foreground">
                  Weekly journal writing reminders
                </p>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daily Motivation</p>
                <p className="text-sm text-muted-foreground">
                  Receive inspirational quotes
                </p>
              </div>
              <div className="w-12 h-6 bg-white/20 rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
