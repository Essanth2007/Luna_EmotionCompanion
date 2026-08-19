'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Phone, PhoneOff, CameraOff } from 'lucide-react';
import { CallControls } from './CallControls';
import { CallTimer } from './CallTimer';
import type { CallStatus, CallParticipant } from '@/types';

interface VideoCallProps {
  participant: CallParticipant;
  status:      CallStatus;
  onEnd:       () => void;
  onAccept?:   () => void;
}

const statusLabel: Record<string, string> = {
  outgoing:    'Calling…',
  incoming:    'Incoming video call',
  connecting:  'Connecting…',
  connected:   'Connected',
  reconnecting:'Reconnecting…',
  ended:       'Call ended',
  error:       'Connection error',
};

export function VideoCall({ participant, status, onEnd, onAccept }: VideoCallProps) {
  const [isMuted,      setMuted]      = useState(false);
  const [isCameraOff,  setCameraOff]  = useState(false);
  const [isSpeakerOff, setSpeakerOff] = useState(false);
  const [localStream,  setLocalStream] = useState<MediaStream | null>(null);

  const localVideoRef  = useRef<HTMLVideoElement>(null);

  const isConnected = status === 'connected';
  const isIncoming  = status === 'incoming';

  // Start local camera when connecting
  useEffect(() => {
    if (status === 'connecting' || status === 'connected' || status === 'outgoing') {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setLocalStream(stream);
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        })
        .catch(() => setCameraOff(true));
    }
    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const toggleCamera = () => {
    setCameraOff((p) => !p);
    localStream?.getVideoTracks().forEach((t) => { t.enabled = isCameraOff; });
  };

  const toggleMute = () => {
    setMuted((p) => !p);
    localStream?.getAudioTracks().forEach((t) => { t.enabled = isMuted; });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl bg-[#060912] shadow-2xl"
      style={{ width: '100%', maxWidth: 560, aspectRatio: '16/11' }}
    >
      {/* Remote video (placeholder — shows participant avatar until real WebRTC) */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#0d0820] to-[#060912]">
        {isConnected ? (
          <div className="flex flex-col items-center gap-4 text-white/30">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.06] text-3xl font-bold text-white">
              {participant.name.charAt(0)}
            </div>
            <p className="text-sm">Waiting for remote video…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {(status === 'outgoing' || status === 'incoming') && (
              <>
                <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute h-32 w-32 rounded-full bg-violet-500/15" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600 text-3xl font-bold text-white shadow-lg">
                  {participant.name.charAt(0)}
                </div>
              </>
            )}
            <p className="text-sm font-semibold text-white/50">{statusLabel[status] ?? status}</p>
          </div>
        )}
      </div>

      {/* Local video (picture-in-picture) */}
      <div className="absolute bottom-20 right-4 z-20 h-28 w-20 overflow-hidden rounded-2xl border border-white/10 bg-black shadow-xl">
        {!isCameraOff && localStream ? (
          <video ref={localVideoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white/[0.06] text-white/30">
            <CameraOff className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/40 to-transparent">
        <div>
          <p className="text-sm font-semibold text-white">{participant.name}</p>
          {isConnected
            ? <CallTimer running className="text-xs text-white/50" />
            : <p className="text-xs text-white/40">{statusLabel[status]}</p>}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-4 py-4 bg-gradient-to-t from-black/60 to-transparent">
        {isIncoming && onAccept ? (
          <div className="flex items-center justify-center gap-8">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
              onClick={onEnd}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg"
              aria-label="Reject">
              <PhoneOff className="h-6 w-6" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
              onClick={onAccept}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg"
              aria-label="Accept">
              <Phone className="h-6 w-6" />
            </motion.button>
          </div>
        ) : (
          <CallControls
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            isSpeakerOff={isSpeakerOff}
            isVideo
            onToggleMute={toggleMute}
            onToggleCamera={toggleCamera}
            onToggleSpeaker={() => setSpeakerOff((p) => !p)}
            onEnd={onEnd}
          />
        )}
      </div>
    </motion.div>
  );
}
