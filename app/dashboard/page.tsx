'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle, Mic, Video, Upload,
  TrendingUp, Sparkles, ArrowRight,
  Flame, Heart, Calendar, Bell,
  Activity, BookOpen, Flower2,
} from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { GlassCard } from '@/components/common/GlassCard';
import { LunaAvatar } from '@/components/common/LunaAvatar';
import { MoodSelector } from '@/components/common/MoodSelector';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { emotionService } from '@/services/emotion';

const quickActions = [
  { icon: MessageCircle, label: 'Chat with Luna', href: '/dashboard/chat',    gradient: 'from-violet-600 to-purple-600', glow: 'shadow-violet-500/30', desc: 'AI companion' },
  { icon: Mic,           label: 'Voice Analysis', href: '/dashboard/voice',   gradient: 'from-pink-600 to-rose-600',     glow: 'shadow-pink-500/30',   desc: 'Emotion scan' },
  { icon: Video,         label: 'Video Analysis', href: '/dashboard/video',   gradient: 'from-amber-600 to-orange-600',  glow: 'shadow-amber-500/30',  desc: 'Facial scan' },
  { icon: Upload,        label: 'Upload File',    href: '/dashboard/upload',  gradient: 'from-emerald-600 to-teal-600',  glow: 'shadow-emerald-500/30',desc: 'Analyze media' },
];

const recentActivities = [
  { action: 'Logged mood as Happy',       time: '2 hours ago',  emoji: '😊', color: 'bg-emerald-500/20 text-emerald-400' },
  { action: 'Completed voice analysis',   time: '5 hours ago',  emoji: '🎙️', color: 'bg-pink-500/20 text-pink-400' },
  { action: 'Wrote journal entry',        time: '1 day ago',    emoji: '📓', color: 'bg-blue-500/20 text-blue-400' },
  { action: 'Started meditation session', time: '2 days ago',   emoji: '🧘', color: 'bg-teal-500/20 text-teal-400' },
];

const weeklySummary = [
  { day: 'Mon', mood: 3.5, pct: 70 },
  { day: 'Tue', mood: 4.0, pct: 80 },
  { day: 'Wed', mood: 3.8, pct: 76 },
  { day: 'Thu', mood: 4.2, pct: 84 },
  { day: 'Fri', mood: 4.5, pct: 90 },
  { day: 'Sat', mood: 4.3, pct: 86 },
  { day: 'Sun', mood: 4.1, pct: 82 },
];

const stats = [
  { label: 'Wellness Score', value: '78', unit: '/100', icon: Heart,      gradient: 'from-rose-500 to-pink-600',     desc: '+5 from last week', pct: 78 },
  { label: 'Mood Streak',    value: '7',  unit: 'days', icon: Flame,      gradient: 'from-amber-500 to-orange-600',  desc: 'Keep it going!',    pct: null },
  { label: 'Avg Mood',       value: '4.1', unit: '/5',  icon: TrendingUp, gradient: 'from-emerald-500 to-teal-600',  desc: 'This week',         pct: 82 },
  { label: 'Sessions',       value: '12', unit: 'this week', icon: Activity, gradient: 'from-blue-500 to-indigo-600', desc: '+3 from last week', pct: null },
];

