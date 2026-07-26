'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Award, Edit, Flame, Heart } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { GlassCard } from '@/components/common/GlassCard';
import { LunaAvatar } from '@/components/common/LunaAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { profileService } from '@/services/profile';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const response = await profileService.getProfile();
    if (response.data) {
      setProfile(response.data);
      setName(response.data.name || '');
      setBio(response.data.bio || '');
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await profileService.updateProfile({ name, bio });
    setIsSaving(false);
    setIsEditing(false);
    loadProfile();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <LunaAvatar state="thinking" size="xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your profile information
          </p>
        </div>

        {/* Profile Card */}
        <GlassCard className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profile?.avatar} alt={profile?.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl">
                  {profile?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" className="glass">
                Change Avatar
              </Button>
            </div>

            {/* Info Section */}
            <div className="flex-1 space-y-4">
              {!isEditing ? (
                <>
                  <h2 className="text-2xl font-bold">{profile?.name}</h2>
                  <p className="text-muted-foreground">{profile?.bio}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{profile?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Member Since</p>
                        <p className="font-medium">{formatDate(profile?.joinDate)}</p>
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => setIsEditing(true)} className="mt-4">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </>
              ) : (
                <div className="space-y-4 w-full">
                  <div>
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="glass"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-bio">Bio</Label>
                    <Textarea
                      id="edit-bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="min-h-[100px] glass"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setName(profile?.name || '');
                        setBio(profile?.bio || '');
                      }}
                      variant="outline"
                      className="glass"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6 text-center">
            <Flame className="w-8 h-8 mx-auto mb-2 text-orange-400" />
            <p className="text-3xl font-bold">{profile?.moodStreak || 0}</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <Heart className="w-8 h-8 mx-auto mb-2 text-red-400" />
            <p className="text-3xl font-bold">{profile?.wellnessScore || 0}</p>
            <p className="text-sm text-muted-foreground">Wellness Score</p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <Award className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
            <p className="text-3xl font-bold">12</p>
            <p className="text-sm text-muted-foreground">Achievements</p>
          </GlassCard>
        </div>

        {/* Achievements */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🌟', name: 'First Entry', desc: 'Created your first journal entry' },
              { icon: '🔥', name: '7 Day Streak', desc: 'Logged mood for 7 days straight' },
              { icon: '💪', name: 'Wellness Warrior', desc: 'Achieved 80+ wellness score' },
              { icon: '🎯', name: 'Goal Setter', desc: 'Set and achieved a wellness goal' },
            ].map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 glass rounded-lg text-center"
              >
                <span className="text-3xl">{achievement.icon}</span>
                <p className="font-medium mt-2">{achievement.name}</p>
                <p className="text-xs text-muted-foreground">{achievement.desc}</p>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
