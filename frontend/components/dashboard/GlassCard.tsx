'use client';

import type { ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  delay?: number;
  hover?: boolean;
}

const GlassCard = ({
  children,
  className,
  delay = 0,
  hover = true,
  ...props
}: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={cn(
        'glass-card rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.24)] backdrop-blur-xl',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
