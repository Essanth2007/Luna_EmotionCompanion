'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, PhoneOff } from 'lucide-react';
import { CallControls } from './CallControls';
import { CallTimer } from './CallTimer';
import type { CallStatus, CallParticipant } from '@/types';

interface AudioCallProps {
  participant: CallParticipant;
  status:      CallStatus;
  onEnd:       () => void;
  onAccept?:   () => void;
}

const statusLabel: Record<string, string> = {
  outgoing:    'Calling…',
  incoming:    'Incoming call',
  connecting:  'Connecting…',
  connected:   'Connected',
  reconnecting:'Reconnecting…',
  ended:       'Call ended',
  missed:      'Missed call',
  error:       'Connection error',
};

export function AudioCall({ participant, status, onEnd, onAccept }: AudioCallProps) {
  const [isMuted,      setMuted]      = useState(false);
  const [isSpeakerOff, setSpeakerOff] = useState(false);
  const isConnected = status === 'connected';

  // Pulsing ring animation speed
  const pulse = status === 'outgoing' || status === 'incoming';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col items-center justify-between overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-b from-[#0d0820] to-[#060912] p-8 shadow-2xl"
      style={{ minHeight: 480, width: '100%', maxWidth: 380 }}
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
      </div>

      {/* Status */}
      <motion.p
        key={status}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-xs font-semibold uppercase tracking-widest text-white/40"
      >
        {statusLabel[status] ?? status}
      </motion.p>

      {/* Avatar + pulse rings */}
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="relative flex items-center justify-center">
          {pulse && (
            <>
              <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute h-32 w-32 rounded-full bg-violet-500/20" />
              <motion.div animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                className="absolute h-32 w-32 rounded-full bg-violet-500/10" />
            </>
          )}
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600 text-3xl font-bold text-white shadow-lg shadow-violet-500/30">
            {participant.name.charAt(0)}
          </div>
          {isConnected && (
            <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-400 ring-2 ring-[#0d0820]" />
          )}
        </div>

        <div className="text-center">
          <h3 className="text-xl font-bold text-white">{participant.name}</h3>
          {isConnected && (
            <CallTimer running className="mt-1 text-sm text-white/50" />
          )}
        </div>
      </div>

      {/* Controls or incoming accept/reject */}
      <div className="relative z-10 w-full">
        {status === 'incoming' && onAccept ? (
          <div className="flex items-center justify-center gap-8">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
              onClick={onEnd}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/40"
              aria-label="Reject">
              <PhoneOff className="h-6 w-6" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
              onClick={onAccept}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/40"
              aria-label="Accept">
              <Phone className="h-6 w-6" />
            </motion.button>
          </div>
        ) : (
          <CallControls
            isMuted={isMuted}
            isCameraOff={false}
            isSpeakerOff={isSpeakerOff}
            isVideo={false}
            onToggleMute={() => setMuted((p) => !p)}
            onToggleCamera={() => {}}
            onToggleSpeaker={() => setSpeakerOff((p) => !p)}
            onEnd={onEnd}
          />
        )}
      </div>
    </motion.div>
  );
}
