'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, Music, Wind, Flower2 } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { GlassCard } from '@/components/common/GlassCard';
import { LunaAvatar } from '@/components/common/LunaAvatar';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';

export default function MeditationPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
  const [totalTime, setTotalTime] = useState(300);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [selectedExercise, setSelectedExercise] = useState('breathing');
  const [volume, setVolume] = useState(70);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const exercises = [
    { id: 'breathing', name: 'Box Breathing', duration: 300, icon: Wind },
    { id: 'relax', name: 'Deep Relaxation', duration: 600, icon: Flower2 },
    { id: 'focus', name: 'Mindful Focus', duration: 900, icon: Music },
  ];

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    };
  }, []);

  const startMeditation = () => {
    setIsPlaying(true);
    startBreathingCycle();
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          clearInterval(timerRef.current!);
          if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseMeditation = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
  };

  const resetMeditation = () => {
    setIsPlaying(false);
    setTimeLeft(totalTime);
    setBreathPhase('inhale');
    if (timerRef.current) clearInterval(timerRef.current);
    if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
  };

  const startBreathingCycle = () => {
    const cycle = () => {
      setBreathPhase('inhale');
      setTimeout(() => setBreathPhase('hold'), 4000);
      setTimeout(() => setBreathPhase('exhale'), 8000);
      setTimeout(() => setBreathPhase('hold'), 12000);
    };
    
    cycle();
    breathIntervalRef.current = setInterval(cycle, 16000);
  };

  const selectExercise = (exercise: typeof exercises[0]) => {
    setSelectedExercise(exercise.id);
    setTotalTime(exercise.duration);
    setTimeLeft(exercise.duration);
    resetMeditation();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Meditation</h1>
          <p className="text-muted-foreground mt-1">
            Relax your mind with guided exercises
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exercise Selection */}
          <div className="lg:col-span-1 space-y-4">
            <GlassCard className="p-6">
              <h3 className="font-semibold mb-4">Choose Exercise</h3>
              <div className="space-y-2">
                {exercises.map((exercise) => {
                  const Icon = exercise.icon;
                  return (
                    <button
                      key={exercise.id}
                      onClick={() => selectExercise(exercise)}
                      className={`w-full p-4 rounded-lg glass text-left transition-colors ${
                        selectedExercise === exercise.id
                          ? 'bg-primary/20 border-primary'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <div>
                          <p className="font-medium">{exercise.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.floor(exercise.duration / 60)} min
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Background Sounds
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Volume</span>
                    <span className="text-sm">{volume}%</span>
                  </div>
                  <Slider
                    value={[volume]}
                    onValueChange={(value: number[]) => setVolume(value[0])}
                  />
                </div>
                <div className="flex gap-2">
                  {['Rain', 'Ocean', 'Forest', 'White Noise'].map((sound) => (
                    <button
                      key={sound}
                      className="flex-1 p-2 text-xs rounded-lg glass hover:bg-white/5"
                    >
                      {sound}
                    </button>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Main Meditation Area */}
          <div className="lg:col-span-2">
            <GlassCard className="p-8">
              <div className="flex flex-col items-center">
                {/* Breathing Animation */}
                <div className="relative w-64 h-64 mb-8">
                  <motion.div
                    animate={{
                      scale: breathPhase === 'inhale' ? [1, 1.5] :
                             breathPhase === 'hold' ? 1.5 :
                             breathPhase === 'exhale' ? [1.5, 1] : 1,
                    }}
                    transition={{ duration: 4, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-xl"
                  />
                  <motion.div
                    animate={{
                      scale: breathPhase === 'inhale' ? [1, 1.3] :
                             breathPhase === 'hold' ? 1.3 :
                             breathPhase === 'exhale' ? [1.3, 1] : 1,
                    }}
                    transition={{ duration: 4, ease: 'easeInOut' }}
                    className="absolute inset-8 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 blur-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <LunaAvatar state="listening" size="xl" />
                  </div>
                </div>

                {/* Breathing Instruction */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={breathPhase}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center mb-8"
                  >
                    <p className="text-2xl font-semibold capitalize">{breathPhase}</p>
                    <p className="text-muted-foreground">
                      {breathPhase === 'inhale' ? 'Breathe in slowly...' :
                       breathPhase === 'hold' ? 'Hold your breath...' :
                       'Breathe out slowly...'}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Timer */}
                <div className="text-center mb-8">
                  <p className="text-6xl font-mono font-bold">{formatTime(timeLeft)}</p>
                  <Progress value={progress} className="w-64 mt-2" />
                </div>

                {/* Controls */}
                <div className="flex gap-4">
                  <Button
                    onClick={isPlaying ? pauseMeditation : startMeditation}
                    disabled={timeLeft === 0}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        {timeLeft === totalTime ? 'Start' : 'Resume'}
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={resetMeditation}
                    variant="outline"
                    size="lg"
                    className="glass"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </GlassCard>

            {/* Tips */}
            <GlassCard className="p-6 mt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Flower2 className="w-5 h-5" />
                Tips for Better Meditation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-primary">•</span>
                  <p className="text-muted-foreground">Find a quiet, comfortable space</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary">•</span>
                  <p className="text-muted-foreground">Close your eyes or soften your gaze</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary">•</span>
                  <p className="text-muted-foreground">Focus on your breath</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary">•</span>
                  <p className="text-muted-foreground">Let thoughts pass without judgment</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
