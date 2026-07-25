'use client';

import { motion } from 'framer-motion';
import { Sparkles, Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WelcomeCard = () => {
  const getCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-2xl p-6 md:p-8 border border-border/50 relative overflow-hidden"
    >
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-2xl" />

      <div className="relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground/80">
            Welcome back
          </span>
        </div>

        {/* Greeting */}
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-gradient">Hello, John!</span>
        </h2>

        {/* Date */}
        <p className="text-foreground/70 mb-6">{getCurrentDate()}</p>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log Emotion
          </Button>
          <Button variant="outline" className="border-border/50">
            <TrendingUp className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeCard;
