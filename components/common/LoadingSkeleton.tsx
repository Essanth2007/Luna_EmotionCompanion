'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export const LoadingSkeleton = ({
  className,
  variant = 'rectangular',
  width = '100%',
  height = '1rem',
  count = 1,
}: LoadingSkeletonProps) => {
  const baseClasses = 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer';

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
    rounded: 'rounded-xl',
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className={cn(baseClasses, variantClasses[variant], className)}
          style={{ width, height }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
        />
      ))}
    </>
  );
};

export const CardSkeleton = () => (
  <div className="glass rounded-xl p-6 space-y-4">
    <LoadingSkeleton variant="circular" width={48} height={48} />
    <LoadingSkeleton variant="text" width="60%" />
    <LoadingSkeleton variant="text" width="40%" />
    <LoadingSkeleton variant="rectangular" height={100} />
  </div>
);

export const ChartSkeleton = () => (
  <div className="glass rounded-xl p-6 space-y-4">
    <LoadingSkeleton variant="text" width="30%" />
    <LoadingSkeleton variant="rectangular" height={200} />
  </div>
);

export const ListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="glass rounded-xl p-4 flex items-center space-x-4">
        <LoadingSkeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" width="50%" />
          <LoadingSkeleton variant="text" width="30%" />
        </div>
      </div>
    ))}
  </div>
);
