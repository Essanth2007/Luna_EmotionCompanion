'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileAudio, FileVideo, X, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { GlassCard } from '@/components/common/GlassCard';
import { LunaAvatar } from '@/components/common/LunaAvatar';
import { Progress } from '@/components/ui/progress';
import { voiceService } from '@/services/voice';
import { videoService } from '@/services/video';

type UploadState = 'idle' | 'ready' | 'uploading' | 'uploaded' | 'analyzing' | 'done' | 'error';

const MAX_AUDIO_MB = 50;
const MAX_VIDEO_MB = 100;

export default function UploadPage() {
  const [file,          setFile]          = useState<File | null>(null);
  const [uploadState,   setUploadState]   = useState<UploadState>('idle');
  const [progress,      setProgress]      = useState(0);
  const [dragActive,    setDragActive]    = useState(false);
  const [errorMsg,      setErrorMsg]      = useState('');

  const isAudio = file?.type.startsWith('audio/');

  const validateFile = (f: File): string | null => {
    const mb = f.size / 1024 / 1024;
    if (f.type.startsWith('audio/') && mb > MAX_AUDIO_MB) return `Audio must be under ${MAX_AUDIO_MB} MB`;
    if (f.type.startsWith('video/') && mb > MAX_VIDEO_MB) return `Video must be under ${MAX_VIDEO_MB} MB`;
    if (!f.type.startsWith('audio/') && !f.type.startsWith('video/')) return 'Only audio or video files are supported';
    return null;
  };

  const acceptFile = (f: File) => {
    const err = validateFile(f);
    if (err) { setErrorMsg(err); return; }
    setFile(f);
    setUploadState('ready');
    setErrorMsg('');
    setProgress(0);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) acceptFile(f);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) acceptFile(f);
    e.target.value = '';
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploadState('uploading');
    setProgress(0);
    // Simulate chunked upload progress
    for (let i = 10; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 150));
      setProgress(i);
    }
    setUploadState('uploaded');
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setUploadState('analyzing');
    try {
      if (isAudio) {
        await voiceService.analyzeVoice({ audioFile: file, duration: 0 });
      } else {
        await videoService.analyzeVideo({ videoFile: file, duration: 0 });
      }
      setUploadState('done');
    } catch {
      setUploadState('error');
      setErrorMsg('Analysis failed. Please try again.');
    }
  };

  const reset = () => {
    setFile(null);
    setUploadState('idle');
    setProgress(0);
    setErrorMsg('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Upload Analysis</h1>
            <p className="mt-1 text-sm text-white/45">Upload audio or video for emotion analysis</p>
          </div>
          {file && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={reset}
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/50 hover:text-white/80 hover:bg-white/[0.08] transition-colors">
              <X className="h-3.5 w-3.5" /> Clear
            </motion.button>
          )}
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              <X className="h-4 w-4 shrink-0" /> {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Drop zone */}
          <GlassCard className="p-7">
            <h2 className="mb-5 text-base font-semibold text-white">Upload File</h2>

            <div
              onDragEnter={handleDrag} onDragLeave={handleDrag}
              onDragOver={handleDrag} onDrop={handleDrop}
              className={`relative rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
                dragActive
                  ? 'border-violet-400/60 bg-violet-500/10'
                  : file
                  ? 'border-violet-500/30 bg-violet-500/5'
                  : 'border-white/15 hover:border-white/30 hover:bg-white/[0.02]'
              }`}
            >
              <input type="file" accept="audio/*,video/*" onChange={handleSelect}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                disabled={uploadState === 'uploading' || uploadState === 'analyzing'} />

              {!file ? (
                <div className="space-y-4">
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                    <Upload className="mx-auto h-12 w-12 text-white/20" />
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold text-white/60">Drag & drop or click to browse</p>
                    <p className="mt-1 text-xs text-white/30">Audio up to 50 MB · Video up to 100 MB</p>
                  </div>
                  <div className="flex items-center justify-center gap-6">
                    <span className="flex items-center gap-1.5 text-[11px] text-white/30">
                      <FileAudio className="h-3.5 w-3.5" /> MP3, WAV, M4A, AAC
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-white/30">
                      <FileVideo className="h-3.5 w-3.5" /> MP4, MOV, WebM
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    isAudio ? 'bg-violet-500/20 text-violet-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {isAudio ? <FileAudio className="h-6 w-6" /> : <FileVideo className="h-6 w-6" />}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="truncate text-sm font-semibold text-white/80">{file.name}</p>
                    <p className="text-xs text-white/35">
                      {(file.size / 1024 / 1024).toFixed(2)} MB · {isAudio ? 'Audio' : 'Video'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload progress */}
            {uploadState === 'uploading' && (
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>Uploading…</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Action buttons */}
            <AnimatePresence>
              {uploadState === 'ready' && (
                <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleUpload}
                  className="btn-glow mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white">
                  <Upload className="h-4 w-4" /> Upload File
                </motion.button>
              )}
              {uploadState === 'uploaded' && (
                <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleAnalyze}
                  className="btn-glow mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white">
                  Analyze {isAudio ? 'Audio' : 'Video'}
                </motion.button>
              )}
            </AnimatePresence>
          </GlassCard>

          {/* Status panel */}
          <GlassCard className="flex flex-col items-center justify-center p-7 text-center">
            <AnimatePresence mode="wait">

              {(uploadState === 'idle') && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4">
                  <LunaAvatar state="thinking" size="xl" float showRing />
                  <p className="text-sm font-medium text-white/50">Upload a file to begin</p>
                  <p className="text-xs text-white/30">Luna will analyze the emotions in your recording</p>
                </motion.div>
              )}

              {uploadState === 'ready' && (
                <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4">
                  <LunaAvatar state="listening" size="xl" float showRing />
                  <p className="text-sm font-medium text-white/60">File ready</p>
                  <p className="text-xs text-white/30">Click upload to proceed</p>
                </motion.div>
              )}

              {uploadState === 'uploading' && (
                <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="h-16 w-16 rounded-full border-4 border-violet-500/20 border-t-violet-500" />
                  <p className="text-sm font-medium text-white/60">Uploading…</p>
                </motion.div>
              )}

              {uploadState === 'uploaded' && (
                <motion.div key="uploaded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4">
                  <LunaAvatar state="default" size="xl" float showRing />
                  <p className="text-sm font-medium text-white/60">Upload complete!</p>
                  <p className="text-xs text-white/30">Click Analyze to detect emotions</p>
                </motion.div>
              )}

              {uploadState === 'analyzing' && (
                <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4">
                  <LunaAvatar state="thinking" size="xl" float showRing />
                  <p className="text-sm font-medium text-white/60">Analyzing emotions…</p>
                  <p className="text-xs text-white/30">This may take a moment</p>
                </motion.div>
              )}

              {uploadState === 'done' && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-5">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
                    <CheckCircle2 className="h-16 w-16 text-emerald-400" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Analysis Complete!</h3>
                    <p className="mt-1 text-sm text-white/45">
                      Your {isAudio ? 'audio' : 'video'} has been processed
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <Link href={isAudio ? '/dashboard/voice' : '/dashboard/video'}>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        className="btn-glow flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white">
                        View Results <ArrowRight className="h-4 w-4" />
                      </motion.button>
                    </Link>
                    <button onClick={reset}
                      className="rounded-full border border-white/[0.1] bg-white/[0.04] py-2.5 text-xs font-semibold text-white/50 hover:bg-white/[0.08] transition-colors">
                      Upload Another
                    </button>
                  </div>
                </motion.div>
              )}

              {uploadState === 'error' && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-4">
                  <LunaAvatar state="sad" size="xl" showRing />
                  <p className="text-sm font-medium text-rose-400">Something went wrong</p>
                  <p className="text-xs text-white/35">{errorMsg}</p>
                  <button onClick={() => setUploadState('uploaded')}
                    className="rounded-full border border-white/[0.1] bg-white/[0.04] px-6 py-2.5 text-xs font-semibold text-white/50 hover:bg-white/[0.08] transition-colors">
                    Try Again
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </GlassCard>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            {
              icon: FileAudio, label: 'Audio Files', color: 'text-violet-400',
              items: ['MP3, WAV, M4A, AAC', 'Maximum size: 50 MB', 'Duration: up to 10 minutes'],
            },
            {
              icon: FileVideo, label: 'Video Files', color: 'text-amber-400',
              items: ['MP4, MOV, AVI, WebM', 'Maximum size: 100 MB', 'Duration: up to 5 minutes'],
            },
          ].map(({ icon: Icon, label, color, items }) => (
            <GlassCard key={label} className="p-5" hover={false}>
              <div className="mb-3 flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color}`} />
                <h3 className="text-xs font-bold text-white/70">{label}</h3>
              </div>
              <ul className="space-y-1.5">
                {items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-white/40">
                    <span className="text-violet-400">·</span> {item}
                  </li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}
