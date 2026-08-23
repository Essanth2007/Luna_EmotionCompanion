'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'About',    href: '#about' },
  { name: 'Contact',  href: '#contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b border-white/[0.08] bg-[#0d0818]/80 backdrop-blur-2xl shadow-2xl shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between md:h-[4.5rem]">

          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 6 }}
              whileTap={{ scale: 0.94 }}
              className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/35"
            >
              {/* Luna moon icon */}
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-white" aria-hidden>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </motion.div>
            <span
              className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Luna
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="rounded-xl px-4 py-2 text-sm font-medium text-white/55 transition-all hover:bg-white/[0.07] hover:text-white"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="rounded-xl px-5 py-2 text-sm font-semibold text-white/65 transition-all hover:bg-white/[0.08] hover:text-white"
              >
                Login
              </motion.button>
            </Link>
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 28px rgba(167,139,250,0.45)' }}
                whileTap={{ scale: 0.96 }}
                className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-shadow"
              >
                Get Started
              </motion.button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/65 hover:bg-white/[0.08] hover:text-white transition-colors md:hidden"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isOpen
                ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}><X className="h-5 w-5" /></motion.div>
                : <motion.div key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}><Menu className="h-5 w-5" /></motion.div>
              }
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/[0.08] bg-[#0d0818]/95 backdrop-blur-2xl md:hidden"
          >
            <div className="container-custom space-y-1 py-5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.07] hover:text-white"
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <button className="w-full rounded-xl border border-white/[0.1] py-3 text-sm font-semibold text-white/70 hover:bg-white/[0.07] transition-colors">
                    Login
                  </button>
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <button className="w-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20">
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
