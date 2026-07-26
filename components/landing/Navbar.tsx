'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';

const navLinks = [
  { name: 'Home',     href: '#' },
  { name: 'Features', href: '#features' },
  { name: 'About',    href: '#about' },
  { name: 'Contact',  href: '#contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-navbar shadow-xl shadow-black/20' : 'bg-transparent'
      }`}>
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div whileHover={{ scale: 1.1, rotate: 5 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 shadow-lg shadow-violet-500/30">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </motion.div>
            <span className="text-lg font-bold text-gradient">Luna</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href}
                className="text-sm font-medium text-white/60 transition-colors hover:text-white">
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/[0.07] hover:text-white transition-colors">
                Sign In
              </motion.button>
            </Link>
            <Link href="/register">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="btn-glow rounded-full px-5 py-2.5 text-sm font-bold text-white">
                Get Started
              </motion.button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsOpen(!isOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/70 hover:bg-white/[0.08] hover:text-white transition-colors md:hidden"
            aria-label="Toggle menu">
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/[0.08] bg-[#060912]/95 backdrop-blur-2xl md:hidden">
            <div className="container-custom space-y-1 py-5">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-medium text-white/60 hover:bg-white/[0.06] hover:text-white transition-colors">
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <button className="w-full rounded-xl border border-white/[0.1] py-2.5 text-sm font-semibold text-white/70 hover:bg-white/[0.06] transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <button className="btn-glow w-full rounded-xl py-2.5 text-sm font-bold text-white">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
