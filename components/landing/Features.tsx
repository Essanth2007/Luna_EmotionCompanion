'use client';

import { motion } from 'framer-motion';
import { Heart, Brain, TrendingUp, Shield, Zap, Users } from 'lucide-react';

const features = [
  { icon: Heart,     title: 'Emotion Tracking',    desc: 'Log daily emotions with intuitive check-ins and visualize patterns over time.',         gradient: 'from-rose-500 to-pink-500',     glow: 'shadow-rose-500/25' },
  { icon: Brain,     title: 'AI-Powered Insights', desc: 'Personalized recommendations based on your emotional patterns using advanced AI.',       gradient: 'from-violet-500 to-purple-500', glow: 'shadow-violet-500/25' },
  { icon: TrendingUp,title: 'Progress Analytics',  desc: 'Monitor your wellness journey with detailed charts, statistics, and trend analysis.',    gradient: 'from-blue-500 to-indigo-500',   glow: 'shadow-blue-500/25' },
  { icon: Shield,    title: 'Privacy First',       desc: 'Your emotional data is encrypted and secure with enterprise-grade protection.',         gradient: 'from-emerald-500 to-teal-500',  glow: 'shadow-emerald-500/25' },
  { icon: Zap,       title: 'Quick Check-ins',     desc: 'Fast emotion logging in under 30 seconds — perfect for any schedule.',                  gradient: 'from-amber-500 to-orange-500',  glow: 'shadow-amber-500/25' },
  { icon: Users,     title: 'Community Support',   desc: 'Connect with others on similar journeys and find support in a safe environment.',       gradient: 'from-cyan-500 to-sky-500',      glow: 'shadow-cyan-500/25' },
];

export default function Features() {
  return (
    <section id="features" className="section-padding relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-violet-600/10 blur-[80px]" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-blue-600/10 blur-[80px]" />
      </div>

      <div className="container-custom relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="mb-14 text-center">
          <span className="mb-4 inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300">
            Everything you need
          </span>
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Powerful <span className="text-gradient">Features</span>
          </h2>
          <p className="mt-4 text-lg text-white/50 max-w-xl mx-auto">
            A complete toolkit to understand, track, and improve your emotional well-being.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -5 }}
                className="glass-card glass-card-hover group p-6"
              >
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${f.gradient} shadow-lg ${f.glow} group-hover:scale-110 transition-transform duration-300`}>
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
