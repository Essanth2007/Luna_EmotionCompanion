'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const schema = z
  .object({
    name:            z.string().min(2, 'Name must be at least 2 characters'),
    email:           z.string().email('Invalid email address'),
    password:        z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    terms:           z.boolean().refine((v) => v === true, { message: 'You must accept the terms' }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path:    ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

const inputCls =
  'w-full rounded-2xl border border-white/[0.1] bg-white/[0.05] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 backdrop-blur-sm';

const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['', 'bg-rose-500', 'bg-amber-500', 'bg-yellow-400', 'bg-emerald-500'];

function getStrength(pw: string) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  return s;
}

export default function RegisterForm() {
  const [showPw, setShowPw]     = useState(false);
  const [showCpw, setShowCpw]   = useState(false);
  const { register: doRegister, isLoading, error } = useAuth();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const pw       = watch('password', '');
  const strength = getStrength(pw);

  const onSubmit = async (data: FormData) => {
    await doRegister(data.name, data.email, data.password);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </motion.div>
        )}

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/50">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input type="text" placeholder="Your name" {...register('name')}
              className={`${inputCls} pl-10`} />
          </div>
          {errors.name && <p className="text-xs text-rose-400">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/50">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input type="email" placeholder="you@example.com" {...register('email')}
              className={`${inputCls} pl-10`} />
          </div>
          {errors.email && <p className="text-xs text-rose-400">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/50">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input type={showPw ? 'text' : 'password'} placeholder="••••••••" {...register('password')}
              className={`${inputCls} pl-10 pr-11`} />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-rose-400">{errors.password.message}</p>}
          {pw && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1,2,3,4].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColor[strength] : 'bg-white/10'}`} />
                ))}
              </div>
              <p className="text-[10px] text-white/40">{strengthLabel[strength]} password</p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/50">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input type={showCpw ? 'text' : 'password'} placeholder="••••••••" {...register('confirmPassword')}
              className={`${inputCls} pl-10 pr-11`} />
            <button type="button" onClick={() => setShowCpw(!showCpw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
              {showCpw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-rose-400">{errors.confirmPassword.message}</p>}
        </div>

        {/* Terms */}
        <label className="flex cursor-pointer items-start gap-2.5">
          <input type="checkbox" {...register('terms')}
            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/10 accent-violet-500" />
          <span className="text-xs text-white/50">
            I agree to the{' '}
            <Link href="#" className="text-violet-400 hover:text-violet-300">Terms of Service</Link>
            {' '}and{' '}
            <Link href="#" className="text-violet-400 hover:text-violet-300">Privacy Policy</Link>
          </span>
        </label>
        {errors.terms && <p className="text-xs text-rose-400">{errors.terms.message}</p>}

        {/* Submit */}
        <motion.button type="submit" disabled={isLoading}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="btn-glow flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white disabled:opacity-60">
          {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</> : 'Create Account'}
        </motion.button>

        <p className="text-center text-xs text-white/45">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">
            Sign in
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
