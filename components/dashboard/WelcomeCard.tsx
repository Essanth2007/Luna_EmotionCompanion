'use client';

import { motion } from 'framer-motion';
import { Sparkles, Quote } from 'lucide-react';
import GlassCard from '@/components/dashboard/GlassCard';
import { userData } from '@/components/dashboard/mock-data';

const WelcomeCard = () => {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <GlassCard
      delay={0}
      className="relative overflow-hidden p-8 md:p-10"
      hover={false}
    >
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/30 to-violet-600/20 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-gradient-to-tr from-indigo-500/25 to-blue-400/15 blur-3xl"
        />
      </div>

      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-violet-300" />
            <span className="text-xs font-medium tracking-wide text-white/70">
              {greeting}
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-blue-300 to-violet-300 bg-clip-text text-transparent">
                {userData.name.split(' ')[0]}
              </span>
            </h2>
            <p className="mt-2 text-white/55">
              Your emotional wellness journey continues today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
              <span className="text-xl">{userData.moodEmoji}</span>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/40">
                  Current Mood
                </p>
                <p className="text-sm font-semibold text-white">
                  {userData.currentMood}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <Quote className="mt-0.5 h-4 w-4 shrink-0 text-violet-300/70" />
            <p className="text-sm italic leading-relaxed text-white/60">
              &ldquo;{userData.motivationalQuote}&rdquo;
            </p>
          </div>
        </div>

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative mx-auto flex h-48 w-48 shrink-0 items-center justify-center lg:mx-0 lg:h-56 lg:w-56"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-600/20 blur-2xl" />
          <div className="relative flex h-full w-full flex-col items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-blue-500/10 to-violet-600/10 backdrop-blur-sm">
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-violet-500 shadow-lg shadow-violet-500/30">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <p className="text-sm font-semibold text-white">Luna</p>
            <p className="text-xs text-white/45">Your AI Companion</p>
          </div>
        </motion.div>
      </div>
    </GlassCard>
  );
};

export default WelcomeCard;
