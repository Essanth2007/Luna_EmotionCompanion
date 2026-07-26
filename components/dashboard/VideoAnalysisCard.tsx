'use client';

import { motion } from 'framer-motion';
import { Video, Upload, Camera } from 'lucide-react';
import GlassCard from '@/components/dashboard/GlassCard';
import { Button } from '@/components/ui/button';
import { videoAnalysis } from '@/components/dashboard/mock-data';

const VideoAnalysisCard = () => {
  return (
    <GlassCard delay={0.25} className="flex h-full flex-col">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-white/40">
            Video Analysis
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Facial Emotion Detection
          </h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/15">
          <Video className="h-5 w-5 text-violet-300" />
        </div>
      </div>

      <div className="relative mb-5 aspect-video overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-indigo-950/60">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-white/20"
          >
            <Camera className="h-7 w-7 text-white/30" />
          </motion.div>
        </div>
        <div className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-2 py-1 text-[10px] font-medium text-white/70 backdrop-blur-sm">
          Camera Preview
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-rose-500/20 px-2 py-1 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
          <span className="text-[10px] font-medium text-rose-300">Ready</span>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className="rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:opacity-90">
            <Upload className="h-4 w-4" />
            Upload Video
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            <Camera className="h-4 w-4" />
            Live Camera
          </Button>
        </motion.div>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-3">
        {[
          { label: 'Emotion', value: videoAnalysis.detectedEmotion },
          { label: 'Confidence', value: `${videoAnalysis.confidence}%` },
          { label: 'Stress', value: videoAnalysis.stressLevel },
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

export default VideoAnalysisCard;
