'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Check, CheckCheck, Trash2,
  Calendar, Mic, Video, BookOpen,
  Sparkles, Phone, AlertCircle,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { GlassCard } from '@/components/common/GlassCard';
import { LunaAvatar } from '@/components/common/LunaAvatar';
import { Switch } from '@/components/ui/switch';
import { notificationService } from '@/services/notifications';
import type { Notification } from '@/types';

const typeIcon: Record<string, React.ElementType> = {
  reminder:   Bell,
  analysis:   Mic,
  motivation: Sparkles,
  journal:    BookOpen,
  call:       Phone,
  system:     AlertCircle,
};

const typeBg: Record<string, string> = {
  reminder:   'bg-violet-500/15 text-violet-400',
  analysis:   'bg-pink-500/15 text-pink-400',
  motivation: 'bg-amber-500/15 text-amber-400',
  journal:    'bg-blue-500/15 text-blue-400',
  call:       'bg-emerald-500/15 text-emerald-400',
  system:     'bg-slate-500/15 text-slate-400',
};

const prefToggleItems = [
  { key: 'daily',    label: 'Daily Reminders',  desc: 'Get reminded to log your mood daily',       defaultOn: true  },
  { key: 'analysis', label: 'Analysis Alerts',   desc: 'Notify when voice/video analysis completes', defaultOn: true  },
  { key: 'journal',  label: 'Journal Prompts',   desc: 'Weekly journal writing reminders',          defaultOn: true  },
  { key: 'calls',    label: 'Call Notifications',desc: 'Incoming and missed call alerts',           defaultOn: true  },
  { key: 'motivate', label: 'Daily Motivation',  desc: 'Receive daily inspirational quotes',        defaultOn: false },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [prefs, setPrefs]                 = useState<Record<string, boolean>>(() =>
    Object.fromEntries(prefToggleItems.map((p) => [p.key, p.defaultOn]))
  );

  useEffect(() => {
    notificationService.getAll().then((r) => {
      if (r.data) setNotifications(r.data);
      setIsLoading(false);
    });
  }, []);

  const markRead = async (id: string) => {
    await notificationService.markRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const remove = async (id: string) => {
    await notificationService.delete(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="mt-1 text-sm text-white/45">
              {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'You\'re all caught up!'}
            </p>
          </div>
          {unread > 0 && (
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={markAllRead}
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/60 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </motion.button>
          )}
        </div>

        {/* List */}
        <GlassCard className="overflow-hidden p-0" hover={false}>
          {isLoading ? (
            <div className="space-y-px p-2">
              {[1,2,3,4].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/[0.04]" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <LunaAvatar state="happy" size="lg" float showRing />
              <div>
                <p className="text-sm font-semibold text-white/60">No notifications</p>
                <p className="mt-1 text-xs text-white/30">You're all caught up! Check back later.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              <AnimatePresence initial={false}>
                {notifications.map((n, i) => {
                  const Icon = typeIcon[n.type] ?? Bell;
                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16, height: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`group flex items-start gap-4 px-5 py-4 transition-colors ${
                        !n.read ? 'bg-violet-500/[0.04]' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${typeBg[n.type] ?? typeBg.system}`}>
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold truncate ${!n.read ? 'text-white' : 'text-white/70'}`}>
                              {n.title}
                              {!n.read && (
                                <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-violet-400 align-middle" />
                              )}
                            </p>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-white/45 line-clamp-2">{n.message}</p>
                            <p className="mt-1 text-[10px] text-white/25">{n.time}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!n.read && (
                              <button onClick={() => markRead(n.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-violet-400 hover:bg-violet-500/15 transition-colors"
                                title="Mark as read">
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button onClick={() => remove(n.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/25 hover:bg-rose-500/15 hover:text-rose-400 transition-colors"
                              title="Delete">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </GlassCard>

        {/* Preferences */}
        <GlassCard className="p-6" hover={false}>
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20">
              <Bell className="h-3.5 w-3.5 text-violet-400" />
            </div>
            <h2 className="text-sm font-bold text-white">Notification Preferences</h2>
          </div>
          <div className="space-y-3">
            {prefToggleItems.map(({ key, label, desc }) => (
              <div key={key}
                className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-white/80">{label}</p>
                  <p className="mt-0.5 text-[11px] text-white/35">{desc}</p>
                </div>
                <Switch
                  checked={prefs[key]}
                  onCheckedChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))}
                />
              </div>
            ))}
          </div>
        </GlassCard>

      </div>
    </DashboardLayout>
  );
}
