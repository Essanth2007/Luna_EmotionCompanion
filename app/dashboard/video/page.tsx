'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Upload, Camera, CameraOff, RotateCcw, Scan } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { GlassCard } from '@/components/common/GlassCard';
import { LunaAvatar } from '@/components/common/LunaAvatar';
import { Progress } from '@/components/ui/progress';
import { videoService, type VideoAnalysisResult } from '@/services/video';

export default function VideoPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [useWebcam, setUseWebcam] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);

  useEffect(() => () => { mediaStreamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      mediaStreamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setUseWebcam(true);
    } catch (e) { console.error(e); }
  };

  const stopWebcam = () => {
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    setUseWebcam(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const startRecording = () => {
    if (!mediaStreamRef.current) return;
    mediaRecorderRef.current = new MediaRecorder(mediaStreamRef.current);
    videoChunksRef.current = [];
    mediaRecorderRef.current.ondataavailable = (e) => videoChunksRef.current.push(e.data);
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
      const file = new File([blob], 'recording.webm', { type: 'video/webm' });
      setVideoFile(file); setVideoUrl(URL.createObjectURL(blob)); stopWebcam();
    };
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleAnalyze = async () => {
    if (!videoFile) return;
    setIsAnalyzing(true);
    const response = await videoService.analyzeVideo({ videoFile, duration: videoRef.current?.duration || 0 });
    setIsAnalyzing(false);
    if (response.data) setAnalysisResult(response.data);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith('video/')) { setVideoFile(file); setVideoUrl(URL.createObjectURL(file)); setAnalysisResult(null); }
  };

  const reset = () => { setVideoFile(null); setVideoUrl(null); setAnalysisResult(null); setIsRecording(false); stopWebcam(); };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Video Analysis</h1>
            <p className="mt-1 text-sm text-white/45">Detect emotions through facial expressions</p>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={reset}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/50 hover:text-white/80 hover:bg-white/[0.08] transition-colors">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </motion.button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* ── Camera panel ── */}
          <GlassCard className="p-7">
            <h2 className="mb-5 text-base font-semibold text-white">Capture Video</h2>

            {/* Video preview */}
            <div className="relative mb-5 aspect-video overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40">
              {videoUrl ? (
                <video ref={videoRef} src={videoUrl} controls className="h-full w-full object-cover" />
              ) : useWebcam ? (
                <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-white/25">
                  <Video className="h-14 w-14" />
                  <p className="text-sm">No video source</p>
                </div>
              )}

              {/* Scan animation overlay when webcam is live */}
              {useWebcam && !isRecording && (
                <motion.div
                  animate={{ y: ['0%', '100%', '0%'] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                  className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent opacity-70"
                />
              )}

              {/* Live recording badge */}
              {isRecording && (
                <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                  className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-rose-500/80 px-3 py-1 backdrop-blur-sm">
                  <div className="h-2 w-2 rounded-full bg-white" />
                  <span className="text-xs font-semibold text-white">REC</span>
                </motion.div>
              )}

              {/* Emotion badge overlay when result ready */}
              {analysisResult && (
                <div className="absolute right-3 top-3 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 backdrop-blur-sm">
                  <span className="text-xs font-semibold capitalize text-emerald-300">{analysisResult.emotions.primary}</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-2">
              {!useWebcam && !videoUrl && (
                <>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                    onClick={startWebcam}
                    className="flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/15 px-4 py-2.5 text-xs font-semibold text-violet-300 hover:bg-violet-500/25 transition-colors">
                    <Camera className="h-3.5 w-3.5" /> Use Webcam
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                    onClick={() => document.getElementById('video-upload')?.click()}
                    className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-xs font-semibold text-white/60 hover:bg-white/[0.1] transition-colors">
                    <Upload className="h-3.5 w-3.5" /> Upload Video
                  </motion.button>
                  <input id="video-upload" type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
                </>
              )}

              {useWebcam && (
                <>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors ${
                      isRecording
                        ? 'border border-rose-500/40 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                        : 'btn-glow text-white'
                    }`}>
                    {isRecording ? <><CameraOff className="h-3.5 w-3.5" /> Stop</> : <><Video className="h-3.5 w-3.5" /> Record</>}
                  </motion.button>
                  <button onClick={stopWebcam}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-xs font-semibold text-white/50 hover:bg-white/[0.08] transition-colors">
                    Cancel
                  </button>
                </>
              )}
            </div>

            {videoFile && !analysisResult && (
              <motion.button initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleAnalyze} disabled={isAnalyzing}
                className="btn-glow mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-60">
                {isAnalyzing ? (
                  <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white" /> Analyzing…</>
                ) : <><Scan className="h-4 w-4" /> Analyze Video</>}
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
                  <p className="mt-1 text-xs text-white/35">Record or upload video to start</p>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  {/* Primary emotion */}
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-violet-500/15 bg-violet-500/10 py-5">
                    <LunaAvatar state="happy" size="lg" showRing />
                    <div className="text-center">
                      <h3 className="text-xl font-bold capitalize text-white">{analysisResult.emotions.primary}</h3>
                      <p className="text-xs text-white/45">Confidence: {(analysisResult.emotions.confidence * 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h4 className="mb-2 text-xs font-semibold text-white/50 uppercase tracking-wider">Emotion Timeline</h4>
                    <div className="space-y-2">
                      {analysisResult.emotions.timeline.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-10 text-[10px] text-white/35">{item.timestamp}s</span>
                          <div className="flex-1"><Progress value={item.confidence * 100} className="h-1.5" /></div>
                          <span className="w-16 text-right text-[10px] font-medium capitalize text-white/55">{item.emotion}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Facial expressions */}
                  <div>
                    <h4 className="mb-2 text-xs font-semibold text-white/50 uppercase tracking-wider">Facial Expressions</h4>
                    <div className="space-y-2">
                      {Object.entries(analysisResult.facialExpressions).map(([expr, val]) => (
                        <div key={expr} className="flex items-center gap-3">
                          <span className="w-20 text-xs capitalize text-white/55">{expr}</span>
                          <div className="flex-1"><Progress value={(val as number) * 100} className="h-1.5" /></div>
                          <span className="w-10 text-right text-xs text-white/40">{((val as number) * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Luna analysis */}
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <LunaAvatar state="listening" size="sm" showRing={false} animate={false} />
                      <span className="text-xs font-semibold text-white/70">Luna's Analysis</span>
                    </div>
                    <ul className="space-y-2">
                      {analysisResult.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/55">
                          <span className="mt-0.5 text-violet-400">✦</span>{rec}
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
