'use client';

import { motion } from 'framer-motion';
import { Users, Target, Award, Globe } from 'lucide-react';

const stats = [
  { icon: Users,  value: '50K+', label: 'Active Users',      gradient: 'from-violet-500 to-purple-500' },
  { icon: Target, value: '95%',  label: 'Satisfaction Rate', gradient: 'from-rose-500 to-pink-500' },
  { icon: Award,  value: '4.9',  label: 'App Rating',        gradient: 'from-amber-500 to-orange-500' },
  { icon: Globe,  value: '30+',  label: 'Countries',         gradient: 'from-emerald-500 to-teal-500' },
];

const values = [
  {
    title: 'Empathy First',
    desc: 'We believe emotional well-being should be accessible to everyone with compassion and understanding.',
    gradient: 'from-rose-500/20 to-pink-500/10',
    border: 'border-rose-400/15',
  },
  {
    title: 'Science-Backed',
    desc: 'Our approach is grounded in psychological research and validated by mental health professionals.',
    gradient: 'from-violet-500/20 to-purple-500/10',
    border: 'border-violet-400/15',
  },
  {
    title: 'Continuous Innovation',
    desc: 'We constantly evolve our AI to provide more accurate, helpful, and personal insights.',
    gradient: 'from-blue-500/20 to-indigo-500/10',
    border: 'border-blue-400/15',
  },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function About() {
  return (
    <section id="about" className="section-padding relative overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-fuchsia-600/10 blur-[80px]" />
      </div>

      <div className="container-custom relative z-10">
        {/* Mission */}
        <motion.div {...fadeUp(0)} className="mb-16 text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300">
            Our Mission
          </span>
          <h2 className="text-3xl font-black tracking-tight text-white md:text-5xl">
            Built with{' '}
            <span
              className="bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Care
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/50">
            To empower individuals to understand and improve their emotional well-being through accessible AI-powered tools, fostering a world where mental health is prioritised and celebrated.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="mb-16 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                {...fadeUp(i * 0.07)}
                whileHover={{ y: -4 }}
                className="glass-landing flex flex-col items-center gap-3 p-6 text-center transition-all duration-300"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${s.gradient} shadow-lg`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p
                  className="text-3xl font-black bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent"
                  style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  {s.value}
                </p>
                <p className="text-xs font-medium text-white/45">{s.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {values.map((v, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.08)}
              whileHover={{ y: -5 }}
              className={`glass-landing border bg-gradient-to-br ${v.gradient} ${v.border} p-7 transition-all duration-300`}
            >
              <h3 className="mb-3 text-base font-bold text-white">{v.title}</h3>
              <p className="text-sm leading-relaxed text-white/50">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
