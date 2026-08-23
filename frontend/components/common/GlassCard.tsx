'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  gradient?: boolean;
}

export const GlassCard = ({
  children,
  className,
  hover = true,
  delay = 0,
  gradient = false,
  ...props
}: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -3, transition: { duration: 0.2 } } : undefined}
      className={cn(
        'glass-card glass-card-hover',
        gradient && 'gradient-border',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
