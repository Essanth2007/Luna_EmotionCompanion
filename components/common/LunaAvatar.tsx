'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LunaAvatarProps {
  state?: 'default' | 'happy' | 'thinking' | 'sad' | 'listening';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  animate?: boolean;
  showRing?: boolean;
  float?: boolean;
}

const sizeClasses = {
  sm:  'w-10 h-10',
  md:  'w-14 h-14',
  lg:  'w-20 h-20',
  xl:  'w-28 h-28',
  '2xl': 'w-36 h-36',
};

const ringSizes = {
  sm:  'w-14 h-14',
  md:  'w-20 h-20',
  lg:  'w-28 h-28',
  xl:  'w-40 h-40',
  '2xl': 'w-52 h-52',
};

const emojiSizes = {
  sm:  'text-xl',
  md:  'text-3xl',
  lg:  'text-4xl',
  xl:  'text-5xl',
  '2xl': 'text-6xl',
};

const stateImages: Record<string, string> = {
  default:   '/assets/luna/images/luna.png',
  happy:     '/assets/luna/images/luna-happy.png',
  thinking:  '/assets/luna/images/luna-thinking.png',
  sad:       '/assets/luna/images/luna-sad.png',
  listening: '/assets/luna/images/luna-listening.gif',
};

const stateEmojis: Record<string, string> = {
  default:   '🌙',
  happy:     '😊',
  thinking:  '🤔',
  sad:       '😢',
  listening: '🎧',
};

export const LunaAvatar = ({
  state = 'default',
  size = 'md',
  className,
  animate = true,
  showRing = true,
  float = false,
}: LunaAvatarProps) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* Pulse ring */}
      {showRing && (
        <div className={cn('absolute rounded-full border border-violet-500/20 ring-pulse', ringSizes[size])} />
      )}
      {/* Glow blob */}
      {showRing && (
        <div className={cn('absolute rounded-full bg-violet-500/12 blur-xl', ringSizes[size])} />
      )}

      {/* Avatar container */}
      <motion.div
        className={cn(
          'relative overflow-hidden rounded-full',
          'bg-gradient-to-br from-violet-500/20 via-blue-500/10 to-indigo-500/20',
          'border border-violet-400/25',
          'shadow-[0_0_20px_rgba(139,92,246,0.3)]',
          sizeClasses[size],
          float && 'luna-float',
        )}
        {...(animate ? {
          whileHover: { scale: 1.06 },
          whileTap:   { scale: 0.96 },
          initial:    { scale: 0, rotate: -90 },
          animate:    { scale: 1, rotate: 0 },
          transition: { type: 'spring', stiffness: 280, damping: 22 },
        } : {})}
      >
        {/* Real image (if available and not errored) */}
        {!imgError ? (
          <Image
            src={stateImages[state]}
            alt={`Luna ${state}`}
            fill
            className="object-contain"
            onError={() => setImgError(true)}
            priority={size === 'xl' || size === '2xl'}
          />
        ) : (
          /* Emoji fallback */
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn('select-none', emojiSizes[size])}>
              {stateEmojis[state]}
            </span>
          </div>
        )}

        {/* Shimmer overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-white/5 via-transparent to-violet-400/10" />
      </motion.div>
    </div>
  );
};
