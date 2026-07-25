'use client';

import { motion } from 'framer-motion';
import {
  Heart,
  Brain,
  TrendingUp,
  Shield,
  Zap,
  Users,
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Heart,
      title: 'Emotion Tracking',
      description:
        'Log your daily emotions with intuitive check-ins and track patterns over time with beautiful visualizations.',
    },
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description:
        'Get personalized recommendations and insights based on your emotional patterns using advanced AI algorithms.',
    },
    {
      icon: TrendingUp,
      title: 'Progress Analytics',
      description:
        'Monitor your emotional wellness journey with detailed charts, statistics, and trend analysis.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description:
        'Your emotional data is encrypted and secure. We prioritize your privacy with enterprise-grade security.',
    },
    {
      icon: Zap,
      title: 'Quick Check-ins',
      description:
        'Fast and easy emotion logging in under 30 seconds. Perfect for busy lifestyles.',
    },
    {
      icon: Users,
      title: 'Community Support',
      description:
        'Connect with others on similar journeys, share experiences, and find support in a safe environment.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="features" className="section-padding relative">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Powerful Features</span>
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Everything you need to understand and improve your emotional well-being
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="glass p-8 rounded-2xl h-full hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border border-border/50">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-foreground/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
