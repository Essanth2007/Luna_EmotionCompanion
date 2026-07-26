'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calendar, Save, Trash2, Sparkles, Flame, PenLine } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { GlassCard } from '@/components/common/GlassCard';
import { LunaAvatar } from '@/components/common/LunaAvatar';
import { MoodSelector } from '@/components/common/MoodSelector';
import { journalService } from '@/services/journal';

const moodEmoji: Record<string, string> = {
  happy: '😊', calm: '😌', neutral: '😐', sad: '😢', anxious: '😰', angry: '😠',
};

export default function JournalPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedMood, setSelectedMood] = useState('');
  const [moodIntensity, setMoodIntensity] = useState(5);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({ totalEntries: 0, streak: 0 });

  useEffect(() => { loadEntries(); loadStats(); }, []);

  const loadEntries = async () => {
    const r = await journalService.getEntries();
    if (r.data) setEntries(r.data);
  };

  const loadStats = async () => {
    const r = await journalService.getStats();
    if (r.data) setStats(r.data);
  };

  const handleSave = async () => {
    if (!selectedMood || !content.trim()) return;
    setIsSaving(true);
    const r = await journalService.createEntry({
      mood: selectedMood, moodIntensity, content,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setIsSaving(false);
    if (r.data) {
      setEntries([r.data, ...entries]);
      setContent(''); setTags(''); setSelectedMood(''); setMoodIntensity(5);
      loadStats();
    }
  };

  const handleDelete = async (id: string) => {
    await journalService.deleteEntry(id);
    setEntries(entries.filter((e) => e.id !== id));
    loadStats();
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Mood Journal</h1>
            <p className="mt-1 text-sm text-white/45">Track your thoughts and emotions</p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-center">
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Entries</p>
              <p className="text-lg font-bold text-white">{stats.totalEntries}</p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center">
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Streak</p>
              <div className="flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <p className="text-lg font-bold text-white">{stats.streak}d</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* ── New Entry ── */}
          <GlassCard className="p-7">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/20">
                <PenLine className="h-4 w-4 text-violet-400" />
              </div>
              <h2 className="text-base font-semibold text-white">New Entry</h2>
            </div>

            <div className="space-y-5">
              {/* Mood */}
              <div>
                <label className="mb-2.5 block text-xs font-semibold text-white/50 uppercase tracking-wider">How are you feeling?</label>
                <MoodSelector selectedMood={selectedMood} onMoodSelect={(m) => setSelectedMood(m.id)} />
              </div>

              {/* Intensity */}
              <AnimatePresence>
                {selectedMood && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Intensity</label>
                      <span className="rounded-lg bg-violet-500/20 px-2 py-0.5 text-xs font-bold text-violet-300">{moodIntensity}/10</span>
                    </div>
                    <div className="relative">
                      <input type="range" min="1" max="10" value={moodIntensity}
                        onChange={(e) => setMoodIntensity(Number(e.target.value))}
                        className="w-full accent-violet-500" />
                      <div className="mt-1 flex justify-between">
                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
                          <div key={n} className={`h-1 w-1 rounded-full ${n <= moodIntensity ? 'bg-violet-400' : 'bg-white/10'}`} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Content */}
              <div>
                <label className="mb-2.5 block text-xs font-semibold text-white/50 uppercase tracking-wider">Your thoughts</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write freely about your day, feelings, or anything on your mind…"
                  rows={5}
                  className="w-full resize-none rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/10 transition-all custom-scroll"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="mb-2.5 block text-xs font-semibold text-white/50 uppercase tracking-wider">Tags</label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="gratitude, work, family…"
                  className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/10 transition-all"
                />
              </div>

              {/* Save */}
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={!selectedMood || !content.trim() || isSaving}
                className="btn-glow flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isSaving ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                ) : <><Save className="h-4 w-4" /> Save Entry</>}
              </motion.button>
            </div>
          </GlassCard>

          {/* ── Previous Entries ── */}
          <GlassCard className="p-7">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/20">
                <BookOpen className="h-4 w-4 text-blue-400" />
              </div>
              <h2 className="text-base font-semibold text-white">Previous Entries</h2>
            </div>

            <div className="space-y-3 max-h-[560px] overflow-y-auto custom-scroll pr-1">
              {entries.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-12 text-center">
                  <LunaAvatar state="default" size="lg" float showRing />
                  <div>
                    <p className="text-sm font-medium text-white/50">No entries yet</p>
                    <p className="mt-1 text-xs text-white/30">Start journaling to track your journey</p>
                  </div>
                </div>
              ) : (
                entries.map((entry) => (
                  <motion.div key={entry.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 hover:border-white/[0.12] hover:bg-white/[0.05] transition-all">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-xl">
                          {moodEmoji[entry.mood] ?? '😐'}
                        </div>
                        <div>
                          <p className="text-xs font-semibold capitalize text-white/80">{entry.mood}</p>
                          <p className="flex items-center gap-1 text-[10px] text-white/35">
                            <Calendar className="h-3 w-3" />{fmtDate(entry.createdAt)}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(entry.id)}
                        className="rounded-lg p-1.5 text-white/20 opacity-0 group-hover:opacity-100 hover:bg-rose-500/15 hover:text-rose-400 transition-all">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className="mb-2 line-clamp-3 text-xs leading-relaxed text-white/55">{entry.content}</p>

                    {entry.tags?.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {entry.tags.map((tag: string) => (
                          <span key={tag} className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-[10px] font-medium text-violet-300">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {entry.lunaReflection && (
                      <div className="mt-3 border-t border-white/[0.07] pt-3">
                        <div className="flex items-start gap-2">
                          <LunaAvatar state="listening" size="sm" showRing={false} animate={false} />
                          <p className="text-[11px] italic leading-relaxed text-violet-300/70">{entry.lunaReflection}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
