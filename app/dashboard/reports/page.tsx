'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, TrendingUp, FileText, Brain, Sparkles, Activity } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { GlassCard } from '@/components/common/GlassCard';
import { LunaAvatar } from '@/components/common/LunaAvatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { reportService } from '@/services/report';

const emotionColors: Record<string, string> = {
  happy: 'from-emerald-500 to-green-400',
  calm: 'from-blue-500 to-cyan-400',
  anxious: 'from-amber-500 to-yellow-400',
  sad: 'from-indigo-500 to-blue-600',
  angry: 'from-rose-500 to-red-400',
  neutral: 'from-slate-500 to-slate-400',
};

export default function ReportsPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const r = await reportService.getReport();
    if (r.data) setReportData(r.data);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 flex-col items-center justify-center gap-4">
          <LunaAvatar state="thinking" size="xl" float showRing />
          <p className="text-sm text-white/40">Loading your insights…</p>
        </div>
      </DashboardLayout>
    );
  }

  const score = reportData?.wellnessScore ?? 0;
  const scoreColor = score >= 75 ? 'from-emerald-500 to-teal-500' : score >= 50 ? 'from-amber-500 to-orange-500' : 'from-rose-500 to-red-500';

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Reports</h1>
            <p className="mt-1 text-sm text-white/45">Your emotional wellness insights</p>
          </div>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => reportService.downloadPDF()}
            className="btn-glow flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white">
            <Download className="h-4 w-4" /> Download PDF
          </motion.button>
        </div>

        {/* Wellness score hero */}
        <GlassCard className="relative overflow-hidden p-7" hover={false}>
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-600/12 blur-3xl" />
          </div>
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
            {/* Score circle */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full">
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <motion.circle
                    cx="50" cy="50" r="44" fill="none"
                    stroke="url(#scoreGrad)" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - score / 100) }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#60a5fa" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="text-center">
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    className={`text-3xl font-bold text-gradient`}>{score}</motion.p>
                  <p className="text-[10px] text-white/40">/100</p>
                </div>
              </div>
              <p className="text-xs font-semibold text-white/50">Wellness Score</p>
            </div>

            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className={`rounded-full bg-gradient-to-r ${scoreColor} px-3 py-0.5 text-xs font-bold text-white`}>
                  {score >= 75 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs Care'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">Your Mental Wellness</h2>
              <p className="mt-1 text-sm text-white/45">Based on your recent activity, emotions, and sessions.</p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: 'Sessions', value: '12', icon: Activity, color: 'text-blue-400' },
                  { label: 'Journal', value: '8',   icon: FileText, color: 'text-violet-400' },
                  { label: 'Streak',  value: '7d',  icon: TrendingUp, color: 'text-emerald-400' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-center">
                    <Icon className={`mx-auto mb-1 h-4 w-4 ${color}`} />
                    <p className="text-base font-bold text-white">{value}</p>
                    <p className="text-[10px] text-white/35">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Summary */}
            <div className="flex-1 rounded-2xl border border-violet-500/15 bg-violet-500/8 p-4">
              <div className="mb-3 flex items-center gap-2">
                <LunaAvatar state="listening" size="sm" showRing={false} animate={false} />
                <span className="text-xs font-semibold text-white/70">Luna's Summary</span>
              </div>
              <p className="text-xs leading-relaxed text-white/55">
                {reportData?.aiSummary ?? 'Your emotional well-being has been stable this week. Keep up your daily check-ins for more personalized insights.'}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Charts */}
        <Tabs defaultValue="weekly" className="space-y-5">
          <TabsList className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-1">
            <TabsTrigger value="weekly" className="rounded-xl text-xs font-semibold data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="rounded-xl text-xs font-semibold data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
              Monthly
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-5">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <GlassCard className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Mood Trend</h3>
                </div>
                <div className="space-y-3">
                  {reportData?.weekly?.moodTrend.map((item: any, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3">
                      <span className="w-8 text-xs text-white/40">{item.day}</span>
                      <div className="flex-1">
                        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${item.mood * 20}%` }}
                            transition={{ duration: 0.7, delay: 0.3 + i * 0.05 }}
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500" />
                        </div>
                      </div>
                      <span className="w-7 text-right text-xs font-semibold text-white/60">{item.mood}</span>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20">
                    <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Emotion Distribution</h3>
                </div>
                <div className="space-y-3">
                  {reportData?.weekly?.emotionDistribution.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-16 text-xs capitalize text-white/55">{item.emotion}</span>
                      <div className="flex-1">
                        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${item.percentage}%` }}
                            transition={{ duration: 0.7, delay: 0.3 + i * 0.06 }}
                            className={`h-full rounded-full bg-gradient-to-r ${emotionColors[item.emotion] ?? 'from-slate-500 to-slate-400'}`} />
                        </div>
                      </div>
                      <span className="w-16 text-right text-[10px] text-white/35">{item.count} ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-5">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <GlassCard className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Monthly Mood Trend</h3>
                </div>
                <div className="space-y-3">
                  {reportData?.monthly?.moodTrend.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-16 text-xs text-white/40">{item.week}</span>
                      <div className="flex-1">
                        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${item.mood * 20}%` }}
                            transition={{ duration: 0.7, delay: 0.3 + i * 0.07 }}
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500" />
                        </div>
                      </div>
                      <span className="w-7 text-right text-xs font-semibold text-white/60">{item.mood}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20">
                    <FileText className="h-3.5 w-3.5 text-violet-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Emotion Distribution</h3>
                </div>
                <div className="space-y-3">
                  {reportData?.monthly?.emotionDistribution.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-16 text-xs capitalize text-white/55">{item.emotion}</span>
                      <div className="flex-1">
                        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${item.percentage}%` }}
                            transition={{ duration: 0.7, delay: 0.3 + i * 0.06 }}
                            className={`h-full rounded-full bg-gradient-to-r ${emotionColors[item.emotion] ?? 'from-slate-500 to-slate-400'}`} />
                        </div>
                      </div>
                      <span className="w-16 text-right text-[10px] text-white/35">{item.count} ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </TabsContent>
        </Tabs>

        {/* Stress / Depression */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {[
            { title: 'Stress Trend', data: reportData?.stressTrend, color: 'from-amber-500 to-orange-500' },
            { title: 'Depression Trend', data: reportData?.depressionTrend, color: 'from-rose-500 to-pink-600' },
          ].map(({ title, data, color }) => (
            <GlassCard key={title} className="p-6">
              <h3 className="mb-4 text-sm font-semibold text-white">{title}</h3>
              <div className="space-y-2.5">
                {data?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-16 text-[10px] text-white/35">{item.date}</span>
                    <div className="flex-1">
                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${item.level * 100}%` }}
                          transition={{ duration: 0.7, delay: 0.3 + i * 0.06 }}
                          className={`h-full rounded-full bg-gradient-to-r ${color}`} />
                      </div>
                    </div>
                    <span className="w-10 text-right text-[10px] text-white/35">{(item.level * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
