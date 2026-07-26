'use client';

import { motion } from 'framer-motion';
import { Mic, Upload, Radio } from 'lucide-react';
import GlassCard from '@/components/dashboard/GlassCard';
import { Button } from '@/components/ui/button';
import { voiceAnalysis } from '@/components/dashboard/mock-data';

const waveformHeights = [28, 44, 20, 52, 36, 48, 24, 40, 32, 56, 22, 38];

const VoiceAnalysisCard = () => {
  return (
    <GlassCard delay={0.2} className="flex h-full flex-col">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-white/40">
            Voice Analysis
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Audio Emotion Detection
          </h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/15">
          <Mic className="h-5 w-5 text-indigo-300" />
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className="rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:opacity-90">
            <Upload className="h-4 w-4" />
            Upload Voice
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            <Radio className="h-4 w-4" />
            Live Analysis
          </Button>
        </motion.div>
      </div>

      <div className="mb-6 flex h-20 items-end justify-center gap-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        {waveformHeights.map((height, i) => (
          <motion.div
            key={i}
            animate={{ scaleY: [0.4, 1, 0.6, 0.9, 0.5] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.08,
              ease: 'easeInOut',
            }}
            className="w-1.5 origin-bottom rounded-full bg-gradient-to-t from-blue-500 to-violet-400"
            style={{ height: `${height}px` }}
          />
        ))}
      </div>

      <div className="mt-auto grid grid-cols-3 gap-3">
        {[
          { label: 'Emotion', value: voiceAnalysis.emotion },
          { label: 'Stress', value: voiceAnalysis.stress },
          { label: 'Confidence', value: `${voiceAnalysis.confidence}%` },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center"
          >
            <p className="text-[10px] uppercase tracking-wider text-white/40">
              {item.label}
            </p>
            <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default VoiceAnalysisCard;
