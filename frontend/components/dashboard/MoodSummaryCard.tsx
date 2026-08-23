'use client';

import { Activity } from 'lucide-react';
import GlassCard from '@/components/dashboard/GlassCard';
import {
  moodSummary,
  statusStyles,
  type StatusType,
} from '@/components/dashboard/mock-data';
import { cn } from '@/lib/utils';

const MoodSummaryCard = () => {
  const statusStyle =
    statusStyles[moodSummary.status as StatusType] ?? statusStyles.Stable;

  return (
    <GlassCard delay={0.1} className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-white/40">
            Mood Summary
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Today&apos;s Overview
          </h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/15">
          <Activity className="h-5 w-5 text-blue-300" />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-6">
        <div>
          <p className="text-sm text-white/50">Current Mood</p>
          <p className="mt-1 text-3xl font-bold text-white">
            {moodSummary.currentMood}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-white/50">Emotion Intensity</span>
              <span className="font-semibold text-blue-300">
                {moodSummary.emotionPercentage}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-700"
                style={{ width: `${moodSummary.emotionPercentage}%` }}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-white/50">Confidence Score</span>
              <span className="font-semibold text-violet-300">
                {moodSummary.confidenceScore}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all duration-700"
                style={{ width: `${moodSummary.confidenceScore}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-sm text-white/50">Status</span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
              statusStyle.badge
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', statusStyle.dot)} />
            {moodSummary.status}
          </span>
        </div>
      </div>
    </GlassCard>
  );
};

export default MoodSummaryCard;
