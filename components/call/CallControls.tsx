'use client';

import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, VolumeX } from 'lucide-react';

interface CallControlsProps {
  isMuted:        boolean;
  isCameraOff:    boolean;
  isSpeakerOff:   boolean;
  isVideo:        boolean;
  onToggleMute:   () => void;
  onToggleCamera: () => void;
  onToggleSpeaker:() => void;
  onEnd:          () => void;
}

const ControlBtn = ({
  onClick, active, danger, children, label,
}: {
  onClick:  () => void;
  active?:  boolean;
  danger?:  boolean;
  children: React.ReactNode;
  label:    string;
}) => (
  <motion.button
    whileHover={{ scale: 1.08 }}
    whileTap={{ scale: 0.93 }}
    onClick={onClick}
    title={label}
    aria-label={label}
    className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
      danger
        ? 'bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/40 text-white'
        : active
        ? 'bg-white/10 text-white/40'
        : 'bg-white/[0.08] text-white hover:bg-white/15'
    }`}
  >
    {children}
  </motion.button>
);

export function CallControls({
  isMuted, isCameraOff, isSpeakerOff, isVideo,
  onToggleMute, onToggleCamera, onToggleSpeaker, onEnd,
}: CallControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <ControlBtn onClick={onToggleMute}    active={isMuted}     label={isMuted ? 'Unmute' : 'Mute'}>
        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </ControlBtn>

      {isVideo && (
        <ControlBtn onClick={onToggleCamera} active={isCameraOff} label={isCameraOff ? 'Turn camera on' : 'Turn camera off'}>
          {isCameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </ControlBtn>
      )}

      <ControlBtn onClick={onToggleSpeaker} active={isSpeakerOff} label={isSpeakerOff ? 'Unmute speaker' : 'Mute speaker'}>
        {isSpeakerOff ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </ControlBtn>

      <ControlBtn onClick={onEnd} danger label="End call">
        <PhoneOff className="h-5 w-5" />
      </ControlBtn>
    </div>
  );
}
