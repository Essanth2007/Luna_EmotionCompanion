'use client';

import { motion } from 'framer-motion';
import { User, Mail, Crown, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProfileCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-xl p-6 border border-border/50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Profile</h3>
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5 text-foreground/50" />
        </Button>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
          <User className="w-10 h-10 text-primary" />
        </div>

        {/* Name */}
        <h4 className="text-xl font-semibold text-foreground mb-1">
          John Doe
        </h4>

        {/* Email */}
        <div className="flex items-center gap-2 text-sm text-foreground/70">
          <Mail className="w-4 h-4" />
          <span>john@example.com</span>
        </div>
      </div>

      {/* Membership Badge */}
      <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 mb-4">
        <Crown className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground/80">
          Premium Member
        </span>
      </div>

      {/* Edit Profile Button */}
      <Button variant="outline" className="w-full border-border/50">
        Edit Profile
      </Button>
    </motion.div>
  );
};

export default ProfileCard;
