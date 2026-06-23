'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LoadingLink } from '@/components/LoadingLink';

const NAV_LINKS = [
  { href: '/services', label: 'Services' },
  { href: '/architecture', label: 'Architecture' },
  { href: '/changelog', label: 'Changelog' },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={
        scrolled
          ? {
              background: 'rgba(8,8,8,0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }
          : {
              background: 'transparent',
              borderBottom: '1px solid transparent',
            }
      }
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-[15px] font-bold tracking-tight text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded"
        >
          Jay<span style={{ color: '#52525b' }}>Sync</span> Lab
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <ul className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="px-3 py-2 text-sm transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 hover:text-white"
                  style={{ color: '#a1a1aa' }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <LoadingLink
            href="/docs"
            className="ml-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            style={{
              color: '#ffffff',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            Enter docs →
          </LoadingLink>
        </div>
      </nav>
    </header>
  );
}
