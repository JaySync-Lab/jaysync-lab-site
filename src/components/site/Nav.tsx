'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LoadingLink } from '@/components/LoadingLink';

const GITHUB_URL = 'https://github.com/Anuja-jayasinghe/JaySync-Lab';
const DOCS_URL   = '/docs/infrastructure/hardware';

const NAV_LINKS = [
  { href: '/services',     label: 'Services'      },
  { href: '/architecture', label: 'Architecture'  },
  { href: '/changelog',    label: 'Changelog'     },
];

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close menu on route change (any click inside nav)
  function closeMobile() { setMobileOpen(false); }

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={
        scrolled || mobileOpen
          ? {
              background: 'rgba(8,8,8,0.92)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
            }
          : {
              background: 'transparent',
              borderBottom: '1px solid transparent',
            }
      }
    >
      {/* main bar */}
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* logo */}
        <Link
          href="/"
          onClick={closeMobile}
          className="shrink-0 text-[15px] font-bold tracking-tight text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded"
        >
          Jay<span style={{ color: '#52525b' }}>Sync</span> Lab
        </Link>

        {/* desktop nav links */}
        <ul className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="px-3 py-2 text-sm rounded-lg transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                style={{ color: '#71717a' }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* right-side CTAs */}
        <div className="flex items-center gap-2 shrink-0">
          {/* GitHub — always visible */}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View JaySync-Lab on GitHub"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-all hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            style={{
              color: '#71717a',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <GitHubIcon />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          {/* Docs CTA */}
          <LoadingLink
            href={DOCS_URL}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            style={{
              color: '#ffffff',
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            Docs
            <span className="text-[#71717a] transition-transform group-hover:translate-x-0.5">→</span>
          </LoadingLink>

          {/* mobile hamburger */}
          <button
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            style={{ color: '#71717a' }}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* mobile dropdown */}
      {mobileOpen && (
        <div
          className="md:hidden border-t px-6 pb-4 pt-3 flex flex-col gap-1"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={closeMobile}
              className="block px-3 py-2.5 text-sm rounded-lg transition-colors hover:text-white"
              style={{ color: '#71717a' }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
