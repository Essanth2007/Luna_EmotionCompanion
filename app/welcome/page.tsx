'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, SkipForward } from 'lucide-react';
import { markWelcomeSeen, hasSeenWelcome, getStoredUser } from '@/store/auth';

const messages = [
  { id: 1, text: "Hi! I'm Luna." },
  { id: 2, text: "I'm here to understand, support, and listen to you." },
  { id: 3, text: "Let's begin your wellness journey together." },
];

export default function WelcomePage() {
  const router          = useRouter();
  const videoRef        = useRef<HTMLVideoElement>(null);
  const [msgIndex, setMsgIndex]   = useState(0);
  const [showCTA, setShowCTA]     = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const userName = getStoredUser()?.name?.split(' ')[0] ?? '';

  const handleContinue = useCallback(() => {
    markWelcomeSeen();
    router.push('/dashboard');
  }, [router]);

  // Cycle through messages
  useEffect(() => {
    if (msgIndex >= messages.length - 1) {
      const t = setTimeout(() => setShowCTA(true), 1200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setMsgIndex((p) => p + 1), 2000);
    return () => clearTimeout(t);
  }, [msgIndex]);

  // Returning users skip straight through
  useEffect(() => {
    if (hasSeenWelcome()) {
      setIsReturning(true);
      const t = setTimeout(handleContinue, 2800);
      return () => clearTimeout(t);
    }
  }, [handleContinue]);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 80% 70% at 50% 0%, rgba(139,92,246,0.25) 0%, transparent 65%), linear-gradient(160deg,#0d0818 0%,#130d24 50%,#060912 100%)',
      }}
    >
      {/* Atmospheric blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div animate={{ scale:[1,1.1,1], opacity:[0.15,0.28,0.15] }}
          transition={{ duration:10, repeat:Infinity }}
          className="absolute -right-20 top-0 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[130px]" />
        <motion.div animate={{ scale:[1,1.08,1], opacity:[0.1,0.2,0.1] }}
          transition={{ duration:13, repeat:Infinity, delay:3 }}
          className="absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full bg-indigo-600/15 blur-[110px]" />
      </div>

      {/* Skip */}
      <motion.button
        initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1 }}
        onClick={handleContinue}
        className="absolute right-6 top-6 z-20 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/50 backdrop-blur-sm hover:bg-white/10 hover:text-white/80 transition-all"
      >
        <SkipForward className="h-3.5 w-3.5" /> Skip
      </motion.button>

      {/* Main content */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-8 px-6 text-center">

        {/* Luna video orb */}
        <motion.div
          initial={{ opacity:0, scale:0.8 }}
          animate={{ opacity:1, scale:1 }}
          transition={{ duration:0.8, ease:[0.22,1,0.36,1] }}
          className="relative"
        >
          {/* Glow rings */}
          <motion.div animate={{ scale:[1,1.08,1], opacity:[0.3,0.1,0.3] }}
            transition={{ duration:3.5, repeat:Infinity }}
            className="absolute inset-0 rounded-full bg-violet-500/25 blur-2xl" style={{ margin:'-20%' }} />
          <motion.div animate={{ scale:[1.05,1,1.05], opacity:[0.15,0.3,0.15] }}
            transition={{ duration:5, repeat:Infinity, delay:1 }}
            className="absolute inset-0 rounded-full bg-fuchsia-500/15 blur-3xl" style={{ margin:'-35%' }} />

          {/* Circular video container */}
          <motion.div
            animate={{ y:[0,-12,0] }}
            transition={{ duration:5, repeat:Infinity, ease:'easeInOut' }}
            className="luna-video-ring relative h-56 w-56 overflow-hidden rounded-full md:h-64 md:w-64"
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="h-full w-full object-contain"
              aria-label="Luna welcome animation"
            >
              <source src="/assets/luna/videos/luna-welcome.mp4" type="video/mp4" />
            </video>
            {/* Inner vignette */}
            <div className="pointer-events-none absolute inset-0 rounded-full"
              style={{ background:'radial-gradient(circle at center, transparent 50%, rgba(13,8,24,0.5) 100%)' }} />
          </motion.div>
        </motion.div>

        {/* Greeting */}
        {userName && !isReturning && (
          <motion.p initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
            className="text-base font-medium text-violet-300/70">
            Hello, <span className="text-white font-semibold">{userName}</span> 👋
          </motion.p>
        )}
        {isReturning && (
          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }}
            className="text-base font-medium text-violet-300/70">
            Welcome back, <span className="text-white font-semibold">{userName}</span> 👋
          </motion.p>
        )}

        {/* Cycling messages */}
        {!isReturning && (
          <div className="h-16 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.h2
                key={msgIndex}
                initial={{ opacity:0, y:16 }}
                animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-16 }}
                transition={{ duration:0.5, ease:'easeOut' }}
                className="text-2xl font-bold text-white md:text-3xl"
              >
                {messages[msgIndex].text}
              </motion.h2>
            </AnimatePresence>
          </div>
        )}

        {/* CTA */}
        <AnimatePresence>
          {(showCTA || isReturning) && (
            <motion.div
              initial={{ opacity:0, y:16 }}
              animate={{ opacity:1, y:0 }}
              transition={{ duration:0.6 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.button
                whileHover={{ scale:1.04, boxShadow:'0 0 36px rgba(139,92,246,0.5)' }}
                whileTap={{ scale:0.97 }}
                onClick={handleContinue}
                className="btn-glow flex items-center gap-2.5 rounded-full px-10 py-4 text-base font-bold text-white"
              >
                {isReturning ? "Let's go" : "Let's get started"}
                <ArrowRight className="h-5 w-5" />
              </motion.button>
              <p className="text-xs text-white/30">Your safe space for emotional wellness</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress dots */}
        {!isReturning && (
          <div className="flex items-center gap-2">
            {messages.map((_, i) => (
              <motion.div key={i} animate={{ scale: i <= msgIndex ? 1 : 0.7, opacity: i <= msgIndex ? 1 : 0.3 }}
                className={`h-1.5 rounded-full transition-all ${i <= msgIndex ? 'bg-violet-400 w-4' : 'bg-white/20 w-1.5'}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
