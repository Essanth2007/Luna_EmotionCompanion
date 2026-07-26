'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Upload, Play, Pause, RotateCcw } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { GlassCard } from '@/components/common/GlassCard';
import { LunaAvatar } from '@/components/common/LunaAvatar';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { voiceService, type VoiceAnalysisResult } from '@/services/voice';

const waveBarCount = 32;

export default function VoicePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VoiceAnalysisResult | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(waveBarCount).fill(4));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const waveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    };
  }, []);

  const animateWave = () => {
    waveIntervalRef.current = setInterval(() => {
      setWaveHeights(Array(waveBarCount).fill(0).map(() => Math.random() * 36 + 4));
    }, 80);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioFile(new File([blob], 'recording.wav', { type: 'audio/wav' }));
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
      animateWave();
    } catch (e) { console.error(e); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    }
    setIsRecording(false);
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    setWaveHeights(Array(waveBarCount).fill(4));
  };

  const handleAnalyze = async () => {
    if (!audioFile) return;
    setIsAnalyzing(true);
    const response = await voiceService.analyzeVoice({ audioFile, duration: recordingTime });
    setIsAnalyzing(false);
    if (response.data) setAnalysisResult(response.data as VoiceAnalysisResult);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith('audio/')) { setAudioFile(file); setAnalysisResult(null); }
  };

  const reset = () => {
    setAudioFile(null); setAnalysisResult(null);
    setRecordingTime(0); setIsPlaying(false); setPlaybackProgress(0);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const severityColor = (s: string) => s === 'low' ? 'text-emerald-400' : s === 'moderate' ? 'text-amber-400' : 'text-rose-400';
  const severityBg   = (s: string) => s === 'low' ? 'bg-emerald-500/15 border-emerald-500/25' : s === 'moderate' ? 'bg-amber-500/15 border-amber-500/25' : 'bg-rose-500/15 border-rose-500/25';

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Voice Analysis</h1>
            <p className="mt-1 text-sm text-white/45">Detect emotions through speech patterns</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/50 hover:text-white/80 hover:bg-white/[0.08] transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </motion.button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* ── Record panel ── */}
          <GlassCard className="p-7">
            <h2 className="mb-6 text-base font-semibold text-white">Record Voice</h2>

            {/* Waveform */}
            <div className="mb-6 flex h-16 items-center justify-center gap-[2px] rounded-2xl border border-white/[0.07] bg-black/20 px-4">
              {waveHeights.map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ height: isRecording ? h : 4 }}
                  transition={{ duration: 0.08 }}
                  className={`w-[3px] rounded-full ${isRecording ? 'bg-gradient-to-t from-violet-600 to-violet-400' : 'bg-white/15'}`}
                  style={{ minHeight: 4 }}
                />
              ))}
            </div>

            {/* Mic button */}
            <div className="flex flex-col items-center gap-5">
              <div className="relative">
                {isRecording && (
                  <>
                    <motion.div animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 rounded-full bg-rose-500/30" />
                    <motion.div animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                      className="absolute inset-0 rounded-full bg-rose-500/20" />
                  </>
                )}
                <motion.button
                  whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full shadow-2xl transition-all ${
                    isRecording
                      ? 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/40'
                      : 'btn-glow'
                  }`}
                >
                  {isRecording ? <MicOff className="h-8 w-8 text-white" /> : <Mic className="h-8 w-8 text-white" />}
                </motion.button>
              </div>

              <div className="text-center">
                <p className="font-mono text-3xl font-bold text-white">{fmt(recordingTime)}</p>
                <p className="mt-1 text-xs text-white/40">
                  {isRecording ? '● Recording…' : audioFile ? 'Recording ready' : 'Tap to start'}
                </p>
              </div>

              <button
                disabled={isRecording}
                onClick={() => document.getElementById('audio-upload')?.click()}
                className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/55 hover:bg-white/[0.08] hover:text-white/80 transition-colors disabled:opacity-40"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload Audio
              </button>
              <input id="audio-upload" type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
            </div>

            {/* Player */}
            {audioFile && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
                <div className="flex items-center gap-3 mb-2">
                  <button onClick={() => setIsPlaying(!isPlaying)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors">
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <div className="flex-1">
                    <Slider value={[playbackProgress]} onValueChange={(v: number[]) => setPlaybackProgress(v[0])} className="w-full" />
                  </div>
                  <span className="text-xs text-white/40">{fmt(recordingTime)}</span>
                </div>
                <p className="truncate text-xs text-white/35">{audioFile.name}</p>
              </motion.div>
            )}

            {audioFile && !analysisResult && (
              <motion.button
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleAnalyze} disabled={isAnalyzing}
                className="btn-glow mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isAnalyzing ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                    Analyzing…
                  </>
                ) : 'Analyze Voice'}
              </motion.button>
            )}
          </GlassCard>

          {/* ── Results ── */}
          <GlassCard className="p-7">
            <h2 className="mb-6 text-base font-semibold text-white">Analysis Results</h2>

            {!analysisResult ? (
              <div className="flex h-72 flex-col items-center justify-center gap-4 text-center">
                <LunaAvatar state="thinking" size="xl" float showRing />
                <div>
                  <p className="text-sm font-medium text-white/60">Ready to analyze</p>
                  <p className="mt-1 text-xs text-white/35">Record or upload audio to detect emotions</p>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  {/* Primary emotion */}
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-violet-500/15 bg-violet-500/10 py-6">
                    <LunaAvatar state="happy" size="lg" showRing />
                    <div className="text-center">
                      <h3 className="text-xl font-bold capitalize text-white">{analysisResult.emotions.primary}</h3>
                      <p className="text-xs text-white/45">Confidence: {(analysisResult.emotions.confidence * 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  {/* Meters */}
                  {[
                    { label: 'Stress',     data: analysisResult.stress },
                    { label: 'Anxiety',    data: analysisResult.anxiety },
                    { label: 'Depression', data: analysisResult.depression },
                  ].map(({ label, data }) => (
                    <div key={label}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-xs font-medium text-white/70">{label}</span>
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${severityBg(data.severity)} ${severityColor(data.severity)}`}>
                          {data.severity}
                        </span>
                      </div>
                      <Progress value={data.level * 100} className="h-2" />
                    </div>
                  ))}

                  {/* Luna recommendations */}
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <LunaAvatar state="listening" size="sm" showRing={false} animate={false} />
                      <span className="text-xs font-semibold text-white/70">Luna's Recommendations</span>
                    </div>
                    <ul className="space-y-2">
                      {analysisResult.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/55">
                          <span className="mt-0.5 text-violet-400">✦</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
