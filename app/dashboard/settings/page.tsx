'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Moon, Sun, Bell, Shield, Phone, LogOut, User, Save, Monitor } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { GlassCard } from '@/components/common/GlassCard';
import { LunaAvatar } from '@/components/common/LunaAvatar';
import { Switch } from '@/components/ui/switch';
import { profileService } from '@/services/profile';
import { useRouter } from 'next/navigation';
import { clearAuth } from '@/store/auth';

const themes = [
  { id: 'light',  label: 'Light',  icon: Sun },
  { id: 'dark',   label: 'Dark',   icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
] as const;

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [notifications, setNotifications] = useState(true);
  const [dailyCheckIn, setDailyCheckIn] = useState(true);
  const [journalReminders, setJournalReminders] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    const r = await profileService.getProfile();
    if (r.data) {
      setName(r.data.name || '');
      setBio(r.data.bio || '');
      setTheme((r.data.preferences?.theme ?? 'system') as 'light' | 'dark' | 'system');
      setNotifications(r.data.preferences?.notifications ?? true);
      setEmergencyName(r.data.emergencyContact?.name || '');
      setEmergencyPhone(r.data.emergencyContact?.phone || '');
      setEmergencyRel(r.data.emergencyContact?.relationship || '');
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await profileService.updateProfile({
      name, bio,
      preferences: { theme, notifications },
      emergencyContact: { name: emergencyName, phone: emergencyPhone, relationship: emergencyRel },
    });
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 flex-col items-center justify-center gap-4">
          <LunaAvatar state="thinking" size="xl" float showRing />
          <p className="text-sm text-white/40">Loading settings…</p>
        </div>
      </DashboardLayout>
    );
  }

  const inputCls = "w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/10 transition-all";

  const Section = ({ icon: Icon, title, color, children }: { icon: any; title: string; color: string; children: React.ReactNode }) => (
    <GlassCard className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <h2 className="text-sm font-bold text-white">{title}</h2>
      </div>
      {children}
    </GlassCard>
  );

  const ToggleRow = ({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <div>
        <p className="text-xs font-semibold text-white/80">{label}</p>
        <p className="mt-0.5 text-[11px] text-white/35">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-5 pb-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-sm text-white/45">Manage your profile and preferences</p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Profile */}
          <Section icon={User} title="Profile" color="from-violet-500 to-purple-600">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/40">Display Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/40">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself…"
                  rows={3}
                  className={`${inputCls} resize-none`} />
              </div>
            </div>
          </Section>

          {/* Appearance */}
          <Section icon={Sun} title="Appearance" color="from-amber-500 to-orange-500">
            <div>
              <label className="mb-3 block text-[11px] font-semibold uppercase tracking-wider text-white/40">Theme</label>
              <div className="grid grid-cols-3 gap-2.5">
                {themes.map(({ id, label, icon: Icon }) => (
                  <motion.button key={id} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => setTheme(id)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border py-4 transition-all ${
                      theme === id
                        ? 'border-violet-500/50 bg-violet-500/15 text-white'
                        : 'border-white/[0.07] bg-white/[0.03] text-white/40 hover:border-white/15 hover:text-white/70'
                    }`}>
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-semibold">{label}</span>
                    {theme === id && <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />}
                  </motion.button>
                ))}
              </div>
            </div>
          </Section>

          {/* Notifications */}
          <Section icon={Bell} title="Notifications" color="from-blue-500 to-indigo-600">
            <div className="space-y-2.5">
              <ToggleRow label="Push Notifications" desc="Receive reminders and updates" checked={notifications} onChange={setNotifications} />
              <ToggleRow label="Daily Check-in" desc="Get reminded to log your mood" checked={dailyCheckIn} onChange={setDailyCheckIn} />
              <ToggleRow label="Journal Reminders" desc="Weekly journal prompts" checked={journalReminders} onChange={setJournalReminders} />
            </div>
          </Section>

          {/* Emergency Contact */}
          <Section icon={Phone} title="Emergency Contact" color="from-rose-500 to-pink-600">
            <div className="space-y-3.5">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/40">Contact Name</label>
                <input value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} placeholder="Full name" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/40">Phone Number</label>
                <input value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} placeholder="+1 234 567 8900" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/40">Relationship</label>
                <input value={emergencyRel} onChange={(e) => setEmergencyRel(e.target.value)} placeholder="Spouse, Parent, Friend…" className={inputCls} />
              </div>
            </div>
          </Section>
        </div>

        {/* Privacy */}
        <Section icon={Shield} title="Privacy" color="from-emerald-500 to-teal-500">
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            <ToggleRow label="Anonymous Data Sharing" desc="Help improve mental health research" checked={dataSharing} onChange={setDataSharing} />
            <ToggleRow label="Usage Analytics" desc="Help improve the Luna experience" checked={analytics} onChange={setAnalytics} />
          </div>
        </Section>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleSave} disabled={isSaving}
            className="btn-glow flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60">
            {isSaving ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
            ) : <Save className="h-4 w-4" />}
            {isSaving ? 'Saving…' : 'Save Changes'}
          </motion.button>

          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { clearAuth(); document.cookie = 'luna_auth_token=; path=/; max-age=0'; router.push('/login'); }}
            className="ml-auto flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-6 py-2.5 text-sm font-bold text-rose-400 hover:bg-rose-500/20 transition-colors">
            <LogOut className="h-4 w-4" /> Logout
          </motion.button>
        </div>
      </div>
    </DashboardLayout>
  );
}
