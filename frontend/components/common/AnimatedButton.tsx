'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'gradient' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  gradient: 'bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white',
  outline: 'border-2 border-primary text-primary hover:bg-primary/10',
  ghost: 'hover:bg-accent/10 text-foreground',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
};

export const AnimatedButton = ({
  variant = 'default',
  size = 'md',
  children,
  className,
  ...props
}: AnimatedButtonProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="inline-block"
    >
      <Button
        className={cn(
          variantStyles[variant],
          sizeStyles[size],
          'rounded-lg font-medium transition-all duration-200',
          className
        )}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
};
