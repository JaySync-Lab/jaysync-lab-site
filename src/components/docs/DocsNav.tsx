'use client';

import Link from 'next/link';

export function DocsNav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{
        background: 'rgba(8,8,8,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <Link
        href="/"
        className="font-mono text-sm transition-colors hover:text-white"
        style={{ color: '#a1a1aa' }}
      >
        ← JaySync-Lab
      </Link>
      <Link
        href="/docs/infrastructure/hardware"
        className="font-mono text-sm px-4 py-1.5 rounded-lg transition-colors hover:opacity-80"
        style={{
          color: '#ffffff',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
      >
        Read the docs →
      </Link>
    </nav>
  );
}
