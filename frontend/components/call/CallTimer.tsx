'use client';

import { useEffect, useState } from 'react';

interface CallTimerProps {
  running: boolean;
  className?: string;
}

export function CallTimer({ running, className = '' }: CallTimerProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const fmt = (n: number) => String(n).padStart(2, '0');
  const label = h > 0 ? `${fmt(h)}:${fmt(m)}:${fmt(s)}` : `${fmt(m)}:${fmt(s)}`;

  return <span className={`font-mono tabular-nums ${className}`}>{label}</span>;
}
