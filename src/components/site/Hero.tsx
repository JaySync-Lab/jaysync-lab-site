'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { AbstractBackdrop } from './AbstractBackdrop';
import { wordReveal, stagger, fadeUp } from '@/lib/motion';

interface Props {
  containerCount: number;
}

const LINE_1 = ['A', 'homelab,'];
const LINE_2 = ['documented', 'properly.'];

export function Hero({ containerCount }: Props) {
  return (
    <section className="relative min-h-[88vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
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
          className="inline-flex items-center gap-2 rounded-full border border-[#60a5fa]/20 bg-[#60a5fa]/[0.08] px-4 py-1.5 mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
          </span>
          <span className="text-xs text-[#93c5fd]">All systems operational · Proxmox VE 9.2</span>
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
          <motion.span className="block bg-gradient-to-r from-[#60a5fa] via-[#3b82f6] to-[#2563eb] bg-clip-text text-transparent" variants={stagger}>
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
          className="mt-6 max-w-xl text-base sm:text-lg text-[#94a3b8] leading-relaxed"
        >
          An HP ProDesk 400 G3 running Pi-hole, Home Assistant, GPU-passthrough
          media streaming and {containerCount} containers in total — every box,
          network and decision written down.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/docs"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#3b82f6] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_-8px_rgba(37,99,235,0.65)] hover:shadow-[0_16px_40px_-6px_rgba(37,99,235,0.9)] hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa]"
          >
            Read the docs
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
          <a
            href="https://github.com"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm text-[#cbd5e1] hover:bg-white/[0.06] hover:border-white/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa]"
          >
            View on GitHub
          </a>
        </motion.div>
      </motion.div>

      {/* scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#475569]"
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
