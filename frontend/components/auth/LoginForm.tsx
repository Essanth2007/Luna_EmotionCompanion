'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const schema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

const inputCls =
  'w-full rounded-2xl border border-white/[0.1] bg-white/[0.05] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 backdrop-blur-sm';

export default function LoginForm() {
  const [showPw, setShowPw] = useState(false);
  const { login, isLoading, error } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await login(data.email, data.password);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* API error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-white/50">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input id="email" type="email" placeholder="you@example.com"
              {...register('email')}
              className={`${inputCls} pl-10`} />
          </div>
          {errors.email && <p className="text-xs text-rose-400">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input id="password" type={showPw ? 'text' : 'password'} placeholder="••••••••"
              {...register('password')}
              className={`${inputCls} pl-10 pr-11`} />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-rose-400">{errors.password.message}</p>}
        </div>

        {/* Remember */}
        <label className="flex cursor-pointer items-center gap-2.5">
          <input type="checkbox" {...register('remember')}
            className="h-4 w-4 rounded border-white/20 bg-white/10 accent-violet-500" />
          <span className="text-xs text-white/50">Remember me for 30 days</span>
        </label>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="btn-glow flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : 'Sign In'}
        </motion.button>

        <p className="text-center text-xs text-white/45">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">
            Sign up
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
