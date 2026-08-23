'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, Music, Wind, Flower2, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { GlassCard } from '@/components/common/GlassCard';
import { LunaAvatar } from '@/components/common/LunaAvatar';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';

type BreathPhase = 'inhale' | 'hold' | 'exhale';

const exercises = [
  { id: 'breathing', name: 'Box Breathing',    duration: 300, icon: Wind,    desc: '4-4-4 rhythm',     color: 'from-violet-500 to-blue-500' },
  { id: 'relax',     name: 'Deep Relaxation',  duration: 600, icon: Flower2, desc: 'Body scan',         color: 'from-teal-500 to-cyan-500'   },
  { id: 'focus',     name: 'Mindful Focus',    duration: 900, icon: Music,   desc: 'Attention training', color: 'from-amber-500 to-orange-500' },
];

const sounds = ['🌧 Rain', '🌊 Ocean', '🌲 Forest', '⬜ White Noise'];

const breathText: Record<BreathPhase, string> = {
  inhale: 'Breathe in slowly…',
  hold:   'Hold your breath…',
  exhale: 'Breathe out slowly…',
};

export default function MeditationPage() {
  const [isPlaying,  setIsPlaying]  = useState(false);
  const [timeLeft,   setTimeLeft]   = useState(300);
  const [totalTime,  setTotalTime]  = useState(300);
  const [phase,      setPhase]      = useState<BreathPhase>('inhale');
  const [selected,   setSelected]   = useState('breathing');
  const [volume,     setVolume]     = useState(70);
  const [sound,      setSound]      = useState('');
  const [completed,  setCompleted]  = useState(false);

  const timerRef  = useRef<NodeJS.Timeout | null>(null);
  const breathRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => () => {
    if (timerRef.current)  clearInterval(timerRef.current);
    if (breathRef.current) clearInterval(breathRef.current);
  }, []);

  const startBreathCycle = () => {
    const cycle = () => {
      setPhase('inhale');
      setTimeout(() => setPhase('hold'),   4000);
      setTimeout(() => setPhase('exhale'), 8000);
      setTimeout(() => setPhase('hold'),  12000);
    };
    cycle();
    breathRef.current = setInterval(cycle, 16000);
  };

  const start = () => {
    setIsPlaying(true);
    setCompleted(false);
    startBreathCycle();
    timerRef.current = setInterval(() => {
      setTimeLeft((p) => {
        if (p <= 1) {
          setIsPlaying(false);
          setCompleted(true);
          clearInterval(timerRef.current!);
          if (breathRef.current) clearInterval(breathRef.current);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
  };

  const pause = () => {
    setIsPlaying(false);
    if (timerRef.current)  clearInterval(timerRef.current);
    if (breathRef.current) clearInterval(breathRef.current);
  };

  const reset = () => {
    pause();
    setTimeLeft(totalTime);
    setPhase('inhale');
    setCompleted(false);
  };

  const selectEx = (ex: typeof exercises[0]) => {
    setSelected(ex.id);
    setTotalTime(ex.duration);
    setTimeLeft(ex.duration);
    pause();
    setCompleted(false);
    setPhase('inhale');
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Meditation</h1>
          <p className="mt-1 text-sm text-white/45">Calm your mind with guided breathing exercises</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ── Left column: exercise picker + sounds ── */}
          <div className="space-y-4">

            {/* Exercise picker */}
            <GlassCard className="p-5" hover={false}>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/50">Choose Exercise</h3>
              <div className="space-y-2">
                {exercises.map((ex) => {
                  const Icon = ex.icon;
                  const active = selected === ex.id;
                  return (
                    <motion.button key={ex.id} whileHover={{ x: 2 }} onClick={() => selectEx(ex)}
                      className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all ${
                        active
                          ? 'border-violet-500/35 bg-violet-500/12 text-white'
                          : 'border-white/[0.07] bg-white/[0.03] text-white/55 hover:border-white/15 hover:bg-white/[0.06]'
                      }`}>
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${ex.color} shadow-lg`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{ex.name}</p>
                        <p className="text-[10px] text-white/35">{ex.desc} · {Math.floor(ex.duration / 60)} min</p>
                      </div>
                      {active && <div className="ml-auto h-2 w-2 rounded-full bg-violet-400" />}
                    </motion.button>
                  );
                })}
              </div>
            </GlassCard>

            {/* Background sounds */}
            <GlassCard className="p-5" hover={false}>
              <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50">
                <Volume2 className="h-3.5 w-3.5" /> Background Sound
              </h3>
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>Volume</span><span>{volume}%</span>
                </div>
                <Slider value={[volume]} onValueChange={(v: number[]) => setVolume(v[0])} className="w-full" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {sounds.map((s) => (
                  <button key={s} onClick={() => setSound(sound === s ? '' : s)}
                    className={`rounded-xl border px-3 py-2 text-[11px] font-medium transition-all ${
                      sound === s
                        ? 'border-violet-500/35 bg-violet-500/15 text-violet-300'
                        : 'border-white/[0.07] bg-white/[0.03] text-white/45 hover:bg-white/[0.07]'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* ── Right 2-col: main meditation area ── */}
          <div className="lg:col-span-2 space-y-5">
            <GlassCard className="p-8" hover={false}>
              <div className="flex flex-col items-center gap-6">

                {/* Breathing orb */}
                <div className="relative flex h-56 w-56 items-center justify-center">
                  {/* Outer breath ring */}
                  <motion.div
                    animate={{ scale: phase === 'inhale' ? [1, 1.45] : phase === 'hold' ? 1.45 : [1.45, 1] }}
                    transition={{ duration: 4, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/10 blur-2xl"
                  />
                  <motion.div
                    animate={{ scale: phase === 'inhale' ? [1, 1.25] : phase === 'hold' ? 1.25 : [1.25, 1] }}
                    transition={{ duration: 4, ease: 'easeInOut' }}
                    className="absolute inset-4 rounded-full border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 blur-lg"
                  />
                  <div className="relative z-10">
                    <LunaAvatar state={completed ? 'happy' : isPlaying ? 'listening' : 'default'} size="xl" showRing={isPlaying} />
                  </div>
                </div>

                {/* Breath instruction */}
                <AnimatePresence mode="wait">
                  {completed ? (
                    <motion.div key="done" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-2 text-center">
                      <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                      <p className="text-lg font-bold text-white">Session Complete</p>
                      <p className="text-xs text-white/40">Great work! You completed your meditation.</p>
                    </motion.div>
                  ) : (
                    <motion.div key={phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }}
                      className="text-center">
                      <p className="text-xl font-bold capitalize text-white">{phase}</p>
                      <p className="mt-1 text-sm text-white/45">{breathText[phase]}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Timer + progress */}
                <div className="w-full max-w-xs text-center">
                  <p className="mb-2 font-mono text-5xl font-bold text-white">{fmt(timeLeft)}</p>
                  <Progress value={progress} className="h-2" />
                  <p className="mt-2 text-[10px] text-white/30">
                    {fmt(totalTime - timeLeft)} elapsed · {fmt(timeLeft)} remaining
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={isPlaying ? pause : start}
                    disabled={timeLeft === 0 && !completed}
                    className="btn-glow flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold text-white disabled:opacity-50">
                    {isPlaying ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" />{timeLeft === totalTime ? 'Start' : 'Resume'}</>}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={reset}
                    className="flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white/60 hover:bg-white/[0.09] transition-colors">
                    <RotateCcw className="h-4 w-4" /> Reset
                  </motion.button>
                </div>
              </div>
            </GlassCard>

            {/* Tips */}
            <GlassCard className="p-6" hover={false}>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20">
                  <Flower2 className="h-3.5 w-3.5 text-teal-400" />
                </div>
                <h3 className="text-sm font-bold text-white">Tips for Better Meditation</h3>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  'Find a quiet, comfortable space',
                  'Close your eyes or soften your gaze',
                  'Focus on your breath rhythm',
                  'Let thoughts pass without judgment',
                  'Sit with your back straight',
                  'Start with shorter sessions',
                ].map((tip) => (
                  <div key={tip} className="flex items-start gap-2 text-xs text-white/45">
                    <span className="mt-0.5 text-teal-400">✦</span> {tip}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
