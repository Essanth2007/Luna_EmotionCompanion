'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import GlassCard from '@/components/dashboard/GlassCard';
import { weeklyMoodData } from '@/components/dashboard/mock-data';

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-white/15 bg-slate-900/95 px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="text-xs text-white/50">{label}</p>
      <p className="text-sm font-semibold text-white">
        Score: {payload[0].value}
      </p>
    </div>
  );
};

const WeeklyMoodChart = () => {
  return (
    <GlassCard delay={0.35} className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-white/40">
            Weekly Trends
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Mood Chart
          </h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15">
          <TrendingUp className="h-5 w-5 text-emerald-300" />
        </div>
      </div>

      <div className="h-56 w-full min-w-0 flex-1 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={weeklyMoodData}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              domain={[40, 100]}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#818cf8"
              strokeWidth={2.5}
              fill="url(#moodGradient)"
              dot={{ fill: '#818cf8', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: '#a78bfa' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

export default WeeklyMoodChart;
