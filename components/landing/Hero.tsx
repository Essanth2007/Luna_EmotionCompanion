'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, BarChart2, MessageCircle, Star, Lock } from 'lucide-react';
import Link from 'next/link';

/* ── helpers ─────────────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: 'easeOut' as const },
});

const featureCards = [
  { icon: Heart,          label: 'Understand', desc: 'Know your emotions deeply',      gradient: 'from-rose-500 to-pink-500',     bg: 'bg-rose-500/12',    border: 'border-rose-400/20' },
  { icon: BarChart2,      label: 'Analyze',    desc: 'Pattern recognition & insights', gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-500/12',  border: 'border-violet-400/20' },
  { icon: MessageCircle,  label: 'Support',    desc: 'Always here to listen',          gradient: 'from-blue-500 to-indigo-500',   bg: 'bg-blue-500/12',    border: 'border-blue-400/20' },
  { icon: Star,           label: 'Grow',       desc: 'Build a healthier mindset',      gradient: 'from-amber-500 to-orange-400',  bg: 'bg-amber-500/12',   border: 'border-amber-400/20' },
];

/* star positions – static so no hydration mismatch */
const stars = [
  { x: '8%',  y: '12%', s: 2,   d: 2.1 }, { x: '18%', y: '72%', s: 1.5, d: 3.4 },
  { x: '27%', y: '38%', s: 1,   d: 1.8 }, { x: '42%', y: '88%', s: 2,   d: 2.7 },
  { x: '55%', y: '22%', s: 1.5, d: 4.1 }, { x: '63%', y: '60%', s: 2,   d: 1.5 },
  { x: '74%', y: '14%', s: 1,   d: 3.0 }, { x: '82%', y: '82%', s: 2.5, d: 2.3 },
  { x: '90%', y: '45%', s: 1.5, d: 1.9 }, { x: '95%', y: '8%',  s: 1,   d: 3.6 },
  { x: '5%',  y: '55%', s: 2,   d: 2.8 }, { x: '35%', y: '5%',  s: 1,   d: 4.4 },
];

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-20">

      {/* ── Background ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Glowing blobs */}
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="blob-drift absolute -top-32 right-[-10%] h-[620px] w-[620px] rounded-full bg-gradient-to-br from-violet-600/30 via-purple-500/20 to-fuchsia-500/15 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="blob-drift absolute -bottom-20 -left-20 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-indigo-600/25 via-blue-500/15 to-cyan-500/10 blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.18, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
          className="absolute left-1/3 top-1/3 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-fuchsia-600/20 to-pink-500/10 blur-[80px]"
        />

        {/* Stars */}
        {stars.map((s, i) => (
          <motion.div
            key={i}
            className="star absolute rounded-full bg-white"
            style={{
              left: s.x, top: s.y,
              width: s.s, height: s.s,
              animationDuration: `${s.d}s`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '48px 48px' }}
        />
      </div>

      {/* ── Content ── */}
      <div className="container-custom relative z-10 w-full py-16 md:py-0">
        <div className="grid min-h-[calc(100vh-5rem)] grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* ── LEFT ── */}
          <div className="flex flex-col gap-7">

            {/* Eyebrow badge */}
            <motion.div {...fadeUp(0.1)}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-1.5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wide text-violet-300">AI Emotional Companion</span>
            </motion.div>

            {/* Heading */}
            <motion.div {...fadeUp(0.2)}>
              <h1 className="text-[3.25rem] font-black leading-[1.05] tracking-tight text-white md:text-[4rem] lg:text-[4.25rem]">
                Hi, I'm{' '}
                <span
                  className="bg-gradient-to-r from-violet-300 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent"
                  style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  Luna
                </span>
                <br />
                <span className="text-white/90">I'm here for you.</span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p {...fadeUp(0.3)}
              className="max-w-[440px] text-[1.05rem] leading-relaxed text-white/55">
              Your emotional companion that understands, supports and helps you grow every day.
            </motion.p>

            {/* Feature cards */}
            <motion.div {...fadeUp(0.4)} className="grid grid-cols-2 gap-3">
              {featureCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -3, scale: 1.02 }}
                    className={`feature-chip flex items-center gap-3 px-4 py-3 ${card.bg} ${card.border} border cursor-default`}
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} shadow-md`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white/90">{card.label}</p>
                      <p className="text-[10px] leading-tight text-white/40">{card.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* CTA buttons */}
            <motion.div {...fadeUp(0.6)} className="flex flex-col gap-3 sm:flex-row">
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: '0 0 36px rgba(167,139,250,0.55)' }}
                  whileTap={{ scale: 0.97 }}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition-shadow sm:w-auto"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </Link>
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.09)' }}
                  whileTap={{ scale: 0.97 }}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-8 py-3.5 text-sm font-semibold text-white/75 backdrop-blur-sm transition-all sm:w-auto hover:text-white"
                >
                  I already have an account
                </motion.button>
              </Link>
            </motion.div>

            {/* Trust line */}
            <motion.div {...fadeUp(0.75)} className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-white/30" />
              <span className="text-xs text-white/35">Your data is private and secure</span>
            </motion.div>
          </div>

          {/* ── RIGHT — Luna video ── */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center"
          >
            {/* Floating container */}
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              {/* Outer glow rings */}
              <motion.div
                animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.15, 0.35] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-violet-500/20 blur-2xl"
                style={{ margin: '-20%' }}
              />
              <motion.div
                animate={{ scale: [1.05, 1, 1.05], opacity: [0.2, 0.35, 0.2] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute inset-0 rounded-full bg-fuchsia-500/15 blur-3xl"
                style={{ margin: '-30%' }}
              />

              {/* Main circular video container */}
              <div className="luna-video-ring relative h-[340px] w-[340px] overflow-hidden rounded-full md:h-[400px] md:w-[400px] lg:h-[440px] lg:w-[440px]">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-contain"
                  aria-label="Luna emotional companion welcome animation"
                >
                  <source src="/assets/luna/videos/luna wecome video.mp4" type="video/mp4" />
                </video>

                {/* Subtle inner vignette */}
                <div className="pointer-events-none absolute inset-0 rounded-full"
                  style={{ background: 'radial-gradient(circle at center, transparent 55%, rgba(13,8,24,0.45) 100%)' }}
                />
              </div>

              {/* Floating status chip — top */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="absolute -right-4 top-8 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.09] px-4 py-2.5 backdrop-blur-xl shadow-xl md:-right-8"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/60" />
                <span className="text-xs font-semibold text-white/80">Luna is listening</span>
              </motion.div>

              {/* Floating mood chip — bottom */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.35, duration: 0.5 }}
                className="absolute -left-4 bottom-12 flex items-center gap-2 rounded-2xl border border-violet-400/25 bg-violet-500/15 px-4 py-2.5 backdrop-blur-xl shadow-xl md:-left-8"
              >
                <span className="text-sm">💜</span>
                <span className="text-xs font-semibold text-violet-200">Feeling better today</span>
              </motion.div>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-2"
        >
          <motion.div
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="h-1.5 w-1 rounded-full bg-white/40"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
