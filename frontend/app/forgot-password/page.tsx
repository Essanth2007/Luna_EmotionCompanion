'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { authService } from '@/services/auth';

export default function ForgotPasswordPage() {
  const [email,      setEmail]      = useState('');
  const [isLoading,  setIsLoading]  = useState(false);
  const [sent,       setSent]       = useState(false);
  const [error,      setError]      = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email address'); return; }
    setIsLoading(true);
    setError('');
    await authService.forgotPassword({ email });
    setIsLoading(false);
    setSent(true);
  };

  return (
    <div className="luna-bg relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 right-0 h-[400px] w-[400px] rounded-full bg-violet-600/15 blur-[110px]" />
        <div className="absolute -bottom-20 left-0 h-[350px] w-[350px] rounded-full bg-blue-600/12 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 shadow-lg shadow-violet-500/30">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </div>
            <span className="text-xl font-extrabold text-gradient">Luna</span>
          </Link>
        </div>

        <div className="glass-card p-8 md:p-10">
          {!sent ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-7 text-center">
                <h1 className="text-2xl font-bold text-white">Reset password</h1>
                <p className="mt-1 text-sm text-white/45">
                  Enter your email and we'll send a reset link
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/50">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com" autoComplete="email"
                      className="w-full rounded-2xl border border-white/[0.1] bg-white/[0.05] py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 transition-all" />
                  </div>
                </div>

                <motion.button type="submit" disabled={isLoading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="btn-glow flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white disabled:opacity-60">
                  {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : 'Send Reset Link'}
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-5 py-4 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
                <CheckCircle2 className="h-14 w-14 text-emerald-400" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-white">Check your inbox</h2>
                <p className="mt-2 text-sm text-white/45">
                  We&apos;ve sent a reset link to <span className="font-semibold text-white/70">{email}</span>
                </p>
                <p className="mt-1 text-xs text-white/30">Didn&apos;t receive it? Check your spam folder.</p>
              </div>
              <button onClick={() => setSent(false)}
                className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors">
                Try a different email
              </button>
            </motion.div>
          )}

          <div className="mt-6 flex justify-center">
            <Link href="/login" className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
