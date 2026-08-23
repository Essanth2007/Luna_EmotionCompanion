'use client';

import { motion } from 'framer-motion';
import { Smile, Cloud, AlertCircle, Heart } from 'lucide-react';

const EmotionSummaryCards = () => {
  const emotions = [
    {
      name: 'Happy',
      icon: Smile,
      level: 75,
      color: 'from-green-400/20 to-green-600/20',
      textColor: 'text-green-600',
    },
    {
      name: 'Calm',
      icon: Cloud,
      level: 60,
      color: 'from-blue-400/20 to-blue-600/20',
      textColor: 'text-blue-600',
    },
    {
      name: 'Anxious',
      icon: AlertCircle,
      level: 30,
      color: 'from-yellow-400/20 to-yellow-600/20',
      textColor: 'text-yellow-600',
    },
    {
      name: 'Sad',
      icon: Heart,
      level: 20,
      color: 'from-purple-400/20 to-purple-600/20',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {emotions.map((emotion, index) => (
        <motion.div
          key={emotion.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="glass rounded-xl p-4 border border-border/50 hover:shadow-lg hover:shadow-primary/10 transition-all"
        >
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div
              className={`w-12 h-12 rounded-full bg-gradient-to-br ${emotion.color} flex items-center justify-center mb-3`}
            >
              <emotion.icon className={`w-6 h-6 ${emotion.textColor}`} />
            </div>

            {/* Name */}
            <h3 className="font-semibold text-foreground mb-2">{emotion.name}</h3>

            {/* Progress Bar */}
            <div className="w-full bg-foreground/10 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${emotion.color}`}
                style={{ width: `${emotion.level}%` }}
              />
            </div>

            {/* Level */}
            <p className={`text-sm font-medium ${emotion.textColor}`}>
              {emotion.level}%
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default EmotionSummaryCards;
