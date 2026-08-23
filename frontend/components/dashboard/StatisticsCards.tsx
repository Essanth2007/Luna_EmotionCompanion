'use client';

import { motion } from 'framer-motion';
import { Calendar, Flame, TrendingUp, Target } from 'lucide-react';

const StatisticsCards = () => {
  const stats = [
    {
      name: 'Total Check-ins',
      value: '142',
      icon: Calendar,
      trend: '+12%',
      trendUp: true,
      color: 'from-primary/20 to-accent/20',
    },
    {
      name: 'Current Streak',
      value: '7 days',
      icon: Flame,
      trend: '+3 days',
      trendUp: true,
      color: 'from-orange-400/20 to-red-400/20',
    },
    {
      name: 'Average Mood',
      value: '4.2/5',
      icon: TrendingUp,
      trend: '+0.3',
      trendUp: true,
      color: 'from-green-400/20 to-emerald-400/20',
    },
    {
      name: 'Weekly Goal',
      value: '5/7',
      icon: Target,
      trend: '71%',
      trendUp: true,
      color: 'from-blue-400/20 to-indigo-400/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="glass rounded-xl p-5 border border-border/50 hover:shadow-lg hover:shadow-primary/10 transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            {/* Icon */}
            <div
              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
            >
              <stat.icon className="w-5 h-5 text-primary" />
            </div>

            {/* Trend */}
            <div
              className={`flex items-center gap-1 text-xs font-medium ${
                stat.trendUp ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {stat.trendUp ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingUp className="w-3 h-3 rotate-180" />
              )}
              {stat.trend}
            </div>
          </div>

          {/* Value */}
          <h3 className="text-2xl font-bold text-foreground mb-1">
            {stat.value}
          </h3>

          {/* Name */}
          <p className="text-sm text-foreground/70">{stat.name}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default StatisticsCards;
