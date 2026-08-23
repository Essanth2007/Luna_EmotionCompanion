'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Video, PhoneCall, PhoneMissed, Clock, PhoneOff } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { GlassCard } from '@/components/common/GlassCard';
import { useCall } from '@/components/call/CallProvider';
import { callService } from '@/services/calls';
import type { CallHistoryEntry, CallType } from '@/types';

function fmtDuration(sec?: number) {
  if (!sec) return '--';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m} min ${s > 0 ? `${s} sec` : ''}`.trim() : `${s} sec`;
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffH = (now.getTime() - d.getTime()) / 3600000;
  if (diffH < 24) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffH < 48) return `Yesterday · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' · ' +
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function CallsPage() {
  const [history, setHistory]         = useState<CallHistoryEntry[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [peerId, setPeerId]           = useState('2');
  const { startCall } = useCall();

  useEffect(() => {
    callService.getHistory().then((r) => {
      if (r.data) setHistory(r.data);
      setIsLoading(false);
    });
  }, []);

  const statusIcon = (s: string, type: CallType) => {
    if (s === 'missed')   return <PhoneMissed className="h-4 w-4 text-rose-400" />;
    if (s === 'answered') return type === 'video'
      ? <Video className="h-4 w-4 text-violet-400" />
      : <PhoneCall className="h-4 w-4 text-emerald-400" />;
    return <PhoneOff className="h-4 w-4 text-white/30" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Calls</h1>
          <p className="mt-1 text-sm text-white/45">Connect through real-time audio or video</p>
          <div className="mt-3 flex items-center gap-2">
            <label className="text-[11px] uppercase tracking-widest text-white/40">Call user id</label>
            <input
              value={peerId}
              onChange={(e) => setPeerId(e.target.value)}
              placeholder="e.g. 2"
              className="w-28 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-sm text-white placeholder:text-white/30 outline-none focus:border-violet-500/40"
            />
            <span className="text-[11px] text-white/30">Open a 2nd account and call its id to test WebRTC.</span>
          </div>
        </div>

        {/* Start Call Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            {
              type: 'audio' as CallType,
              icon: Phone,
              label: 'Audio Call',
              desc: 'Talk with Luna through voice',
              gradient: 'from-violet-600 to-indigo-600',
              glow: 'shadow-violet-500/30',
            },
            {
              type: 'video' as CallType,
              icon: Video,
              label: 'Video Call',
              desc: 'See Luna face-to-face',
              gradient: 'from-pink-600 to-rose-600',
              glow: 'shadow-pink-500/30',
            },
          ].map(({ type, icon: Icon, label, desc, gradient, glow }) => (
            <GlassCard key={type} className="p-6" hover>
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg ${glow}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white">{label}</h3>
                  <p className="mt-0.5 text-xs text-white/45">{desc}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => startCall(peerId, 'Peer User', type)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white shadow-lg ${glow}`}
                  aria-label={`Start ${label}`}
                >
                  <Icon className="h-4 w-4" />
                </motion.button>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Call History */}
        <GlassCard className="p-6" hover={false}>
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.08]">
              <Clock className="h-3.5 w-3.5 text-white/60" />
            </div>
            <h2 className="text-sm font-bold text-white">Call History</h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/[0.04]" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Phone className="h-10 w-10 text-white/15" />
              <p className="text-sm text-white/40">No call history yet</p>
              <p className="text-xs text-white/25">Start a call with Luna to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 hover:bg-white/[0.06] transition-colors"
                >
                  {/* Type icon */}
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    entry.status === 'missed' ? 'bg-rose-500/15' :
                    entry.type === 'video'   ? 'bg-violet-500/15' : 'bg-emerald-500/15'
                  }`}>
                    {statusIcon(entry.status, entry.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-white/80 truncate">
                        {entry.type === 'video' ? 'Video Call' : 'Audio Call'} · {entry.participant.name}
                      </p>
                      {entry.status === 'missed' && (
                        <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-400">
                          Missed
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[10px] text-white/35">{fmtTime(entry.startedAt)}</p>
                  </div>

                  <div className="text-right">
                    {entry.duration && (
                      <p className="text-xs font-medium text-white/50">{fmtDuration(entry.duration)}</p>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => startCall(peerId, 'Peer User', entry.type)}
                      className="mt-1 flex items-center gap-1 rounded-lg bg-white/[0.06] px-2 py-1 text-[10px] font-semibold text-white/50 hover:bg-white/[0.1] hover:text-white/80 transition-colors"
                    >
                      <Phone className="h-3 w-3" /> Call back
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          </GlassCard>
      </div>
    </DashboardLayout>
  );
}
