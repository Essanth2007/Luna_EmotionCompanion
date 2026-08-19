'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, Calendar, Award, Edit2, Flame,
  Heart, Save, X, Camera, CheckCircle2,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { GlassCard } from '@/components/common/GlassCard';
import { LunaAvatar } from '@/components/common/LunaAvatar';
import { profileService } from '@/services/profile';

const inputCls =
  'w-full rounded-2xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/10 transition-all';

const achievements = [
  { emoji: '🌟', name: 'First Entry',      desc: 'Created your first journal entry', earned: true  },
  { emoji: '🔥', name: '7-Day Streak',     desc: 'Logged mood 7 days in a row',       earned: true  },
  { emoji: '💪', name: 'Wellness Warrior', desc: 'Achieved 80+ wellness score',       earned: false },
  { emoji: '🎯', name: 'Goal Setter',      desc: 'Set and achieved a wellness goal',  earned: false },
  { emoji: '🧘', name: 'Zen Master',       desc: 'Completed 10 meditations',          earned: false },
  { emoji: '📓', name: 'Journalist',       desc: 'Wrote 30 journal entries',          earned: false },
];

export default function ProfilePage() {
  const [profile,   setProfile]   = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving,  setIsSaving]  = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [name, setName] = useState('');
  const [bio,  setBio]  = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    const r = await profileService.getProfile();
    if (r.data) {
      setProfile(r.data);
      setName(r.data.name || '');
      setBio(r.data.bio || '');
    }
    setIsLoading(false);
  };

  const save = async () => {
    setIsSaving(true);
    await profileService.updateProfile({ name, bio });
    setIsSaving(false);
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    load();
  };

  const cancel = () => {
    setIsEditing(false);
    setName(profile?.name || '');
    setBio(profile?.bio || '');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 flex-col items-center justify-center gap-4">
          <LunaAvatar state="thinking" size="xl" float showRing />
          <p className="text-sm text-white/40">Loading profile…</p>
        </div>
      </DashboardLayout>
    );
  }

  const initials = (profile?.name ?? 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="mt-1 text-sm text-white/45">Manage your personal information</p>
        </div>

        {/* Saved toast */}
        {saved && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <CheckCircle2 className="h-4 w-4" /> Profile saved successfully
          </motion.div>
        )}

        {/* Main profile card */}
        <GlassCard className="p-7" hover={false}>
          <div className="flex flex-col gap-7 md:flex-row md:items-start">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="group relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600 text-2xl font-bold text-white shadow-xl shadow-violet-500/25 ring-4 ring-violet-500/20">
                  {initials}
                </div>
                <button
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-[#0d0820] text-white/60 hover:text-white transition-colors"
                  title="Change avatar">
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-violet-300">
                Premium
              </span>
            </div>

            {/* Info / edit form */}
            <div className="flex-1 space-y-5">
              {!isEditing ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
                      <p className="mt-1 text-sm text-white/50 leading-relaxed max-w-md">
                        {profile?.bio || 'No bio yet — add one to tell others about yourself.'}
                      </p>
                    </div>
                    <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                      onClick={() => setIsEditing(true)}
                      className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white/60 hover:bg-white/[0.09] hover:text-white transition-colors">
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                      <Mail className="h-4 w-4 shrink-0 text-violet-400" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-white/35 uppercase tracking-wider">Email</p>
                        <p className="truncate text-xs font-semibold text-white/80">{profile?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                      <Calendar className="h-4 w-4 shrink-0 text-blue-400" />
                      <div>
                        <p className="text-[10px] text-white/35 uppercase tracking-wider">Member since</p>
                        <p className="text-xs font-semibold text-white/80">
                          {new Date(profile?.joinDate || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/40">
                      Display Name
                    </label>
                    <input value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Your name" className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/40">
                      Bio
                    </label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself…" rows={3}
                      className={`${inputCls} resize-none`} />
                  </div>
                  <div className="flex gap-2">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={save} disabled={isSaving}
                      className="btn-glow flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold text-white disabled:opacity-60">
                      {isSaving
                        ? <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white" /> Saving…</>
                        : <><Save className="h-3.5 w-3.5" /> Save Changes</>}
                    </motion.button>
                    <button onClick={cancel}
                      className="flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.05] px-5 py-2.5 text-xs font-semibold text-white/60 hover:bg-white/[0.09] transition-colors">
                      <X className="h-3.5 w-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: Flame,  label: 'Day Streak',     value: profile?.moodStreak  ?? 0, gradient: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/25' },
            { icon: Heart,  label: 'Wellness Score',  value: profile?.wellnessScore ?? 0, gradient: 'from-rose-500 to-pink-500',   glow: 'shadow-rose-500/25'  },
            { icon: Award,  label: 'Achievements',    value: achievements.filter(a => a.earned).length, gradient: 'from-violet-500 to-purple-500', glow: 'shadow-violet-500/25' },
          ].map(({ icon: Icon, label, value, gradient, glow }) => (
            <GlassCard key={label} className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg ${glow}`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/40">{label}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Achievements */}
        <GlassCard className="p-6" hover={false}>
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20">
              <Award className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <h2 className="text-sm font-bold text-white">Achievements</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {achievements.map((a, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                  a.earned
                    ? 'border-violet-500/25 bg-violet-500/10'
                    : 'border-white/[0.07] bg-white/[0.02] opacity-40'
                }`}>
                <span className="text-2xl">{a.emoji}</span>
                <p className="text-[11px] font-semibold text-white/80 leading-tight">{a.name}</p>
                <p className="text-[9px] text-white/35 leading-tight">{a.desc}</p>
                {a.earned && (
                  <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[9px] font-bold text-violet-300">Earned</span>
                )}
              </motion.div>
            ))}
          </div>
        </GlassCard>

      </div>
    </DashboardLayout>
  );
}
