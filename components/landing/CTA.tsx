'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, Lock } from 'lucide-react';

export default function CTA() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[32px] border border-white/[0.1] bg-gradient-to-br from-violet-600/20 via-purple-600/10 to-fuchsia-600/15 p-12 text-center backdrop-blur-xl md:p-20"
        >
          {/* Decorative blobs inside card */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]">
            <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
            {/* Top border glow */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
          </div>

          <div className="relative z-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/15 px-4 py-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              <span className="text-xs font-semibold text-violet-300">Start Your Journey Today</span>
            </motion.div>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-5 text-3xl font-black tracking-tight text-white md:text-5xl"
            >
              Ready to feel{' '}
              <span
                className="bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent"
                style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                understood?
              </span>
            </motion.h2>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.28 }}
              className="mx-auto mb-10 max-w-xl text-base text-white/50"
            >
              Join thousands of people already using Luna to build emotional resilience and inner peace — it&apos;s free to get started.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(167,139,250,0.55)' }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 px-9 py-4 text-base font-bold text-white shadow-xl shadow-violet-500/30 transition-shadow"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </Link>
            </motion.div>

            {/* Trust */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-7 flex flex-col items-center gap-2.5 text-xs text-white/30 sm:flex-row sm:justify-center sm:gap-5"
            >
              {['No credit card required', 'Free forever plan', 'Cancel anytime'].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <Lock className="h-3 w-3" />{t}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
