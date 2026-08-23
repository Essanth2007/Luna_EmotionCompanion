'use client';

import { useState } from 'react';
import { Search, Bell, Moon, Sun, Menu, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { userData } from '@/components/dashboard/mock-data';
import { getStoredUser } from '@/store/auth';

interface TopNavbarProps {
  onMenuClick: () => void;
}

const TopNavbar = ({ onMenuClick }: TopNavbarProps) => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
    document.documentElement.classList.toggle('dark');
  };

  const storedUser = getStoredUser();
  const displayName = storedUser?.name ?? userData.name;
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0,2);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-navbar sticky top-0 z-30 flex h-16 items-center justify-between px-4 md:px-6"
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white/60 hover:bg-white/[0.08] hover:text-white transition-colors md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </motion.button>

        {/* Mobile logo */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-blue-600">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">Luna</span>
        </div>

        {/* Desktop breadcrumb */}
        <div className="hidden md:block">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35">Mental Health Platform</p>
          <h1 className="text-base font-semibold text-white leading-tight">Overview</h1>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
          <input
            type="text"
            placeholder="Search insights..."
            className="h-8 w-44 rounded-xl border border-white/[0.08] bg-white/[0.05] pl-8 pr-3 text-xs text-white placeholder:text-white/30 outline-none transition-all focus:border-violet-500/40 focus:bg-white/[0.08] focus:ring-2 focus:ring-violet-500/15 lg:w-56"
          />
        </div>

        {/* Theme */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 hover:bg-white/[0.08] hover:text-white transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-white/50 hover:bg-white/[0.08] hover:text-white transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-violet-400 ring-2 ring-[#080c1a]" />
        </motion.button>

        {/* User avatar */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="ml-1 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.05] px-2 py-1.5 cursor-pointer hover:bg-white/[0.08] transition-colors"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/40 to-blue-500/40 text-xs font-bold text-violet-200 ring-1 ring-violet-500/30">
            {initials}
          </div>
          <div className="hidden md:block pr-1">
            <p className="text-xs font-semibold text-white leading-tight">{displayName}</p>
            <p className="text-[10px] text-white/40">Premium</p>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default TopNavbar;
