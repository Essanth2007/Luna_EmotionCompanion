'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Video, Heart, Brain, Sparkles, Clock, ArrowRight, Bookmark } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { GlassCard } from '@/components/common/GlassCard';
import { LunaAvatar } from '@/components/common/LunaAvatar';

const categories = [
  { id: 'all',        name: 'All',        icon: Sparkles, color: 'from-violet-500 to-purple-500' },
  { id: 'articles',   name: 'Articles',   icon: BookOpen,  color: 'from-blue-500 to-indigo-500' },
  { id: 'videos',     name: 'Videos',     icon: Video,     color: 'from-pink-500 to-rose-500' },
  { id: 'tips',       name: 'Tips',       icon: Heart,     color: 'from-emerald-500 to-teal-500' },
  { id: 'activities', name: 'Activities', icon: Brain,     color: 'from-amber-500 to-orange-500' },
];

const resources = [
  { id: '1', type: 'article',  title: 'Understanding Anxiety',              desc: 'Causes, symptoms, and effective coping strategies.',        category: 'Mental Health',   time: '8 min',  icon: BookOpen, gradient: 'from-blue-600/60 to-indigo-600/40',   chip: 'bg-blue-500/20 text-blue-300',   tags: ['anxiety', 'guide'] },
  { id: '2', type: 'video',    title: '5-Minute Morning Meditation',        desc: 'Start your day with this quick guided session.',             category: 'Meditation',      time: '5 min',  icon: Video,    gradient: 'from-pink-600/60 to-rose-600/40',     chip: 'bg-pink-500/20 text-pink-300',   tags: ['meditation', 'morning'] },
  { id: '3', type: 'tip',      title: 'Grounding Techniques',               desc: 'Quick techniques to reduce stress anywhere.',                category: 'Stress Relief',   time: '3 min',  icon: Heart,    gradient: 'from-emerald-600/60 to-teal-600/40', chip: 'bg-emerald-500/20 text-emerald-300', tags: ['stress', 'grounding'] },
  { id: '4', type: 'activity', title: 'Gratitude Journal Exercise',         desc: 'Daily practice to cultivate positivity.',                   category: 'Journaling',      time: '10 min', icon: Brain,    gradient: 'from-amber-600/60 to-orange-600/40', chip: 'bg-amber-500/20 text-amber-300', tags: ['gratitude', 'exercise'] },
  { id: '5', type: 'article',  title: 'Sleep & Mental Health',              desc: 'Explore the connection between sleep and well-being.',       category: 'Sleep',           time: '6 min',  icon: BookOpen, gradient: 'from-violet-600/60 to-purple-600/40', chip: 'bg-violet-500/20 text-violet-300', tags: ['sleep', 'health'] },
  { id: '6', type: 'video',    title: 'Progressive Muscle Relaxation',      desc: 'Release tension with this powerful technique.',              category: 'Relaxation',      time: '15 min', icon: Video,    gradient: 'from-cyan-600/60 to-blue-600/40',    chip: 'bg-cyan-500/20 text-cyan-300',   tags: ['relaxation', 'muscle'] },
  { id: '7', type: 'tip',      title: 'Building Healthy Habits',            desc: 'Practical strategies for sustainable wellness habits.',      category: 'Self-Care',       time: '5 min',  icon: Heart,    gradient: 'from-green-600/60 to-emerald-600/40', chip: 'bg-green-500/20 text-green-300', tags: ['habits', 'self-care'] },
  { id: '8', type: 'activity', title: 'Mindful Walking Practice',           desc: 'Turn your daily walk into a mindfulness exercise.',          category: 'Mindfulness',     time: '20 min', icon: Brain,    gradient: 'from-orange-600/60 to-amber-600/40', chip: 'bg-orange-500/20 text-orange-300', tags: ['mindfulness', 'walking'] },
];

export default function WellnessPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  const filtered = resources.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.desc.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || r.type === category.replace('articles','article').replace('videos','video').replace('tips','tip').replace('activities','activity');
    return matchSearch && matchCat;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Wellness Library</h1>
          <p className="mt-1 text-sm text-white/45">Curated resources for your mental wellness journey</p>
        </div>

        {/* Search + filters */}
        <GlassCard className="p-4" hover={false}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                placeholder="Search resources…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-9 pr-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/10 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const active = category === cat.id;
                return (
                  <motion.button key={cat.id} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      active
                        ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                        : 'border border-white/[0.08] bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/80'
                    }`}>
                    <Icon className="h-3.5 w-3.5" />{cat.name}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </GlassCard>

        {/* Resource grid */}
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((r, i) => {
              const Icon = r.icon;
              const saved = bookmarked.has(r.id);
              return (
                <motion.div key={r.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  <GlassCard className="flex h-full flex-col overflow-hidden p-0" hover>
                    {/* Cover strip */}
                    <div className={`relative h-24 bg-gradient-to-br ${r.gradient} flex items-center justify-center`}>
                      <Icon className="h-10 w-10 text-white/40" />
                      {/* Bookmark */}
                      <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setBookmarked(prev => {
                          const n = new Set(prev);
                          saved ? n.delete(r.id) : n.add(r.id);
                          return n;
                        })}
                        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors">
                        <Bookmark className={`h-3.5 w-3.5 ${saved ? 'fill-white text-white' : 'text-white/60'}`} />
                      </motion.button>
                      {/* Category chip */}
                      <span className={`absolute bottom-2 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold backdrop-blur-sm ${r.chip} border border-current/20`}>
                        {r.category}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="mb-1 text-sm font-bold text-white line-clamp-1">{r.title}</h3>
                      <p className="mb-3 flex-1 text-xs leading-relaxed text-white/45 line-clamp-2">{r.desc}</p>

                      <div className="mb-3 flex flex-wrap gap-1">
                        {r.tags.slice(0,2).map((tag) => (
                          <span key={tag} className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[9px] font-medium text-violet-400">#{tag}</span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-white/30">
                          <Clock className="h-3 w-3" />
                          <span className="text-[10px]">{r.time}</span>
                        </div>
                        <motion.button whileHover={{ x: 2 }}
                          className="flex items-center gap-1 text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition-colors">
                          Explore <ArrowRight className="h-3 w-3" />
                        </motion.button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <GlassCard className="flex flex-col items-center gap-4 py-16 text-center" hover={false}>
            <LunaAvatar state="thinking" size="xl" float showRing />
            <div>
              <h3 className="text-base font-semibold text-white/70">No resources found</h3>
              <p className="mt-1 text-xs text-white/35">Try adjusting your search or category filter</p>
            </div>
          </GlassCard>
        )}

        {/* Featured CTA */}
        <GlassCard className="relative overflow-hidden p-7" hover={false}>
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-violet-600/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-32 w-64 rounded-full bg-blue-600/15 blur-2xl" />
          </div>
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center">
            <LunaAvatar state="happy" size="xl" float showRing />
            <div className="flex-1">
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-300">
                Featured Challenge
              </span>
              <h3 className="mt-2 text-lg font-bold text-white">30-Day Wellness Challenge</h3>
              <p className="mt-1.5 max-w-lg text-sm text-white/50">
                Build healthy habits with daily activities focused on mindfulness, gratitude, and self-care.
              </p>
            </div>
            <motion.button whileHover={{ scale: 1.04, x: -2 }} whileTap={{ scale: 0.97 }}
              className="btn-glow flex shrink-0 items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white">
              Join Challenge <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
