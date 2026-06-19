'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const NAV_LINKS = [
  { href: '/services', label: 'Services' },
  { href: '/architecture', label: 'Architecture' },
  { href: '/changelog', label: 'Changelog' },
];

/**
 * Site-zone navigation. Transparent at the top of the page; on scroll it
 * gains a blurred glass surface and a hairline border.
 */
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
      className={
        'sticky top-0 z-50 transition-all duration-300 ' +
        (scrolled
          ? 'border-b border-[#1e293b] bg-[#0a0f1f]/80 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent')
      }
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-[15px] font-bold tracking-tight text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] rounded"
        >
          Jay<span className="text-[#60a5fa]">Sync</span> Lab
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <ul className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="px-3 py-2 text-sm text-[#94a3b8] hover:text-white transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/docs"
            className="ml-1 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-br from-[#2563eb] to-[#3b82f6] shadow-[0_8px_24px_-8px_rgba(37,99,235,0.7)] hover:shadow-[0_10px_28px_-6px_rgba(37,99,235,0.9)] hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa]"
          >
            Enter docs →
          </Link>
        </div>
      </nav>
    </header>
  );
}
