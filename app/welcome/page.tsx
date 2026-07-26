'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SkipForward, Play } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const [showVideo, setShowVideo] = useState(true);
  const [isReturning, setIsReturning] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  useEffect(() => {
    // Check if user has seen welcome before
    const hasSeenWelcome = localStorage.getItem('has_seen_welcome');
    if (hasSeenWelcome) {
      setIsReturning(true);
    }
  }, []);

  useEffect(() => {
    // Auto redirect after video ends or after delay for returning users
    let timeoutId: NodeJS.Timeout;

    if (isReturning) {
      // For returning users, show shorter welcome and redirect
      timeoutId = setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } else if (videoEnded) {
      // For new users, redirect after video ends
      timeoutId = setTimeout(() => {
        localStorage.setItem('has_seen_welcome', 'true');
        router.push('/dashboard');
      }, 2000);
    }

    return () => clearTimeout(timeoutId);
  }, [isReturning, videoEnded, router]);

  const handleSkip = () => {
    localStorage.setItem('has_seen_welcome', 'true');
    router.push('/dashboard');
  };

  const handleVideoEnd = () => {
    setVideoEnded(true);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/30 flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl"
        />
      </div>

      <AnimatePresence mode="wait">
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-4xl mx-auto px-4"
          >
            <div className="glass rounded-3xl overflow-hidden shadow-2xl">
              {/* Video Container */}
              <div className="relative aspect-video bg-black/50 flex items-center justify-center">
                {/* Placeholder for video - in production, use actual video */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="text-center"
                  >
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-6xl font-bold text-white">L</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome to Luna</h2>
                    <p className="text-white/80">Your AI Mental Health Companion</p>
                  </motion.div>
                </div>

                {/* Video element - commented out until actual video is available */}
                {/* <video
                  autoPlay
                  muted
                  playsInline
                  onEnded={handleVideoEnd}
                  className="w-full h-full object-cover"
                >
                  <source src="/assets/luna/videos/luna-welcome.mp4" type="video/mp4" />
                </video> */}

                {/* Skip Button */}
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  size="lg"
                  className="absolute top-4 right-4 text-white hover:bg-white/20"
                >
                  <SkipForward className="w-5 h-5 mr-2" />
                  Skip
                </Button>
              </div>

              {/* Welcome Message */}
              <div className="p-8 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {isReturning ? 'Welcome Back!' : 'Welcome to Luna'}
                  </h1>
                  <p className="text-lg text-muted-foreground mb-6">
                    {isReturning
                      ? 'We\'re glad to see you again. Let\'s continue your wellness journey.'
                      : 'I\'m Luna, your AI companion for mental wellness. Let\'s start your journey together.'}
                  </p>
                  {!isReturning && (
                    <Button
                      onClick={handleSkip}
                      size="lg"
                      className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    >
                      Get Started
                      <Play className="w-5 h-5 ml-2" />
                    </Button>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video ended indicator */}
      <AnimatePresence>
        {videoEnded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-20"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-xl font-semibold text-white">Redirecting to Dashboard...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
