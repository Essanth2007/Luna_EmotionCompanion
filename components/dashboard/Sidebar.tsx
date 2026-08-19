'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, MessageCircle, Video, Mic, Upload,
  FileText, BookOpen, Settings, LogOut, ChevronLeft,
  ChevronRight, X, Sparkles, Flower2, Library, Bell,
  User, Phone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { clearAuth } from '@/store/auth';

interface SidebarProps {
  collapsed:        boolean;
  mobileOpen:       boolean;
  onToggleCollapse: () => void;
  onMobileClose:    () => void;
}

const navItems = [
  { name: 'Dashboard',        href: '/dashboard',              icon: LayoutDashboard, color: 'from-blue-500 to-indigo-500' },
  { name: 'Chat with Luna',   href: '/dashboard/chat',         icon: MessageCircle,   color: 'from-violet-500 to-purple-500' },
  { name: 'Calls',            href: '/dashboard/calls',        icon: Phone,           color: 'from-emerald-500 to-teal-500' },
  { name: 'Voice Analysis',   href: '/dashboard/voice',        icon: Mic,             color: 'from-pink-500 to-rose-500' },
  { name: 'Video Analysis',   href: '/dashboard/video',        icon: Video,           color: 'from-amber-500 to-orange-500' },
  { name: 'Upload Analysis',  href: '/dashboard/upload',       icon: Upload,          color: 'from-cyan-500 to-blue-500' },
  { name: 'Reports',          href: '/dashboard/reports',      icon: FileText,        color: 'from-sky-500 to-blue-500' },
  { name: 'Mood Journal',     href: '/dashboard/journal',      icon: BookOpen,        color: 'from-lime-500 to-green-500' },
  { name: 'Meditation',       href: '/dashboard/meditation',   icon: Flower2,         color: 'from-teal-500 to-cyan-500' },
  { name: 'Wellness Library', href: '/dashboard/wellness',     icon: Library,         color: 'from-indigo-500 to-violet-500' },
  { name: 'Notifications',    href: '/dashboard/notifications',icon: Bell,            color: 'from-yellow-500 to-amber-500' },
  { name: 'Profile',          href: '/dashboard/profile',      icon: User,            color: 'from-fuchsia-500 to-pink-500' },
  { name: 'Settings',         href: '/dashboard/settings',     icon: Settings,        color: 'from-slate-400 to-slate-500' },
];

export default function Sidebar({ collapsed, mobileOpen, onToggleCollapse, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = () => {
    clearAuth();
    document.cookie = 'luna_auth_token=; path=/; max-age=0';
    router.push('/login');
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={cn('flex items-center border-b border-white/[0.06] px-4 py-5', collapsed ? 'justify-center' : 'justify-between')}>
        <Link href="/dashboard" onClick={onMobileClose} className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <motion.div whileHover={{ scale: 1.08, rotate: 5 }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 shadow-lg shadow-violet-500/30">
            <Sparkles className="h-5 w-5 text-white" />
          </motion.div>
          {!collapsed && (
            <div>
              <h2 className="font-bold leading-tight text-white">Luna</h2>
              <p className="text-[10px] font-medium uppercase tracking-widest text-white/40">Emotion Companion</p>
            </div>
          )}
        </Link>
        {!collapsed && (
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
            onClick={onToggleCollapse}
            className="hidden h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-white/[0.07] hover:text-white/70 transition-colors md:flex">
            <ChevronLeft className="h-4 w-4" />
          </motion.button>
        )}
      </div>

      {collapsed && (
        <div className="hidden justify-center border-b border-white/[0.06] py-3 md:flex">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
            onClick={onToggleCollapse}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-white/[0.07] hover:text-white/70 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 custom-scroll">
        {navItems.map((item, index) => {
          const Icon   = item.icon;
          const active = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));

          return (
            <motion.div key={item.name}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.025, duration: 0.3 }}>
              <Link href={item.href} onClick={onMobileClose}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
                  collapsed && 'justify-center px-2',
                  active ? 'text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05]'
                )}>
                {active && (
                  <motion.div layoutId="activeNav"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/30 to-blue-600/20 border border-violet-500/20"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }} />
                )}
                <div className={cn(
                  'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200',
                  active ? `bg-gradient-to-br ${item.color} shadow-lg` : 'bg-white/[0.06] group-hover:bg-white/[0.1]'
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                {!collapsed && (
                  <span className="relative z-10 text-[13px] font-medium">{item.name}</span>
                )}
                {active && !collapsed && (
                  <motion.div layoutId="activeDot" className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/[0.06] p-3">
        <button onClick={handleLogout}
          className={cn(
            'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-white/40 transition-all hover:bg-rose-500/10 hover:text-rose-400',
            collapsed && 'justify-center'
          )}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] group-hover:bg-rose-500/20 transition-colors">
            <LogOut className="h-4 w-4" />
          </div>
          {!collapsed && <span className="text-[13px] font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onMobileClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden" />
        )}
      </AnimatePresence>

      {/* Desktop */}
      <motion.aside initial={false} animate={{ width: collapsed ? 88 : 256 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="glass-sidebar fixed left-0 top-0 z-50 hidden h-screen overflow-hidden md:block">
        {sidebarContent}
      </motion.aside>

      {/* Mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="glass-sidebar fixed left-0 top-0 z-50 h-screen w-64 md:hidden">
            <div className="absolute right-3 top-3 z-10">
              <button onClick={onMobileClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-white/[0.07] hover:text-white/70 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
