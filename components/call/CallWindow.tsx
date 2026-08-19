'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { AudioCall } from './AudioCall';
import { VideoCall } from './VideoCall';
import { callService } from '@/services/calls';
import type { CallType, CallStatus, CallParticipant } from '@/types';

interface CallWindowProps {
  isOpen:      boolean;
  type:        CallType;
  participant: CallParticipant;
  initialStatus: CallStatus;
  onClose:     () => void;
}

export function CallWindow({ isOpen, type, participant, initialStatus, onClose }: CallWindowProps) {
  const [status, setStatus] = useState<CallStatus>(initialStatus);

  const handleEnd = async () => {
    setStatus('ended');
    await callService.endCall('current');
    setTimeout(onClose, 1200);
  };

  const handleAccept = async () => {
    setStatus('connecting');
    await callService.acceptCall('current');
    setTimeout(() => setStatus('connected'), 1500);
  };

  // Auto-connect outgoing calls after brief delay (simulates ring + pick up)
  useState(() => {
    if (initialStatus === 'outgoing') {
      const t = setTimeout(() => setStatus('connected'), 3000);
      return () => clearTimeout(t);
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
        >
          <div className="relative w-full" style={{ maxWidth: type === 'video' ? 560 : 380 }}>
            {/* Close (only when ended) */}
            {status === 'ended' && (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={onClose}
                className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Close">
                <X className="h-4 w-4" />
              </motion.button>
            )}

            {type === 'video' ? (
              <VideoCall
                participant={participant}
                status={status}
                onEnd={handleEnd}
                onAccept={status === 'incoming' ? handleAccept : undefined}
              />
            ) : (
              <AudioCall
                participant={participant}
                status={status}
                onEnd={handleEnd}
                onAccept={status === 'incoming' ? handleAccept : undefined}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
