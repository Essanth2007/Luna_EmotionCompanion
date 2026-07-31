'use client';

import { motion } from 'framer-motion';
import { Heart, Brain, TrendingUp, Shield, Zap, Users } from 'lucide-react';

const features = [
  { icon: Heart,      title: 'Emotion Tracking',     desc: 'Log daily emotions with beautiful check-ins and discover patterns over time.',          gradient: 'from-rose-500 to-pink-500',     shadow: 'shadow-rose-500/25' },
  { icon: Brain,      title: 'AI-Powered Insights',  desc: 'Personalised recommendations based on your emotional patterns using advanced AI.',        gradient: 'from-violet-500 to-purple-500', shadow: 'shadow-violet-500/25' },
  { icon: TrendingUp, title: 'Progress Analytics',   desc: 'Monitor your wellness journey with detailed charts, statistics, and trend analysis.',     gradient: 'from-blue-500 to-indigo-500',   shadow: 'shadow-blue-500/25' },
  { icon: Shield,     title: 'Privacy First',        desc: 'Your emotional data is encrypted and secure with enterprise-grade protection.',          gradient: 'from-emerald-500 to-teal-500',  shadow: 'shadow-emerald-500/25' },
  { icon: Zap,        title: 'Quick Check-ins',      desc: 'Emotion logging in under 30 seconds — built for busy, modern lifestyles.',              gradient: 'from-amber-500 to-orange-500',  shadow: 'shadow-amber-500/25' },
  { icon: Users,      title: 'Community Support',    desc: 'Connect with others on similar journeys and find support in a safe environment.',        gradient: 'from-cyan-500 to-sky-500',      shadow: 'shadow-cyan-500/25' },
];

export default function Features() {
  return (
    <section id="features" className="section-padding relative overflow-hidden">
      {/* Background accent blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-violet-600/10 blur-[90px]" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-[90px]" />
      </div>

      <div className="container-custom relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 text-center"
        >
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300">
            Everything you need
          </span>
          <h2 className="text-3xl font-black tracking-tight text-white md:text-5xl">
            Powerful{' '}
            <span
              className="bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Features
            </span>
          </h2>
          <p className="mt-4 text-base text-white/45 max-w-xl mx-auto">
            A complete toolkit to understand, track, and improve your emotional well-being.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className="glass-landing group cursor-default p-7 transition-all duration-300"
              >
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${f.gradient} shadow-lg ${f.shadow} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-2 text-base font-bold text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed text-white/50">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
