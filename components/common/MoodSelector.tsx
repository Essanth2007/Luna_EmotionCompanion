'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Mood {
  id: string;
  emoji: string;
  label: string;
  gradient: string;
  glow: string;
}

const moods: Mood[] = [
  { id: 'happy',   emoji: '😊', label: 'Happy',   gradient: 'from-emerald-500 to-green-400',   glow: 'shadow-emerald-500/30' },
  { id: 'calm',    emoji: '😌', label: 'Calm',    gradient: 'from-blue-500 to-cyan-400',       glow: 'shadow-blue-500/30' },
  { id: 'neutral', emoji: '😐', label: 'Neutral', gradient: 'from-slate-500 to-slate-400',     glow: 'shadow-slate-500/20' },
  { id: 'sad',     emoji: '😢', label: 'Sad',     gradient: 'from-blue-600 to-indigo-500',     glow: 'shadow-blue-600/30' },
  { id: 'anxious', emoji: '😰', label: 'Anxious', gradient: 'from-amber-500 to-yellow-400',    glow: 'shadow-amber-500/30' },
  { id: 'angry',   emoji: '😠', label: 'Angry',   gradient: 'from-rose-500 to-red-400',        glow: 'shadow-rose-500/30' },
];

interface MoodSelectorProps {
  selectedMood?: string;
  onMoodSelect: (mood: { id: string; emoji: string; label: string }) => void;
  className?: string;
}

export const MoodSelector = ({ selectedMood, onMoodSelect, className }: MoodSelectorProps) => {
  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {moods.map((mood, i) => {
        const active = selectedMood === mood.id;
        return (
          <motion.button
            key={mood.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
            whileHover={{ scale: 1.12, y: -2 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => onMoodSelect(mood)}
            className={cn(
              'relative flex flex-col items-center gap-1.5 rounded-2xl px-3 py-3 transition-all duration-200 cursor-pointer select-none',
              'border backdrop-blur-md',
              active
                ? 'border-violet-400/50 bg-violet-500/15'
                : 'border-white/[0.08] bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.08]'
            )}
          >
            {/* Active glow */}
            {active && (
              <motion.div
                layoutId="moodGlow"
                className={cn('absolute inset-0 rounded-2xl bg-gradient-to-br opacity-20', mood.gradient)}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}

            {/* Emoji circle */}
            <div className={cn(
              'relative z-10 flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200',
              active
                ? `bg-gradient-to-br ${mood.gradient} shadow-lg ${mood.glow}`
                : 'bg-white/[0.06]'
            )}>
              <span className="text-xl">{mood.emoji}</span>
            </div>

            <span className={cn(
              'relative z-10 text-[11px] font-semibold tracking-wide',
              active ? 'text-white' : 'text-white/50'
            )}>
              {mood.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};
