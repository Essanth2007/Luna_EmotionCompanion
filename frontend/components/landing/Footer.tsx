'use client';

import Link from 'next/link';
import { Heart, Mail, MessageCircle, Code2, ExternalLink } from 'lucide-react';

const footerLinks = {
  product:   [{ name: 'Features', href: '#features' }, { name: 'Security', href: '#' }, { name: 'Roadmap', href: '#' }],
  company:   [{ name: 'About',    href: '#about' },    { name: 'Blog',     href: '#' }, { name: 'Careers', href: '#' }],
  resources: [{ name: 'Help Center', href: '#' },      { name: 'Community', href: '#' }, { name: 'Privacy', href: '#' }],
};

const socials = [
  { label: 'Twitter',  icon: MessageCircle, href: '#' },
  { label: 'GitHub',   icon: Code2,         href: '#' },
  { label: 'LinkedIn', icon: ExternalLink,  href: '#' },
  { label: 'Email',    icon: Mail,          href: 'mailto:hello@luna.ai' },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.07]">
      {/* Top glow line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      <div className="container-custom py-14 md:py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5 lg:gap-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/25">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" aria-hidden>
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </div>
              <span
                className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent"
                style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                Luna
              </span>
            </Link>
            <p className="mb-6 max-w-[260px] text-sm leading-relaxed text-white/40">
              Your AI-powered companion for emotional wellness. Understand your emotions like never before.
            </p>
            <div className="flex items-center gap-2.5">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <Link key={s.label} href={s.href}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/40 transition-all hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-300"
                    aria-label={s.label}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'Product',   links: footerLinks.product },
            { title: 'Company',   links: footerLinks.company },
            { title: 'Resources', links: footerLinks.resources },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/35">{title}</h4>
              <ul className="space-y-3">
                {links.map((l) => (
                  <li key={l.name}>
                    <Link href={l.href}
                      className="text-sm text-white/45 transition-colors hover:text-white/80">
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.07] pt-8 md:flex-row">
          <p className="flex items-center gap-1.5 text-xs text-white/30">
            Made with <Heart className="h-3 w-3 fill-violet-400 text-violet-400" /> by Team SparkX
          </p>
          <div className="flex items-center gap-6 text-xs text-white/30">
            {['Terms', 'Privacy', 'Cookies'].map((t) => (
              <Link key={t} href="#" className="hover:text-white/60 transition-colors">{t}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
