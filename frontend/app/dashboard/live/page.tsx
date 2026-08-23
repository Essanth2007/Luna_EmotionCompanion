'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Play, Square, RotateCcw, Video as VideoIcon, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { GlassCard } from '@/components/common/GlassCard';
import { communication } from '@/services/communication';
import { getStoredUser } from '@/store/auth';
import { api } from '@/services/api';

interface TimelinePoint {
  index: number;
  primary_emotion: string;
  confidence: number;
  spike: boolean;
}

interface Spike {
  index: number;
  primary_emotion: string;
  reason: string | null;
}

const EMOTION_COLORS: Record<string, string> = {
  happy: '#34d399',
  sad: '#60a5fa',
  angry: '#f87171',
  fearful: '#a78bfa',
  surprised: '#fbbf24',
  disgusted: '#84cc16',
  calm: '#22d3ee',
  neutral: '#94a3b8',
};

export default function LiveEmotionPage() {
  const [running, setRunning] = useState(false);
  const [includeAudio, setIncludeAudio] = useState(false);
  const [current, setCurrent] = useState<{ primary_emotion: string; confidence: number; emotion_distribution?: Record<string, number> } | null>(null);
  const [faceDetected, setFaceDetected] = useState<boolean | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [spikes, setSpikes] = useState<Spike[]>([]);
  const [wsOpen, setWsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sampleCount, setSampleCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const sessionRef = useRef<string>('');
  const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioLoopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [userId, setUserId] = useState<string>('');

  // ── Setup user + WS ───────────────────────────────────────────────────────
  useEffect(() => {
    const user = getStoredUser();
    const uid = user?.id || 'demo';
    setUserId(uid);
    sessionRef.current = `${uid}-live`;

    communication.connect(uid);
    const offOpen = communication.on('__open__', () => setWsOpen(true));
    const offClose = communication.on('__close__', () => setWsOpen(false));
    const offLive = communication.on('live_emotion_update', (payload: any) => {
      if (payload?.primary_emotion) {
        setCurrent({
          primary_emotion: payload.primary_emotion,
          confidence: payload.confidence ?? 0,
          emotion_distribution: payload.emotion_distribution,
        });
        if (payload.spike) {
          setSpikes((s) => [
            ...s,
            { index: s.length + 1, primary_emotion: payload.primary_emotion, reason: payload.spike_reason ?? null },
          ]);
        }
      }
    });

    return () => {
      offOpen();
      offClose();
      offLive();
      communication.disconnect();
    };
  }, []);

  // ── Capture helpers ─────────────────────────────────────────────────────────
  const captureFrame = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || !video.videoWidth) {
        resolve(null);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85);
    });
  }, []);

  const sendSample = useCallback(async (image: Blob | null, audio: Blob | null) => {
    if (!image && !audio) return;
    const form = new FormData();
    if (image) form.append('image', image, 'frame.jpg');
    if (audio) form.append('audio', audio, 'chunk.webm');
    try {
      await api.post(`/analysis/live?session_id=${sessionRef.current}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const stateRes = await api.get(`/analysis/live/${sessionRef.current}`);
      const state = stateRes.data;
      const cur = state.current;
      if (cur) {
        setCurrent({
          primary_emotion: cur.primary_emotion,
          confidence: cur.confidence,
          emotion_distribution: cur.emotion_distribution,
        });
        setFaceDetected(cur.face?.face_detected ?? null);
        setTimeline(state.timeline || []);
        setSpikes(state.spikes || []);
        setSampleCount((c) => c + 1);
      }
    } catch (err: any) {
      // Don't spam errors; surface the first one.
      if (!error) setError(err?.response?.data?.detail || 'Live analysis failed');
    }
  }, [error]);

  // ── Start / Stop ─────────────────────────────────────────────────────────────
  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: includeAudio });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setRunning(true);

      // Image loop (every 2s)
      loopRef.current = setInterval(async () => {
        const frame = await captureFrame();
        await sendSample(frame, null);
      }, 2000);

      // Audio loop (every 5s, beta)
      if (includeAudio) {
        const startAudioLoop = () => {
          audioChunksRef.current = [];
          try {
            const rec = new MediaRecorder(stream);
            recorderRef.current = rec;
            rec.ondataavailable = (e) => audioChunksRef.current.push(e.data);
            rec.onstop = async () => {
              const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              if (blob.size > 0) await sendSample(null, blob);
              audioLoopRef.current = setTimeout(startAudioLoop, 200);
            };
            rec.start();
            setTimeout(() => {
              try { rec.stop(); } catch {}
            }, 4000);
          } catch {
            audioLoopRef.current = setTimeout(startAudioLoop, 6000);
          }
        };
        startAudioLoop();
      }
    } catch (e: any) {
      setError(e?.message || 'Could not access camera/microphone');
      setRunning(false);
    }
  }, [includeAudio, captureFrame, sendSample]);

  const stop = useCallback(() => {
    if (loopRef.current) clearInterval(loopRef.current);
    if (audioLoopRef.current) clearTimeout(audioLoopRef.current);
    try { recorderRef.current?.stop(); } catch {}
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setRunning(false);
  }, []);

  const reset = useCallback(async () => {
    stop();
    try {
      await api.delete(`/analysis/live/${sessionRef.current}`);
    } catch {}
    setCurrent(null);
    setTimeline([]);
    setSpikes([]);
    setSampleCount(0);
    setFaceDetected(null);
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  const primaryColor = current ? (EMOTION_COLORS[current.primary_emotion] || '#94a3b8') : '#94a3b8';

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <Activity className="h-6 w-6 text-fuchsia-400" /> Live Emotion Tracking
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Real-time facial (and optional voice) emotion fusion, streamed through the Luna AI + Communication services.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${wsOpen ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
            {wsOpen ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {wsOpen ? 'Real-time connected' : 'Real-time offline'}
          </span>
        </div>
      </div>

      {error && (
        <GlassCard className="mb-4 flex items-center gap-2 border-rose-500/30 px-4 py-3 text-sm text-rose-300" hover={false}>
          <AlertCircle className="h-4 w-4" /> {error}
        </GlassCard>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Video + controls */}
        <GlassCard className="flex flex-col gap-4 p-5 lg:col-span-2" hover={false}>
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black/40">
            <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
            {!running && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/50">
                <VideoIcon className="h-10 w-10" />
                <p className="text-sm">Camera is off — press Start to begin live tracking</p>
              </div>
            )}
            {running && current && (
              <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur">
                <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: primaryColor }} />
                <span className="text-xs font-semibold text-white">{current.primary_emotion}</span>
                <span className="text-xs text-white/60">{Math.round((current.confidence || 0) * 100)}%</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!running ? (
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                onClick={start}
                className="btn-glow flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white">
                <Play className="h-4 w-4" /> Start
              </motion.button>
            ) : (
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                onClick={stop}
                className="flex items-center gap-2 rounded-xl bg-rose-500/80 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-500">
                <Square className="h-4 w-4" /> Stop
              </motion.button>
            )}
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
              onClick={reset}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/70 hover:bg-white/5">
              <RotateCcw className="h-4 w-4" /> Reset
            </motion.button>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-white/60">
              <input type="checkbox" checked={includeAudio} onChange={(e) => setIncludeAudio(e.target.checked)} />
              Include voice (beta)
            </label>
            <span className="ml-auto text-xs text-white/40">{sampleCount} samples</span>
          </div>
        </GlassCard>

        {/* Current state + distribution */}
        <GlassCard className="flex flex-col gap-4 p-5" hover={false}>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/60">Current Emotion</h3>
          {current ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: `${primaryColor}22`, border: `1px solid ${primaryColor}` }}>
                  <span className="text-2xl" style={{ color: primaryColor }}>{Math.round((current.confidence || 0) * 100)}%</span>
                </div>
                <div>
                  <p className="text-xl font-bold capitalize text-white">{current.primary_emotion}</p>
                  <p className="text-xs text-white/50">{faceDetected === false ? 'No face detected' : faceDetected ? 'Face detected' : 'Analyzing…'}</p>
                </div>
              </div>
              <div className="space-y-2">
                {Object.entries(current.emotion_distribution || {})
                  .sort((a, b) => (b[1] as number) - (a[1] as number))
                  .map(([em, score]) => (
                    <div key={em}>
                      <div className="flex justify-between text-[11px] text-white/60">
                        <span className="capitalize">{em}</span>
                        <span>{Math.round((score as number) * 100)}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/10">
                        <div className="h-full rounded-full" style={{ width: `${Math.round((score as number) * 100)}%`, background: EMOTION_COLORS[em] || '#94a3b8' }} />
                      </div>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-white/40">Start tracking to see your live emotion state.</p>
          )}
        </GlassCard>
      </div>

      {/* Timeline + spikes */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-5 lg:col-span-2" hover={false}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/60">Emotion Timeline</h3>
          {timeline.length ? (
            <div className="flex h-24 items-end gap-1 overflow-x-auto custom-scroll">
              {timeline.map((t) => (
                <motion.div key={t.index}
                  initial={{ height: 0 }} animate={{ height: `${Math.max(8, t.confidence * 100)}%` }}
                  title={`${t.primary_emotion} ${Math.round(t.confidence * 100)}%`}
                  className={`min-w-[10px] flex-1 rounded-t ${t.spike ? 'ring-2 ring-rose-400' : ''}`}
                  style={{ background: EMOTION_COLORS[t.primary_emotion] || '#94a3b8' }} />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-white/40">No samples yet.</p>
          )}
        </GlassCard>

        <GlassCard className="p-5" hover={false}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/60">Detected Spikes</h3>
          {spikes.length ? (
            <ul className="space-y-2">
              {spikes.slice(-6).reverse().map((s, i) => (
                <li key={i} className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                  <span className="font-semibold capitalize">{s.primary_emotion}</span>
                  {s.reason ? ` — ${s.reason}` : ''}
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-white/40">No emotional spikes detected.</p>
          )}
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
