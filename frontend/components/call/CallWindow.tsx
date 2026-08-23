'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { AudioCall } from './AudioCall';
import { VideoCall } from './VideoCall';
import type { CallType, CallStatus, CallParticipant } from '@/types';

interface CallWindowProps {
  type: CallType;
  participant: CallParticipant;
  status: CallStatus;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;
  onEnd: () => void;
  onAccept?: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
}

export function CallWindow(props: CallWindowProps) {
  const { type, participant, status, onEnd } = props;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          className="relative flex h-[90vh] w-[94vw] max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-800/95 shadow-2xl"
        >
          <button
            onClick={onEnd}
            className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {type === 'video' ? <VideoCall {...props} /> : <AudioCall {...props} />}

          {status === 'ended' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <p className="text-lg text-white/80">Call ended</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
