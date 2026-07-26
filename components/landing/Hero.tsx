'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, MessageSquare, Mic, Video, Heart } from 'lucide-react';
import Link from 'next/link';
import { LunaAvatar } from '@/components/common/LunaAvatar';

const floatingCards = [
  { icon: MessageSquare, label: 'AI Chat',       delay: 0.8,  x: '-120%', y: '-40%', color: 'from-violet-500 to-purple-500' },
  { icon: Mic,           label: 'Voice Scan',    delay: 1.0,  x: '120%',  y: '-30%', color: 'from-pink-500 to-rose-500' },
  { icon: Video,         label: 'Face Detect',   delay: 1.2,  x: '-110%', y: '50%',  color: 'from-blue-500 to-cyan-500' },
  { icon: Heart,         label: 'Wellness',      delay: 1.4,  x: '110%',  y: '55%',  color: 'from-emerald-500 to-teal-500' },
];

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-20">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div animate={{ scale: [1,1.15,1], opacity:[0.15,0.25,0.15] }} transition={{ duration: 9, repeat: Infinity }}
          className="absolute -top-20 right-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-violet-600/30 via-indigo-600/20 to-blue-600/20 blur-[120px]" />
        <motion.div animate={{ scale: [1,1.2,1], opacity:[0.1,0.2,0.1] }} transition={{ duration: 11, repeat: Infinity, delay: 2 }}
          className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-600/20 via-cyan-600/15 to-teal-600/15 blur-[100px]" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: [0.22,1,0.36,1] }} className="space-y-7">
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              <span className="text-xs font-semibold text-violet-300">AI-Powered Emotional Intelligence</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="text-5xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl text-white">
              Understand Your{' '}
              <span className="text-gradient">Emotions.</span>
              <br />
              Heal with{' '}
              <span className="text-gradient">AI.</span>
            </motion.h1>

            {/* Description */}
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="max-w-lg text-lg leading-relaxed text-white/55">
              Luna is your AI emotional companion — analyzing voice, facial expressions, and conversations to provide deeply personal mental wellness guidance.
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
              className="flex flex-wrap gap-3">
              <Link href="/register">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className="btn-glow flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-bold text-white shadow-xl shadow-violet-500/25">
                  Start Free
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </Link>
              <Link href="/login">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-7 py-3.5 text-base font-bold text-white/80 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  Sign In
                </motion.button>
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
              className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['😊','🧘','💙','✨'].map((e,i) => (
                  <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-violet-500/30 to-blue-500/30 text-sm">
                    {e}
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/40"><span className="font-bold text-white/70">10,000+</span> people on their wellness journey</p>
            </motion.div>
          </motion.div>

          {/* Right — Luna illustration */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.22,1,0.36,1] }}
            className="relative flex items-center justify-center">
            {/* Outer orbit ring */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute h-80 w-80 rounded-full border border-violet-500/10 md:h-96 md:w-96" />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              className="absolute h-64 w-64 rounded-full border border-blue-500/10 md:h-80 md:w-80" />

            {/* Luna */}
            <div className="relative z-10">
              <LunaAvatar state="happy" size="2xl" float showRing />
            </div>

            {/* Floating feature cards */}
            {floatingCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: card.delay, type: 'spring', stiffness: 200, damping: 20 }}
                  className="absolute z-20"
                  style={{ left: '50%', top: '50%', transform: `translate(${card.x}, ${card.y})` }}
                >
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-2 backdrop-blur-xl shadow-xl">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${card.color}`}>
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-white/80">{card.label}</span>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-2">
          <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 2, repeat: Infinity }}
            className="h-1.5 w-1.5 rounded-full bg-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
