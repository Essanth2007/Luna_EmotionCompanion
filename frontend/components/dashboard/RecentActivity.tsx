'use client';

import { motion } from 'framer-motion';
import { Smile, Cloud, AlertCircle, Heart, Clock } from 'lucide-react';

const RecentActivity = () => {
  const activities = [
    {
      emotion: 'Happy',
      icon: Smile,
      color: 'text-green-600',
      bgColor: 'bg-green-400/20',
      note: 'Had a great day at work',
      time: '2 hours ago',
    },
    {
      emotion: 'Calm',
      icon: Cloud,
      color: 'text-blue-600',
      bgColor: 'bg-blue-400/20',
      note: 'Morning meditation session',
      time: '5 hours ago',
    },
    {
      emotion: 'Anxious',
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-400/20',
      note: 'Feeling stressed about deadline',
      time: 'Yesterday',
    },
    {
      emotion: 'Sad',
      icon: Heart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-400/20',
      note: 'Missing family',
      time: '2 days ago',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-xl p-6 border border-border/50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Recent Activity
        </h3>
        <Clock className="w-5 h-5 text-foreground/50" />
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-start gap-4 p-3 rounded-lg hover:bg-foreground/5 transition-colors"
          >
            {/* Emotion Icon */}
            <div
              className={`w-10 h-10 rounded-full ${activity.bgColor} flex items-center justify-center flex-shrink-0`}
            >
              <activity.icon className={`w-5 h-5 ${activity.color}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-foreground">{activity.emotion}</h4>
                <span className="text-xs text-foreground/50">{activity.time}</span>
              </div>
              <p className="text-sm text-foreground/70">{activity.note}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RecentActivity;
