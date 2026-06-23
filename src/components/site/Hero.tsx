'use client';

import { motion } from 'motion/react';
import { AbstractBackdrop } from './AbstractBackdrop';
import { wordReveal, stagger, fadeUp } from '@/lib/motion';
import { LoadingLink } from '@/components/LoadingLink';
import type { HostSpec } from '@/lib/inventory';

interface Props {
  containerCount: number;
  host: HostSpec;
}

const LINE_1 = ['A', 'homelab,'];
const LINE_2 = ['documented', 'properly.'];

export function Hero({ containerCount, host }: Props) {
  return (
    <section className="relative min-h-[88vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden"
      style={{ background: '#080808' }}
    >
      <AbstractBackdrop rings />

      <motion.div
        className="relative z-10 flex flex-col items-center"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* status pill */}
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
          </span>
          <span className="text-xs font-mono" style={{ color: '#a1a1aa' }}>
            All systems operational · Proxmox VE {host.proxmox_version}
          </span>
        </motion.div>

        {/* headline */}
        <h1 className="text-5xl! sm:text-6xl! md:text-7xl! font-extrabold! tracking-tight leading-[0.95] text-white">
          <motion.span className="block" variants={stagger}>
            {LINE_1.map((w) => (
              <motion.span key={w} variants={wordReveal} className="inline-block mr-[0.25em]">
                {w}
              </motion.span>
            ))}
          </motion.span>
          <motion.span className="block" variants={stagger} style={{ color: '#52525b' }}>
            {LINE_2.map((w) => (
              <motion.span key={w} variants={wordReveal} className="inline-block mr-[0.25em]">
                {w}
              </motion.span>
            ))}
          </motion.span>
        </h1>

        {/* sub */}
        <motion.p
          variants={fadeUp}
          className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed"
          style={{ color: '#a1a1aa' }}
        >
          A {host.model} running {host.services_summary}
          {' '}and {containerCount} containers in total — every box,
          network and decision written down.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <LoadingLink
            href="/docs"
            className="group inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            style={{ background: '#ffffff', color: '#000000' }}
          >
            Read the docs
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </LoadingLink>
          <a
            href="https://github.com"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm transition-all hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#a1a1aa',
            }}
          >
            View on GitHub
          </a>
        </motion.div>
      </motion.div>

      {/* scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{ color: '#52525b' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        aria-hidden="true"
      >
        <span className="block text-[10px] tracking-widest uppercase mb-1">Scroll</span>
        <span className="block text-center motion-safe:animate-bounce">↓</span>
      </motion.div>
    </section>
  );
}
