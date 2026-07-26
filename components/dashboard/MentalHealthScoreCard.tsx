'use client';

import { ShieldCheck } from 'lucide-react';
import GlassCard from '@/components/dashboard/GlassCard';
import { mentalHealthScore } from '@/components/dashboard/mock-data';

const MentalHealthScoreCard = () => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (mentalHealthScore.score / mentalHealthScore.maxScore) * circumference;

  const riskColors: Record<string, string> = {
    Low: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/25',
    Moderate: 'text-amber-300 bg-amber-500/15 border-amber-500/25',
    High: 'text-rose-300 bg-rose-500/15 border-rose-500/25',
  };

  return (
    <GlassCard delay={0.15} className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-white/40">
            Wellness Index
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Mental Health Score
          </h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/15">
          <ShieldCheck className="h-5 w-5 text-violet-300" />
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-2">
        <div className="relative">
          <svg width="160" height="160" className="-rotate-90">
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="10"
            />
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-white">
              {mentalHealthScore.score}
            </span>
            <span className="text-xs text-white/45">/ {mentalHealthScore.maxScore}</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/50">Risk Level</p>
          <span
            className={`mt-2 inline-flex rounded-full border px-4 py-1 text-sm font-medium ${
              riskColors[mentalHealthScore.riskLevel] ?? riskColors.Low
            }`}
          >
            {mentalHealthScore.riskLevel}
          </span>
        </div>
      </div>
    </GlassCard>
  );
};

export default MentalHealthScoreCard;
