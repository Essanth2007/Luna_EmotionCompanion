'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import TopNavbar from '@/components/dashboard/TopNavbar';
import { CallProvider } from '@/components/call/CallProvider';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 8,
  duration: Math.random() * 6 + 6,
}));

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <CallProvider>
      <div className="dashboard-bg relative min-h-screen overflow-hidden">
        {/* Atmospheric blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-violet-600/12 blur-[130px]" />
          <div className="absolute -right-20 top-1/4 h-[450px] w-[450px] rounded-3xl bg-blue-600/10 blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 h-[380px] w-[380px] rounded-full bg-indigo-500/10 blur-[110px]" />
          <div className="absolute right-1/4 bottom-1/4 h-[280px] w-[280px] rounded-full bg-purple-500/08 blur-[90px]" />

          {/* Floating particles */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="particle absolute rounded-full bg-violet-400/40"
              style={{
                left: p.left,
                bottom: '-10px',
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>

        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div
          className={cn(
            'relative flex min-h-screen flex-col transition-[margin] duration-300 ease-out',
            collapsed ? 'md:ml-[5.5rem]' : 'md:ml-64'
          )}
        >
          <TopNavbar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </CallProvider>
  );
};

export default DashboardLayout;
