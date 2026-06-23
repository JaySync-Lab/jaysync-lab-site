'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { stagger, fadeUp } from '@/lib/motion';
import { LoadingLink } from '@/components/LoadingLink';

export function DocsHero() {
  return (
    <section
      className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6"
      style={{ background: '#080808' }}
    >
      {/* noise texture */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.04,
        }}
      />
      {/* radial depth */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.03), transparent)',
        }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 max-w-3xl"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.span
          variants={fadeUp}
          className="font-mono text-xs uppercase tracking-[0.2em] px-4 py-1.5 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: '#a1a1aa',
          }}
        >
          Documentation
        </motion.span>

        <motion.h1
          variants={fadeUp}
          className="font-extrabold leading-[0.95] tracking-tight text-white"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}
        >
          Everything documented.
          <br />
          <span style={{ color: '#52525b' }}>Nothing guessed.</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-lg max-w-md leading-relaxed"
          style={{ color: '#a1a1aa' }}
        >
          One box. Five services. Every decision written down.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center justify-center gap-3 mt-2"
        >
          <LoadingLink
            href="/docs/infrastructure/hardware"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-85"
            style={{ background: '#ffffff', color: '#000000' }}
          >
            Read the docs →
          </LoadingLink>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm transition-colors hover:text-white"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#a1a1aa',
            }}
          >
            ← Back to site
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