export default function DashboardPage() {
  const [selectedMood, setSelectedMood] = useState('');

  const handleMoodSelect = async (mood: any) => {
    setSelectedMood(mood.id);
    await emotionService.logEmotion({ type: mood.id, intensity: 5 });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">

        {/* ── Hero ── */}
        <GlassCard className="relative overflow-hidden p-7 md:p-8" hover={false}>
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />
            <div className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-blue-600/10 blur-2xl" />
          </div>

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
            <LunaAvatar state="happy" size="xl" float showRing />

            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-0.5 text-xs font-semibold text-violet-300 uppercase tracking-wider">
                  Good Morning
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                Welcome back, <span className="text-gradient">Divya</span> 👋
              </h1>
              <p className="mt-1.5 text-sm text-white/55 max-w-lg">
                I'm Luna. How are you feeling today? Let's continue your wellness journey together.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link href="/dashboard/chat">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-glow flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat with Luna
                  </motion.button>
                </Link>
                <Link href="/dashboard/reports">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 transition-colors"
                  >
                    View Reports
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* Streak + Score pills */}
            <div className="flex flex-row gap-3 md:flex-col">
              <div className="flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5">
                <Flame className="h-4 w-4 text-amber-400" />
                <div>
                  <p className="text-xs text-white/40">Streak</p>
                  <p className="text-sm font-bold text-white">7 days</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5">
                <Heart className="h-4 w-4 text-rose-400" />
                <div>
                  <p className="text-xs text-white/40">Wellness</p>
                  <p className="text-sm font-bold text-white">78 / 100</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <GlassCard key={s.label} className="p-5" delay={i * 0.06}>
                <div className="mb-3 flex items-center justify-between">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} shadow-lg`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-[10px] font-medium text-white/35 uppercase tracking-widest">{s.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">{s.value}</span>
                  <span className="text-xs text-white/40">{s.unit}</span>
                </div>
                {s.pct !== null && <Progress value={s.pct} className="mt-2 h-1" />}
                <p className="mt-1.5 text-[11px] text-white/35">{s.desc}</p>
              </GlassCard>
            );
          })}
        </div>

        {/* ── Mood Check-in + Inspiration ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <GlassCard className="p-6" delay={0.1}>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20">
                <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">How are you feeling?</h3>
            </div>
            <MoodSelector selectedMood={selectedMood} onMoodSelect={handleMoodSelect} />
            {selectedMood && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-xs text-violet-300/80"
              >
                ✓ Mood logged successfully
              </motion.p>
            )}
          </GlassCard>

          <GlassCard className="relative overflow-hidden p-6" delay={0.15}>
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />
            </div>
            <div className="relative flex h-full flex-col justify-between">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20">
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Daily Inspiration</h3>
              </div>
              <div>
                <blockquote className="text-base font-medium italic leading-relaxed text-white/80">
                  "The only way to do great work is to love what you do."
                </blockquote>
                <p className="mt-3 text-xs font-semibold text-white/40">— Steve Jobs</p>
              </div>
              <div className="mt-4 flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <div key={n} className={`h-1 flex-1 rounded-full ${n <= 4 ? 'bg-violet-500/60' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* ── Quick Actions ── */}
        <GlassCard className="p-6" delay={0.18}>
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.08]">
              <Activity className="h-3.5 w-3.5 text-white/70" />
            </div>
            <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} href={action.href}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.07 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="group flex flex-col items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 cursor-pointer hover:border-white/15 hover:bg-white/[0.07] transition-all"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${action.gradient} shadow-lg ${action.glow} group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-white">{action.label}</p>
                      <p className="text-[10px] text-white/40">{action.desc}</p>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </GlassCard>

        {/* ── Weekly Summary + Notifications ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <GlassCard className="p-6" delay={0.22}>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20">
                <Calendar className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">Weekly Mood</h3>
            </div>
            <div className="space-y-3">
              {weeklySummary.map((item, i) => (
                <motion.div
                  key={item.day}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.04 }}
                  className="flex items-center gap-3"
                >
                  <span className="w-8 text-xs font-medium text-white/40">{item.day}</span>
                  <div className="flex-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.pct}%` }}
                        transition={{ duration: 0.8, delay: 0.4 + i * 0.06, ease: [0.22,1,0.36,1] }}
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                      />
                    </div>
                  </div>
                  <span className="w-8 text-right text-xs font-semibold text-white/60">{item.mood}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6" delay={0.24}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20">
                  <Bell className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
              </div>
              <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-xs font-bold text-violet-300">2 new</span>
            </div>

            <div className="space-y-2.5">
              {[
                { msg: 'Daily mood check-in reminder', time: '2 hours ago', icon: '🔔' },
                { msg: 'Your weekly report is ready',  time: '1 day ago',   icon: '📊' },
              ].map((n, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-3">
                  <span className="mt-0.5 text-base">{n.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white/80 truncate">{n.msg}</p>
                    <p className="text-[10px] text-white/35 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}

              <Link href="/dashboard/notifications">
                <motion.button
                  whileHover={{ x: 2 }}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 text-xs font-semibold text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-colors"
                >
                  View All
                  <ArrowRight className="h-3.5 w-3.5" />
                </motion.button>
              </Link>
            </div>
          </GlassCard>
        </div>

        {/* ── Recent Activity ── */}
        <GlassCard className="p-6" delay={0.28}>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.08]">
              <BookOpen className="h-3.5 w-3.5 text-white/70" />
            </div>
            <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
          </div>
          <div className="space-y-2">
            {recentActivities.map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 hover:bg-white/[0.06] transition-colors"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${activity.color}`}>
                  {activity.emoji}
                </div>
                <p className="flex-1 text-xs font-medium text-white/70">{activity.action}</p>
                <span className="text-[10px] text-white/30 whitespace-nowrap">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </GlassCard>

      </div>
    </DashboardLayout>
  );
}
