'use client';

import { Clock } from 'lucide-react';
import GlassCard from '@/components/dashboard/GlassCard';
import {
  emotionHistory,
  statusStyles,
  type StatusType,
} from '@/components/dashboard/mock-data';
import { cn } from '@/lib/utils';

const EmotionHistory = () => {
  return (
    <GlassCard delay={0.4} className="overflow-hidden" hover={false}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-white/40">
            Analysis Log
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Emotion History
          </h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5">
          <Clock className="h-5 w-5 text-white/50" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[540px] text-left">
          <thead>
            <tr className="border-b border-white/10">
              {['Date', 'Emotion', 'Score', 'Status'].map((header) => (
                <th
                  key={header}
                  className="pb-3 pr-4 text-xs font-medium uppercase tracking-wider text-white/40 last:pr-0"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {emotionHistory.map((entry) => {
              const statusStyle =
                statusStyles[entry.status as StatusType] ??
                statusStyles.Stable;

              return (
                <tr
                  key={entry.id}
                  className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03]"
                >
                  <td className="py-4 pr-4 text-sm text-white/70">
                    {entry.date}
                  </td>
                  <td className="py-4 pr-4">
                    <span className="text-sm font-medium text-white">
                      {entry.emotion}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                          style={{ width: `${entry.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-white">
                        {entry.score}
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                        statusStyle.badge
                      )}
                    >
                      <span
                        className={cn('h-1.5 w-1.5 rounded-full', statusStyle.dot)}
                      />
                      {entry.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
};

export default EmotionHistory;
