'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroButtons = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link href="/register">
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-8 py-6 text-lg shadow-lg shadow-primary/25 w-full sm:w-auto"
          >
            <span className="flex items-center gap-2">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </span>
          </Button>
        </Link>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link href="#features">
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-6 text-lg border-foreground/20 hover:bg-foreground/5 hover:border-foreground/30 glass w-full sm:w-auto"
          >
            <span className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Learn More
            </span>
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default HeroButtons;
